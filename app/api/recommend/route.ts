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
    (record.useGemini === undefined || typeof record.useGemini === "boolean")
  );
}

async function resolveShikimoriIds(
  recommendations: RecommendationItem[]
): Promise<RecommendationItem[]> {
  // Sequential + capped — avoid fan-out search traffic for every suggestion.
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

async function buildFallback(
  animeId: number,
  reply?: string
): Promise<RecommendSuccessResponse> {
  try {
    const similar = await getSimilarAnime(animeId);
    if (similar.length > 0) {
      return {
        source: "fallback",
        reply:
          reply ??
          "Here are similar titles from Shikimori — no AI call used.",
        message:
          "Showing Shikimori similar titles (Gemini skipped or unavailable).",
        recommendations: similar.slice(0, 3).map((anime) => ({
          title: anime.name,
          reason: "Listed as similar on Shikimori.",
          shikimoriId: anime.id,
        })),
      };
    }
  } catch {
    // fall through
  }

  const trending = await getAnimes({
    page: 1,
    limit: 3,
    order: "popularity",
  });

  return {
    source: "fallback",
    reply: reply ?? "Here are trending titles from the catalog.",
    message: "Showing trending titles (Gemini skipped or unavailable).",
    recommendations: trending.map((anime) => ({
      title: anime.name,
      reason: "Currently popular on Shikimori.",
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

  // Default path: free catalog fallback — Gemini only when explicitly requested.
  if (!body.useGemini) {
    const fallback = await buildFallback(body.animeId);
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
    try {
      const fallback = await buildFallback(
        body.animeId,
        "AI is unavailable right now, so I pulled catalog matches instead."
      );
      if (error instanceof GeminiError) {
        fallback.message = `${fallback.message} (${error.code})`;
      }
      return NextResponse.json(fallback);
    } catch {
      const response: RecommendErrorResponse = {
        error: "Recommendations are temporarily unavailable.",
        code: error instanceof GeminiError ? error.code : "upstream",
      };
      const status =
        error instanceof GeminiError && error.code === "rate_limit"
          ? 429
          : 503;
      return NextResponse.json(response, { status });
    }
  }
}
