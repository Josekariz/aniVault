import type {
  AnimeDetail,
  AnimeListItem,
  AnimeRelated,
  FetchAnimeParams,
  Genre,
} from "@/types/anime";

export const SHIKIMORI_ORIGIN = "https://shikimori.one";
const API_BASE = `${SHIKIMORI_ORIGIN}/api`;
const FETCH_TIMEOUT_MS = 8000;

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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "AniVault",
        ...init?.headers,
      },
      next: { revalidate: 120 },
    });

    if (!response.ok) {
      throw new ShikimoriError(
        `Shikimori request failed: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ShikimoriError) throw error;
    throw new ShikimoriError(
      error instanceof Error ? error.message : "Shikimori request failed",
      504
    );
  } finally {
    clearTimeout(timeout);
  }
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
    exclude_ids,
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
    exclude_ids,
  });

  const data = await shikimoriFetch<AnimeListItem[]>(`/animes${query}`);
  return Array.isArray(data) ? data : [];
}

export async function getAnimeById(id: string | number): Promise<AnimeDetail> {
  return shikimoriFetch<AnimeDetail>(`/animes/${id}`);
}

export async function getSimilarAnime(
  id: string | number
): Promise<AnimeListItem[]> {
  const data = await shikimoriFetch<AnimeListItem[]>(`/animes/${id}/similar`);
  return Array.isArray(data) ? data : [];
}

export async function getRelatedAnime(
  id: string | number
): Promise<AnimeRelated[]> {
  const data = await shikimoriFetch<AnimeRelated[]>(`/animes/${id}/related`);
  return Array.isArray(data) ? data : [];
}

export async function getGenres(): Promise<Genre[]> {
  const genres = await shikimoriFetch<Genre[]>("/genres");
  if (!Array.isArray(genres)) return [];
  return genres.filter((genre) => genre.kind === "anime");
}
