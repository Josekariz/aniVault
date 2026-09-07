import type { AnimeTitle, FuzzyDate } from "@/types/anime";

export function getDisplayTitle(
  title: AnimeTitle | null | undefined
): string {
  if (!title) return "Untitled";
  return title.english ?? title.romaji ?? title.native ?? "Untitled";
}

/**
 * Convert AniList averageScore (0–100 int) to a /10 display string.
 * e.g. 72 → "7.2". Returns null when score is missing.
 */
export function formatScoreOutOfTen(
  averageScore: number | null | undefined
): string | null {
  if (
    averageScore == null ||
    !Number.isFinite(averageScore) ||
    averageScore <= 0
  ) {
    return null;
  }
  return (averageScore / 10).toFixed(1);
}

export function formatFuzzyDate(
  date: FuzzyDate | null | undefined
): string | null {
  if (!date?.year) return null;
  const parts = [
    String(date.year),
    date.month != null ? String(date.month).padStart(2, "0") : null,
    date.day != null ? String(date.day).padStart(2, "0") : null,
  ].filter(Boolean);
  return parts.join("-");
}

/** Strip residual HTML / spoiler markup AniList leaves even with asHtml: false. */
export function cleanDescription(raw: string | null | undefined): string {
  if (!raw) return "";

  return (
    raw
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/?(?:i|b|em|strong|a|span|p|div)(?:\s[^>]*)?>/gi, "")
      .replace(/<\/?spoiler>/gi, "")
      // AniList / forum-style spoilers: ~!hidden!~
      .replace(/~!([\s\S]*?)!~/g, "$1")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&mdash;/g, "—")
      .replace(/&ndash;/g, "–")
      .replace(/&hellip;/g, "…")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n[ \t]+/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]{2,}/g, " ")
      // Footers that sometimes appear inside AniList plain descriptions.
      .replace(/\n?\s*\[Written by MAL Rewrite\]\s*$/i, "")
      .replace(/\n?\s*\(Source:\s*[^)]+\)\s*$/i, "")
      .trim()
  );
}
