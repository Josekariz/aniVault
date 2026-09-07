import type {
  AnimeDetail,
  AnimeListItem,
  AnimeRelated,
  FetchAnimeParams,
  Genre,
} from "@/types/anime";

export const SHIKIMORI_ORIGIN = "https://shikimori.one";
const API_BASE = `${SHIKIMORI_ORIGIN}/api`;

export class ShikimoriError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ShikimoriError";
    this.status = status;
  }
}

function buildQuery(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    query.set(key, String(value));
  }

  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

async function shikimoriFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "User-Agent": "AniVault (https://github.com/local/anivault)",
      ...init?.headers,
    },
    // List/detail data changes; avoid stale infinite-scroll pages.
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new ShikimoriError(
      `Shikimori request failed: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  return response.json() as Promise<T>;
}

export function shikimoriImageUrl(path: string | null | undefined): string {
  if (!path) return "/logo.svg";
  if (path.startsWith("http")) return path;
  return `${SHIKIMORI_ORIGIN}${path}`;
}

export async function getAnimes(
  params: FetchAnimeParams = {}
): Promise<AnimeListItem[]> {
  const {
    page = 1,
    limit = 8,
    order = "popularity",
    search,
    genre,
    kind,
    status,
    score,
  } = params;

  const query = buildQuery({
    page,
    limit: Math.min(limit, 50),
    order,
    search,
    genre,
    kind,
    status,
    score,
  });

  return shikimoriFetch<AnimeListItem[]>(`/animes${query}`);
}

export async function getAnimeById(id: string | number): Promise<AnimeDetail> {
  return shikimoriFetch<AnimeDetail>(`/animes/${id}`);
}

export async function getSimilarAnime(
  id: string | number
): Promise<AnimeListItem[]> {
  return shikimoriFetch<AnimeListItem[]>(`/animes/${id}/similar`);
}

export async function getRelatedAnime(
  id: string | number
): Promise<AnimeRelated[]> {
  return shikimoriFetch<AnimeRelated[]>(`/animes/${id}/related`);
}

export async function getGenres(): Promise<Genre[]> {
  const genres = await shikimoriFetch<Genre[]>("/genres");
  return genres.filter((genre) => genre.kind === "anime");
}
