"use server";

import {
  AniListError,
  canAffordAniListRequest,
  getAnimeById,
  getAnimePage,
  getAnimes,
} from "@/lib/anilist";
import type { AnimeListItem, FetchAnimeParams } from "@/types/anime";

export async function fetchAnimePage(params: FetchAnimeParams = {}) {
  return getAnimePage(params);
}

export type SearchSuggestionsResult =
  | { status: "ok"; media: AnimeListItem[] }
  | { status: "skipped"; media: [] }
  | { status: "error"; media: [] };

/**
 * Typeahead helper. Skips the network call when the AniList budget is low
 * so Enter-to-search still works without burning the remaining quota.
 */
export async function fetchSearchSuggestions(
  query: string
): Promise<SearchSuggestionsResult> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return { status: "ok", media: [] };
  }

  if (!canAffordAniListRequest()) {
    return { status: "skipped", media: [] };
  }

  try {
    const media = await getAnimes({
      search: trimmed,
      limit: 6,
      sort: "POPULARITY_DESC",
    });
    return { status: "ok", media: Array.isArray(media) ? media : [] };
  } catch (error) {
    if (error instanceof AniListError && error.code === "rate_limit") {
      return { status: "skipped", media: [] };
    }
    return { status: "error", media: [] };
  }
}

export async function fetchAnimeDetail(id: string | number) {
  return getAnimeById(id);
}
