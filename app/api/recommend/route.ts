import { NextRequest, NextResponse } from "next/server";

import { GeminiError, getGeminiRecommendations } from "@/lib/gemini";
import { getAnimes, getSimilarAnime } from "@/lib/shikimori";
import type {
  RecommendErrorResponse,
  RecommendRequestBody,
  RecommendSuccessResponse,
  RecommendationItem,
} from "@/types/recommend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
        record.excludeIds.every((id) => typeof id === "number")))
  );
}

async function resolveShikimoriIds(
  recommendations: RecommendationItem[]
): Promise<RecommendationItem[]> {
  const resolved: RecommendationItem[] = [];
  for (const item of recommendations.slice(0, 3)) {
    try {
      const matches = await getAnimes({
        search: item.title,
        limit: 1,
        order: "popularity",
      });
      const match = matches[0];
      resolved.push(
        match
          ? { ...item, title: match.name, shikimoriId: match.id }
          : item
      );
    } catch {
      resolved.push(item);
    }
  }
  return resolved;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

async function buildFallback(
  animeId: number,
  options?: {
    reply?: string;
    excludeIds?: number[];
  }
): Promise<RecommendSuccessResponse> {
  const exclude = new Set(options?.excludeIds ?? []);
  exclude.add(animeId);

  try {
    const similar = await getSimilarAnime(animeId);
    const fresh = shuffle(similar.filter((item) => !exclude.has(item.id)));
    if (fresh.length > 0) {
      return {
        source: "fallback",
        reply:
          options?.reply ??
          "Fresh catalog picks from Shikimori — no Gemini call.",
        message: "Shikimori similar titles (no AI).",
        recommendations: fresh.slice(0, 3).map((anime) => ({
          title: anime.name,
          reason: "Similar on Shikimori.",
          shikimoriId: anime.id,
        })),
      };
    }
  } catch {
    // fall through
  }

  const page = 1 + Math.floor(Math.random() * 5);
  const trending = await getAnimes({
    page,
    limit: 12,
    order: "popularity",
    exclude_ids: Array.from(exclude).join(","),
  });

  const picks = shuffle(trending.filter((item) => !exclude.has(item.id))).slice(
    0,
    3
  );

  return {
    source: "fallback",
    reply:
      options?.reply ?? "Here are other popular titles from the catalog.",
    message: "Trending catalog picks (no AI).",
    recommendations: picks.map((anime) => ({
      title: anime.name,
      reason: "Popular on Shikimori.",
      shikimoriId: anime.id,
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

  if (!body.useGemini) {
    const fallback = await buildFallback(body.animeId, {
      excludeIds: body.excludeIds,
    });
    return NextResponse.json(fallback);
  }

  try {
    const result = await getGeminiRecommendations({
      name: body.name,
      genres: body.genres,
      synopsis: body.synopsis,
      message: body.message,
    });
    const recommendations = await resolveShikimoriIds(result.recommendations);

    const success: RecommendSuccessResponse = {
      source: "gemini",
      reply: result.reply,
      recommendations,
    };
    return NextResponse.json(success);
  } catch (error) {
    const code = error instanceof GeminiError ? error.code : "upstream";
    const detail =
      error instanceof GeminiError
        ? error.message
        : "Unknown upstream error";

    try {
      const fallback = await buildFallback(body.animeId, {
        excludeIds: body.excludeIds,
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
