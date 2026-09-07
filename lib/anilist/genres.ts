/**
 * AniList Media.genres is a fixed enum — there is no /genres endpoint.
 * Keep this list aligned with AniList’s documented genre values.
 */
export const ANIME_GENRES = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Ecchi",
  "Fantasy",
  "Horror",
  "Mahou Shoujo",
  "Mecha",
  "Music",
  "Mystery",
  "Psychological",
  "Romance",
  "Sci-Fi",
  "Slice of Life",
  "Sports",
  "Supernatural",
  "Thriller",
] as const;

export type AniListGenre = (typeof ANIME_GENRES)[number];

export function isValidGenre(value: string | undefined | null): value is AniListGenre {
  if (!value) return false;
  return (ANIME_GENRES as readonly string[]).includes(value);
}
