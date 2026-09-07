/** AniList title object — display via `getDisplayTitle` / `displayTitle`. */
export interface AnimeTitle {
  romaji: string | null;
  english: string | null;
  native: string | null;
}

export interface FuzzyDate {
  year: number | null;
  month: number | null;
  day: number | null;
}

export interface AnimeTrailer {
  id: string | null;
  site: string | null;
  thumbnail: string | null;
}

/** Compact anime used in grids, search, relations, and recommendations. */
export interface AnimeListItem {
  id: number;
  title: AnimeTitle;
  /** english ?? romaji ?? native */
  displayTitle: string;
  coverImage: string | null;
  bannerImage: string | null;
  format: string | null;
  status: string | null;
  episodes: number | null;
  /** Raw AniList averageScore, integer 0–100. Convert at render time. */
  averageScore: number | null;
  genres: string[];
  seasonYear: number | null;
}

export interface AnimeRelation {
  relationType: string;
  anime: AnimeListItem;
}

export interface AnimeRecommendation {
  rating: number;
  anime: AnimeListItem;
}

/** Full Media payload for the detail page. */
export interface AnimeDetail extends AnimeListItem {
  description: string | null;
  duration: number | null;
  source: string | null;
  season: string | null;
  studios: string[];
  startDate: FuzzyDate | null;
  endDate: FuzzyDate | null;
  trailer: AnimeTrailer | null;
  relations: AnimeRelation[];
  recommendations: AnimeRecommendation[];
}

export type AnimeSort =
  | "POPULARITY_DESC"
  | "SCORE_DESC"
  | "TRENDING_DESC"
  | "TITLE_ROMAJI"
  | "START_DATE_DESC"
  | "EPISODES_DESC";

export interface FetchAnimeParams {
  page?: number;
  /** Maps to AniList Page.perPage (max 50). */
  limit?: number;
  search?: string;
  /** AniList genre name, e.g. "Action". */
  genre?: string;
  sort?: AnimeSort;
  /** Media ids to skip when building fallbacks (client-side filter). */
  excludeIds?: number[];
}

export interface PageInfo {
  total: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
}

export interface AnimePageResult {
  pageInfo: PageInfo;
  media: AnimeListItem[];
}
