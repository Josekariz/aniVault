import type { AnimeDetail } from "@/types/anime";
import { cleanDescription } from "@/lib/anilist/format";

/**
 * Prefer the mapper-cleaned description; re-run cleanup defensively for any
 * path that might bypass the AniList mapper.
 */
export function getQuickSynopsis(anime: AnimeDetail): {
  text: string;
  note?: string;
} {
  const text = cleanDescription(anime.description).trim();
  if (!text) {
    return { text: "No synopsis is available for this title yet." };
  }
  return { text };
}
