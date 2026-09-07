import type { AnimeDetail } from "@/types/anime";

const CYRILLIC = /[\u0400-\u04FF]/g;
const LATIN = /[A-Za-z]/g;

/** Strip Shikimori BBCode-ish markup from plain description fields. */
export function cleanShikimoriText(raw: string | null | undefined): string {
  if (!raw) return "";

  return raw
    .replace(
      /\[(?:character|anime|manga|person)=[^\]]+\]([\s\S]*?)\[\/\w+\]/gi,
      "$1"
    )
    .replace(
      /\[\/?(?:b|i|url|img|spoiler|quote|right|center|list|\*)[^\]]*\]/gi,
      ""
    )
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

/** Fast, sync synopsis for metadata / first paint — never blocks on MAL. */
export function getQuickSynopsis(anime: AnimeDetail): {
  text: string;
  note?: string;
} {
  const cleaned = cleanShikimoriText(anime.description);
  if (!cleaned) {
    return { text: "No synopsis is available for this title yet." };
  }

  if (isPrimarilyCyrillic(cleaned)) {
    return {
      text: cleaned,
      note: "Shikimori synopsis (Russian). English may load below when available.",
    };
  }

  return {
    text: cleaned,
    note: anime.description_source ?? undefined,
  };
}

interface JikanAnimeResponse {
  data?: {
    synopsis?: string | null;
  };
}

/**
 * Prefer an English synopsis when Shikimori only has Russian.
 * Hard-timeout so detail pages never hang on Jikan.
 */
export async function resolveDisplaySynopsis(anime: AnimeDetail): Promise<{
  text: string;
  source: "shikimori" | "mal" | "none";
  note?: string;
}> {
  const quick = getQuickSynopsis(anime);
  const cleaned = cleanShikimoriText(anime.description);

  if (cleaned && !isPrimarilyCyrillic(cleaned)) {
    return {
      text: cleaned,
      source: "shikimori",
      note: anime.description_source ?? undefined,
    };
  }

  if (anime.myanimelist_id) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    try {
      const response = await fetch(
        `https://api.jikan.moe/v4/anime/${anime.myanimelist_id}`,
        {
          headers: { Accept: "application/json" },
          signal: controller.signal,
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
      // fall through
    } finally {
      clearTimeout(timeout);
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
    text: quick.text,
    source: "none",
    note: quick.note,
  };
}
