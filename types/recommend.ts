export interface RecommendationItem {
  title: string;
  reason: string;
  /** Optional AniList id when Gemini or post-processing resolves one. */
  anilistId?: number;
}

/** Compact seeds from the detail page Media.recommendations (already fetched). */
export interface SeedRecommendation {
  anilistId: number;
  title: string;
  reason?: string;
}

export interface RecommendRequestBody {
  animeId: number;
  name: string;
  genres: string[];
  synopsis?: string | null;
  /** Free-form chat preference from the bubble. */
  message?: string;
  /**
   * When false/omitted, skip Gemini and return AniList recommendations/trending only.
   * Keep Gemini opt-in to conserve quota.
   */
  useGemini?: boolean;
  /** Already-shown ids so "refresh" returns different catalog picks. */
  excludeIds?: number[];
  /**
   * Detail-page AniList recommendations. Prefer these over re-fetching Media.
   */
  seedRecommendations?: SeedRecommendation[];
}

export interface RecommendSuccessResponse {
  source: "gemini" | "fallback";
  recommendations: RecommendationItem[];
  message?: string;
  reply?: string;
}

export interface RecommendErrorResponse {
  error: string;
  code?: "missing_key" | "rate_limit" | "upstream" | "invalid_response";
}
