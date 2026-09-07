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
    record.genres.every((genre) => typeof genre === "string")
  );
}

async function resolveShikimoriIds(
  recommendations: RecommendationItem[]
): Promise<RecommendationItem[]> {
  return Promise.all(
    recommendations.map(async (item) => {
      try {
        const matches = await getAnimes({
          search: item.title,
          limit: 1,
          order: "popularity",
        });
        const match = matches[0];
        if (!match) return item;
        return {
          ...item,
          title: match.name,
          shikimoriId: match.id,
        };
      } catch {
        return item;
      }
    })
  );
}

async function buildFallback(
  animeId: number
): Promise<RecommendSuccessResponse> {
  try {
    const similar = await getSimilarAnime(animeId);
    if (similar.length > 0) {
      return {
        source: "fallback",
        message:
          "AI recommendations unavailable — showing Shikimori similar titles instead.",
        recommendations: similar.slice(0, 4).map((anime) => ({
          title: anime.name,
          reason: "Listed as similar on Shikimori.",
          shikimoriId: anime.id,
        })),
      };
    }
  } catch {
    // fall through to trending
  }

  const trending = await getAnimes({
    page: 1,
    limit: 4,
    order: "popularity",
  });

  return {
    source: "fallback",
    message:
      "AI recommendations unavailable — showing trending titles instead.",
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

  try {
    const raw = await getGeminiRecommendations({
      name: body.name,
      genres: body.genres,
      synopsis: body.synopsis,
    });
    const recommendations = await resolveShikimoriIds(raw);

    const success: RecommendSuccessResponse = {
      source: "gemini",
      recommendations,
    };
    return NextResponse.json(success);
  } catch (error) {
    try {
      const fallback = await buildFallback(body.animeId);
      if (error instanceof GeminiError) {
        fallback.message = `${fallback.message} (${error.code})`;
      }
      return NextResponse.json(fallback);
    } catch {
      const response: RecommendErrorResponse = {
        error: "Recommendations are temporarily unavailable.",
        code:
          error instanceof GeminiError ? error.code : "upstream",
      };
      const status =
        error instanceof GeminiError && error.code === "rate_limit"
          ? 429
          : 503;
      return NextResponse.json(response, { status });
    }
  }
}
