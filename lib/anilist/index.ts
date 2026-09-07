import { cache } from "react";

import type {
  AnimeDetail,
  AnimeListItem,
  AnimePageResult,
  FetchAnimeParams,
} from "@/types/anime";
import { anilistRequest, AniListError } from "./client";
import { mapMediaDetail, mapMediaListItem } from "./mappers";
import {
  MEDIA_DETAIL_QUERY,
  MEDIA_SEARCH_ONE_QUERY,
  PAGE_ANIME_QUERY,
} from "./queries";
import type { AniListMediaPayload, AniListPagePayload } from "./types";

export {
  AniListError,
  canAffordAniListRequest,
  getAniListRateLimitSnapshot,
} from "./client";
export { ANIME_GENRES, isValidGenre } from "./genres";
export {
  cleanDescription,
  formatFuzzyDate,
  formatScoreOutOfTen,
  getDisplayTitle,
} from "./format";

const MAX_PER_PAGE = 50;

export async function getAnimePage(
  params: FetchAnimeParams = {}
): Promise<AnimePageResult> {
  const page = Math.max(1, params.page ?? 1);
  const perPage = Math.min(Math.max(1, params.limit ?? 8), MAX_PER_PAGE);
  const sort = params.sort ?? "POPULARITY_DESC";

  const data = await anilistRequest<AniListPagePayload>(PAGE_ANIME_QUERY, {
    page,
    perPage,
    search: params.search || undefined,
    genre: params.genre || undefined,
    sort: [sort],
  });

  const media = (data.Page.media ?? [])
    .map((node) => mapMediaListItem(node))
    .filter((item): item is AnimeListItem => item !== null);

  const exclude = new Set(params.excludeIds ?? []);
  const filtered =
    exclude.size > 0 ? media.filter((item) => !exclude.has(item.id)) : media;

  return {
    pageInfo: {
      total: data.Page.pageInfo.total ?? 0,
      currentPage: data.Page.pageInfo.currentPage ?? page,
      lastPage: data.Page.pageInfo.lastPage ?? page,
      hasNextPage: Boolean(data.Page.pageInfo.hasNextPage),
    },
    media: filtered,
  };
}

export async function getAnimes(
  params: FetchAnimeParams = {}
): Promise<AnimeListItem[]> {
  const result = await getAnimePage(params);
  return result.media;
}

/**
 * Deduped within a single RSC request so generateMetadata + page share one Media fetch.
 */
export const getAnimeById = cache(
  async (id: string | number): Promise<AnimeDetail> => {
    const numericId =
      typeof id === "number" ? id : Number.parseInt(String(id), 10);
    if (!Number.isFinite(numericId)) {
      throw new AniListError("Invalid anime id.", 400, "not_found");
    }

    const data = await anilistRequest<AniListMediaPayload>(MEDIA_DETAIL_QUERY, {
      id: numericId,
    });

    const detail = mapMediaDetail(data.Media);
    if (!detail) {
      throw new AniListError("Anime not found.", 404, "not_found");
    }

    return detail;
  }
);

/**
 * Resolve a free-text title to an AniList id (used after Gemini invents names).
 * Prefer skipping this when AniList already supplied recommendation ids.
 */
export async function resolveAnimeByTitle(
  title: string
): Promise<AnimeListItem | null> {
  const trimmed = title.trim();
  if (!trimmed) return null;

  const data = await anilistRequest<AniListPagePayload>(
    MEDIA_SEARCH_ONE_QUERY,
    { search: trimmed, perPage: 1 },
    { revalidate: false }
  );

  return mapMediaListItem(data.Page.media?.[0] ?? null);
}
