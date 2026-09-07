import { NextRequest, NextResponse } from "next/server";

import {
  canAffordAniListRequest,
  getAnimes,
  resolveAnimeByTitle,
} from "@/lib/anilist";
import { GeminiError, getGeminiRecommendations } from "@/lib/gemini";
import type {
  RecommendErrorResponse,
  RecommendRequestBody,
  RecommendSuccessResponse,
  RecommendationItem,
  SeedRecommendation,
} from "@/types/recommend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Soft cap — never burn more than this many title lookups per recommend call. */
const MAX_TITLE_RESOLVES = 2;
const MAX_RECS = 3;

function isSeedRecommendation(value: unknown): value is SeedRecommendation {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.anilistId === "number" &&
    Number.isFinite(record.anilistId) &&
    typeof record.title === "string" &&
    record.title.trim().length > 0 &&
    (record.reason === undefined || typeof record.reason === "string")
  );
}

function isValidBody(body: unknown): body is RecommendRequestBody {
  if (!body || typeof body !== "object") return false;
  const record = body as Record<string, unknown>;
  return (
    typeof record.animeId === "number" &&
    Number.isFinite(record.animeId) &&
    typeof record.name === "string" &&
    record.name.trim().length > 0 &&
    Array.isArray(record.genres) &&
    record.genres.every((genre) => typeof genre === "string") &&
    (record.message === undefined || typeof record.message === "string") &&
    (record.useGemini === undefined || typeof record.useGemini === "boolean") &&
    (record.excludeIds === undefined ||
      (Array.isArray(record.excludeIds) &&
        record.excludeIds.every((id) => typeof id === "number"))) &&
    (record.seedRecommendations === undefined ||
      (Array.isArray(record.seedRecommendations) &&
        record.seedRecommendations.every(isSeedRecommendation)))
  );
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Resolve Gemini titles → AniList ids with a hard per-request cap.
 * Soft-fail: drop unresolved titles (no retry, no keep-without-id).
 */
async function resolveAniListIds(
  recommendations: RecommendationItem[]
): Promise<RecommendationItem[]> {
  const resolved: RecommendationItem[] = [];
  let resolveAttempts = 0;

  for (const item of recommendations.slice(0, MAX_RECS)) {
    if (item.anilistId) {
      resolved.push(item);
      continue;
    }

    if (resolveAttempts >= MAX_TITLE_RESOLVES) {
      // Cap hit — drop remaining unresolved titles.
      continue;
    }

    if (!canAffordAniListRequest()) {
      // Budget too low — drop rather than risk 429s.
      continue;
    }

    resolveAttempts += 1;
    try {
      const match = await resolveAnimeByTitle(item.title);
      if (match) {
        resolved.push({
          ...item,
          title: match.displayTitle,
          anilistId: match.id,
        });
      }
      // No match → soft-drop (do not push untitled / unlinkable item).
    } catch {
      // Soft-drop on error — do not retry.
    }
  }

  return resolved;
}

function picksFromSeeds(
  seeds: SeedRecommendation[] | undefined,
  exclude: Set<number>,
  limit = MAX_RECS
): RecommendationItem[] {
  if (!seeds?.length) return [];

  const fresh = shuffle(
    seeds.filter((seed) => !exclude.has(seed.anilistId))
  ).slice(0, limit);

  return fresh.map((seed) => ({
    title: seed.title,
    reason: seed.reason?.trim() || "Recommended on AniList.",
    anilistId: seed.anilistId,
  }));
}

/**
 * Fallback chain (no Gemini):
 * 1. Seed recommendations from the detail page (zero AniList calls)
 * 2. Trending Page query — only if budget allows
 * Never re-fetches Media detail when seeds were provided.
 */
async function buildFallback(
  animeId: number,
  options?: {
    reply?: string;
    excludeIds?: number[];
    seeds?: SeedRecommendation[];
  }
): Promise<RecommendSuccessResponse> {
  const exclude = new Set(options?.excludeIds ?? []);
  exclude.add(animeId);

  const fromSeeds = picksFromSeeds(options?.seeds, exclude);
  if (fromSeeds.length > 0) {
    return {
      source: "fallback",
      reply:
        options?.reply ??
        "Fresh catalog picks from AniList — no Gemini call.",
      message: "AniList recommendations (seeded from detail page).",
      recommendations: fromSeeds,
    };
  }

  // Seeds exhausted or absent — try trending only when we can afford it.
  if (!canAffordAniListRequest()) {
    // Last resort: reshuffle seeds including already-shown (still zero network).
    const recycled = picksFromSeeds(
      options?.seeds,
      new Set([animeId]),
      MAX_RECS
    );
    if (recycled.length > 0) {
      return {
        source: "fallback",
        reply:
          options?.reply ??
          "Showing AniList picks again — catalog refresh is paused to save quota.",
        message: "Seed recycle (AniList budget low).",
        recommendations: recycled,
      };
    }

    throw new Error("AniList budget too low for trending fallback.");
  }

  const page = 1 + Math.floor(Math.random() * 5);
  const trending = await getAnimes({
    page,
    limit: 12,
    sort: "POPULARITY_DESC",
    excludeIds: Array.from(exclude),
  });

  const picks = shuffle(trending.filter((item) => !exclude.has(item.id))).slice(
    0,
    MAX_RECS
  );

  if (picks.length === 0) {
    throw new Error("No trending picks available.");
  }

  return {
    source: "fallback",
    reply:
      options?.reply ?? "Here are other popular titles from the catalog.",
    message: "Trending catalog picks (no AI).",
    recommendations: picks.map((anime) => ({
      title: anime.displayTitle,
      reason: "Popular on AniList.",
      anilistId: anime.id,
    })),
  };
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    const error: RecommendErrorResponse = {
      error: "Invalid JSON body.",
      code: "invalid_response",
    };
    return NextResponse.json(error, { status: 400 });
  }

  if (!isValidBody(body)) {
    const error: RecommendErrorResponse = {
      error: "Expected animeId, name, and genres.",
      code: "invalid_response",
    };
    return NextResponse.json(error, { status: 400 });
  }

  const fallbackOpts = {
    excludeIds: body.excludeIds,
    seeds: body.seedRecommendations,
  };

  if (!body.useGemini) {
    try {
      const fallback = await buildFallback(body.animeId, fallbackOpts);
      return NextResponse.json(fallback);
    } catch {
      const error: RecommendErrorResponse = {
        error: "Catalog recommendations unavailable right now.",
        code: "rate_limit",
      };
      return NextResponse.json(error, { status: 503 });
    }
  }

  try {
    const result = await getGeminiRecommendations({
      name: body.name,
      genres: body.genres,
      synopsis: body.synopsis,
      message: body.message,
    });
    const recommendations = await resolveAniListIds(result.recommendations);

    if (recommendations.length > 0) {
      const success: RecommendSuccessResponse = {
        source: "gemini",
        reply: result.reply,
        recommendations,
      };
      return NextResponse.json(success);
    }

    // Gemini returned names we couldn't resolve — degrade to catalog seeds/trending.
    const fallback = await buildFallback(body.animeId, {
      ...fallbackOpts,
      reply:
        "Couldn't link those AI titles to AniList. Here are catalog picks instead.",
    });
    fallback.message = `${fallback.message} — unresolved Gemini titles dropped.`;
    return NextResponse.json(fallback);
  } catch (error) {
    const code = error instanceof GeminiError ? error.code : "upstream";
    const detail =
      error instanceof GeminiError
        ? error.message
        : "Unknown upstream error";

    try {
      const fallback = await buildFallback(body.animeId, {
        ...fallbackOpts,
        reply: `Gemini unavailable (${code}). Showing catalog picks instead.`,
      });
      fallback.message = `${fallback.message} — ${detail}`;
      return NextResponse.json(fallback);
    } catch {
      const response: RecommendErrorResponse = {
        error: `Recommendations unavailable (${code}).`,
        code,
      };
      const status =
        error instanceof GeminiError && error.code === "rate_limit"
          ? 429
          : 503;
      return NextResponse.json(response, { status });
    }
  }
}
