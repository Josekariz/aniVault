export interface RecommendationItem {
  title: string;
  reason: string;
  /** Optional Shikimori id when Gemini or post-processing resolves one. */
  shikimoriId?: number;
}

export interface RecommendRequestBody {
  animeId: number;
  name: string;
  genres: string[];
  synopsis?: string | null;
  /** Free-form chat preference from the bubble. */
  message?: string;
  /**
   * When false/omitted, skip Gemini and return Shikimori similar/trending only.
   * Keep Gemini opt-in to conserve quota.
   */
  useGemini?: boolean;
  /** Already-shown ids so "refresh" returns different catalog picks. */
  excludeIds?: number[];
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
