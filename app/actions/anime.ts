"use server";

import {
  getAnimeById,
  getAnimes,
  getGenres,
  getRelatedAnime,
  getSimilarAnime,
} from "@/lib/shikimori";
import type { FetchAnimeParams } from "@/types/anime";

export async function fetchAnimeList(params: FetchAnimeParams = {}) {
  return getAnimes(params);
}

export async function fetchAnimeDetail(id: string) {
  return getAnimeById(id);
}

export async function fetchSimilarAnime(id: string) {
  return getSimilarAnime(id);
}

export async function fetchRelatedAnime(id: string) {
  return getRelatedAnime(id);
}

export async function fetchGenres() {
  return getGenres();
}
