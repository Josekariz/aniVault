/** Wire types for AniList GraphQL Media fragments we request. */
export interface AniListTitle {
  romaji: string | null;
  english: string | null;
  native: string | null;
}

export interface AniListCoverImage {
  large: string | null;
}

export interface AniListFuzzyDate {
  year: number | null;
  month: number | null;
  day: number | null;
}

export interface AniListMediaListNode {
  id: number;
  type?: "ANIME" | "MANGA" | string | null;
  title: AniListTitle;
  coverImage: AniListCoverImage | null;
  bannerImage: string | null;
  format: string | null;
  status: string | null;
  episodes: number | null;
  averageScore: number | null;
  genres: string[] | null;
  seasonYear: number | null;
}

export interface AniListTrailer {
  id: string | null;
  site: string | null;
  thumbnail: string | null;
}

export interface AniListMediaDetail extends AniListMediaListNode {
  description: string | null;
  duration: number | null;
  source: string | null;
  season: string | null;
  studios: {
    nodes: { name: string }[] | null;
  } | null;
  startDate: AniListFuzzyDate | null;
  endDate: AniListFuzzyDate | null;
  trailer: AniListTrailer | null;
  relations: {
    edges:
      | {
          relationType: string;
          node: AniListMediaListNode | null;
        }[]
      | null;
  } | null;
  recommendations: {
    nodes:
      | {
          rating: number | null;
          mediaRecommendation: AniListMediaListNode | null;
        }[]
      | null;
  } | null;
}

export interface AniListPagePayload {
  Page: {
    pageInfo: {
      total: number;
      currentPage: number;
      lastPage: number;
      hasNextPage: boolean;
    };
    media: AniListMediaListNode[] | null;
  };
}

export interface AniListMediaPayload {
  Media: AniListMediaDetail | null;
}
