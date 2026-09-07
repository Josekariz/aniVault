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
}

export interface RecommendSuccessResponse {
  source: "gemini" | "fallback";
  recommendations: RecommendationItem[];
  message?: string;
}

export interface RecommendErrorResponse {
  error: string;
  code?: "missing_key" | "rate_limit" | "upstream" | "invalid_response";
}
