export interface ShikimoriImage {
  original: string;
  preview: string;
  x96: string;
  x48: string;
}

/** Compact anime object returned by list/search/similar endpoints. */
export interface AnimeListItem {
  id: number;
  name: string;
  russian: string | null;
  image: ShikimoriImage;
  url: string;
  kind: string | null;
  score: string;
  status: string | null;
  episodes: number;
  episodes_aired: number;
  aired_on: string | null;
  released_on: string | null;
}

export interface AnimeGenre {
  id: number;
  name: string;
  russian: string;
  kind: string;
}

export interface AnimeStudio {
  id: number;
  name: string;
  filtered_name: string;
  real: boolean;
  image: string | null;
}

/** Full anime object returned by GET /api/animes/:id */
export interface AnimeDetail extends AnimeListItem {
  rating: string | null;
  english: (string | null)[];
  japanese: (string | null)[];
  synonyms: string[];
  license_name_ru: string | null;
  duration: number;
  description: string | null;
  description_html: string | null;
  description_source: string | null;
  franchise: string | null;
  favoured: boolean;
  anons: boolean;
  ongoing: boolean;
  thread_id: number | null;
  topic_id: number | null;
  myanimelist_id: number | null;
  updated_at: string;
  next_episode_at: string | null;
  genres: AnimeGenre[];
  studios: AnimeStudio[];
  screenshots: { original: string; preview: string }[];
  videos: {
    id: number;
    url: string;
    image_url: string;
    player_url: string;
    name: string | null;
    kind: string;
    hosting: string;
  }[];
}

export interface AnimeRelated {
  relation: string;
  relation_russian: string;
  anime: AnimeListItem | null;
  manga: unknown | null;
}

export interface Genre {
  id: number;
  name: string;
  russian: string;
  kind: "anime" | "manga" | string;
}

export type AnimeOrder =
  | "id"
  | "id_desc"
  | "ranked"
  | "kind"
  | "popularity"
  | "name"
  | "aired_on"
  | "episodes"
  | "status"
  | "random"
  | "created_at"
  | "created_at_desc"
  | "updated_at"
  | "updated_at_desc";

export interface FetchAnimeParams {
  page?: number;
  limit?: number;
  order?: AnimeOrder;
  search?: string;
  genre?: string;
  kind?: string;
  status?: string;
  score?: number;
}
