import type { AnimeDetail } from "@/types/anime";

const CYRILLIC = /[\u0400-\u04FF]/g;
const LATIN = /[A-Za-z]/g;

/** Strip Shikimori BBCode-ish markup from plain description fields. */
export function cleanShikimoriText(raw: string | null | undefined): string {
  if (!raw) return "";

  return raw
    .replace(/\[(?:character|anime|manga|person)=[^\]]+\]([\s\S]*?)\[\/\w+\]/gi, "$1")
    .replace(/\[\/?(?:b|i|url|img|spoiler|quote|right|center|list|\*)[^\]]*\]/gi, "")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function isPrimarilyCyrillic(text: string): boolean {
  const cyrillic = text.match(CYRILLIC)?.length ?? 0;
  const latin = text.match(LATIN)?.length ?? 0;
  if (cyrillic === 0) return false;
  return cyrillic >= latin;
}

interface JikanAnimeResponse {
  data?: {
    synopsis?: string | null;
  };
}

/**
 * Prefer an English synopsis for the UI.
 * Shikimori's `description` is often authored in Russian with no separate EN field,
 * so we fall back to Jikan (MAL) when `myanimelist_id` is present.
 */
export async function resolveDisplaySynopsis(anime: AnimeDetail): Promise<{
  text: string;
  source: "shikimori" | "mal" | "none";
  note?: string;
}> {
  const cleaned = cleanShikimoriText(anime.description);

  if (cleaned && !isPrimarilyCyrillic(cleaned)) {
    return {
      text: cleaned,
      source: "shikimori",
      note: anime.description_source ?? undefined,
    };
  }

  if (anime.myanimelist_id) {
    try {
      const response = await fetch(
        `https://api.jikan.moe/v4/anime/${anime.myanimelist_id}`,
        {
          headers: { Accept: "application/json" },
          next: { revalidate: 86400 },
        }
      );

      if (response.ok) {
        const payload = (await response.json()) as JikanAnimeResponse;
        const english = cleanShikimoriText(payload.data?.synopsis ?? "");
        if (english) {
          return {
            text: english,
            source: "mal",
            note: "English synopsis via MyAnimeList",
          };
        }
      }
    } catch {
      // keep Shikimori text below
    }
  }

  if (cleaned) {
    return {
      text: cleaned,
      source: "shikimori",
      note: isPrimarilyCyrillic(cleaned)
        ? "Original Shikimori synopsis (Russian). English version unavailable."
        : anime.description_source ?? undefined,
    };
  }

  return {
    text: "No synopsis is available for this title yet.",
    source: "none",
  };
}
