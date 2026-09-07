const ANILIST_ENDPOINT = "https://graphql.anilist.co";
const FETCH_TIMEOUT_MS = 10_000;
/** Docs checked 2026-09-07: still degraded to 30 req/min (normal is 90). */
const ASSUMED_LIMIT_PER_MINUTE = 30;
const LOW_REMAINING_THRESHOLD = 3;

export class AniListError extends Error {
  status: number;
  code: "rate_limit" | "upstream" | "graphql" | "timeout" | "not_found";
  retryAfterSeconds?: number;

  constructor(
    message: string,
    status: number,
    code: AniListError["code"],
    retryAfterSeconds?: number
  ) {
    super(message);
    this.name = "AniListError";
    this.status = status;
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

interface GraphQLErrorItem {
  message?: string;
  status?: number;
}

interface GraphQLEnvelope<T> {
  data?: T | null;
  errors?: GraphQLErrorItem[];
}

interface RateLimitState {
  remaining: number;
  limit: number;
  resetAtMs: number | null;
}

/** Process-local hint — helpful within a warm serverless isolate / long-lived node process. */
const rateLimitState: RateLimitState = {
  remaining: ASSUMED_LIMIT_PER_MINUTE,
  limit: ASSUMED_LIMIT_PER_MINUTE,
  resetAtMs: null,
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseHeaderInt(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function updateRateLimitFromHeaders(headers: Headers) {
  const remaining = parseHeaderInt(headers.get("X-RateLimit-Remaining"));
  const limit = parseHeaderInt(headers.get("X-RateLimit-Limit"));
  const resetUnix = parseHeaderInt(headers.get("X-RateLimit-Reset"));

  if (remaining != null) rateLimitState.remaining = remaining;
  if (limit != null) rateLimitState.limit = limit;
  if (resetUnix != null) rateLimitState.resetAtMs = resetUnix * 1000;
}

async function waitIfNearLimit() {
  if (rateLimitState.remaining > LOW_REMAINING_THRESHOLD) return;

  const now = Date.now();
  const resetAt = rateLimitState.resetAtMs;
  if (resetAt && resetAt > now) {
    const waitMs = Math.min(resetAt - now + 50, 60_000);
    await sleep(waitMs);
  } else {
    // No reset timestamp yet — brief pause to avoid burst limiter.
    await sleep(1_200);
  }
}

export function getAniListRateLimitSnapshot(): Readonly<RateLimitState> {
  return { ...rateLimitState };
}

/** True when the process-local remaining budget is above the soft floor. */
export function canAffordAniListRequest(
  minRemaining = LOW_REMAINING_THRESHOLD
): boolean {
  return rateLimitState.remaining > minRemaining;
}

export async function anilistRequest<T>(
  query: string,
  variables: Record<string, unknown> = {},
  init?: { revalidate?: number | false; cache?: RequestCache }
): Promise<T> {
  await waitIfNearLimit();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  const nextOption =
    init?.revalidate === false
      ? { cache: "no-store" as const }
      : { next: { revalidate: init?.revalidate ?? 120 } };

  try {
    const response = await fetch(ANILIST_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
      ...nextOption,
      ...(init?.cache ? { cache: init.cache } : {}),
    });

    updateRateLimitFromHeaders(response.headers);

    if (response.status === 429) {
      const retryAfter =
        parseHeaderInt(response.headers.get("Retry-After")) ?? 60;
      const resetUnix = parseHeaderInt(response.headers.get("X-RateLimit-Reset"));
      if (resetUnix != null) rateLimitState.resetAtMs = resetUnix * 1000;
      rateLimitState.remaining = 0;

      throw new AniListError(
        `AniList rate limit exceeded. Retry after ${retryAfter}s.`,
        429,
        "rate_limit",
        retryAfter
      );
    }

    let envelope: GraphQLEnvelope<T>;
    try {
      envelope = (await response.json()) as GraphQLEnvelope<T>;
    } catch {
      throw new AniListError(
        "AniList returned a non-JSON response.",
        response.status || 502,
        "upstream"
      );
    }

    // AniList often returns HTTP 200 with GraphQL errors in the body.
    if (envelope.errors?.length) {
      const first = envelope.errors[0];
      const status = first.status ?? response.status ?? 502;
      const message = first.message ?? "AniList GraphQL error";

      if (status === 429 || /too many requests/i.test(message)) {
        throw new AniListError(message, 429, "rate_limit");
      }
      if (status === 404 || /not found/i.test(message)) {
        throw new AniListError(message, 404, "not_found");
      }

      throw new AniListError(message, status, "graphql");
    }

    if (!response.ok) {
      throw new AniListError(
        `AniList request failed: ${response.status} ${response.statusText}`,
        response.status,
        "upstream"
      );
    }

    if (envelope.data == null) {
      throw new AniListError(
        "AniList returned an empty data payload.",
        502,
        "upstream"
      );
    }

    return envelope.data;
  } catch (error) {
    if (error instanceof AniListError) throw error;

    if (error instanceof Error && error.name === "AbortError") {
      throw new AniListError("AniList request timed out.", 504, "timeout");
    }

    throw new AniListError(
      error instanceof Error ? error.message : "AniList request failed",
      502,
      "upstream"
    );
  } finally {
    clearTimeout(timeout);
  }
}
