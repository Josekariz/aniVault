import type {
  AnimeDetail,
  AnimeListItem,
  AnimeRecommendation,
  AnimeRelation,
  AnimeTitle,
  FuzzyDate,
} from "@/types/anime";
import { cleanDescription, getDisplayTitle } from "./format";
import type {
  AniListFuzzyDate,
  AniListMediaDetail,
  AniListMediaListNode,
} from "./types";

function mapTitle(title: AniListMediaListNode["title"]): AnimeTitle {
  return {
    romaji: title?.romaji ?? null,
    english: title?.english ?? null,
    native: title?.native ?? null,
  };
}

function mapFuzzyDate(date: AniListFuzzyDate | null | undefined): FuzzyDate | null {
  if (!date || date.year == null) return null;
  return {
    year: date.year,
    month: date.month ?? null,
    day: date.day ?? null,
  };
}

export function mapMediaListItem(
  node: AniListMediaListNode | null | undefined
): AnimeListItem | null {
  if (!node || typeof node.id !== "number") return null;

  const title = mapTitle(node.title);
  return {
    id: node.id,
    title,
    displayTitle: getDisplayTitle(title),
    coverImage: node.coverImage?.large ?? null,
    bannerImage: node.bannerImage ?? null,
    format: node.format ?? null,
    status: node.status ?? null,
    episodes: node.episodes ?? null,
    averageScore: node.averageScore ?? null,
    genres: Array.isArray(node.genres) ? node.genres.filter(Boolean) : [],
    seasonYear: node.seasonYear ?? null,
  };
}

function isAnimeNode(node: AniListMediaListNode | null | undefined): boolean {
  if (!node) return false;
  // List queries already filter type: ANIME; relation nodes may be manga.
  if (node.type == null) return true;
  return node.type === "ANIME";
}

export function mapRelations(
  detail: AniListMediaDetail
): AnimeRelation[] {
  const edges = detail.relations?.edges ?? [];
  const mapped: AnimeRelation[] = [];
  const seen = new Set<string>();

  for (const edge of edges) {
    if (!edge?.node || !isAnimeNode(edge.node)) continue;
    const anime = mapMediaListItem(edge.node);
    if (!anime) continue;

    const relationType = edge.relationType || "RELATION";
    const key = `${relationType}:${anime.id}`;
    if (seen.has(key)) continue;
    seen.add(key);

    mapped.push({ relationType, anime });
  }

  const order = [
    "PREQUEL",
    "SEQUEL",
    "PARENT",
    "SIDE_STORY",
    "ALTERNATIVE",
    "SUMMARY",
    "CHARACTER",
    "OTHER",
  ];

  return mapped.sort((a, b) => {
    const ai = order.indexOf(a.relationType);
    const bi = order.indexOf(b.relationType);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

export function mapRecommendations(
  detail: AniListMediaDetail,
  sourceId?: number
): AnimeRecommendation[] {
  const nodes = detail.recommendations?.nodes ?? [];
  const mapped: AnimeRecommendation[] = [];
  const seen = new Set<number>();

  for (const node of nodes) {
    const media = node?.mediaRecommendation;
    if (!media || !isAnimeNode(media)) continue;
    const anime = mapMediaListItem(media);
    if (!anime) continue;
    if (sourceId != null && anime.id === sourceId) continue;
    if (seen.has(anime.id)) continue;
    seen.add(anime.id);

    mapped.push({
      rating: node.rating ?? 0,
      anime,
    });
  }

  return mapped;
}

export function mapMediaDetail(
  media: AniListMediaDetail | null | undefined
): AnimeDetail | null {
  const base = mapMediaListItem(media);
  if (!base || !media) return null;

  return {
    ...base,
    description: cleanDescription(media.description) || null,
    duration: media.duration ?? null,
    source: media.source ?? null,
    season: media.season ?? null,
    studios: (media.studios?.nodes ?? [])
      .map((studio) => studio?.name)
      .filter((name): name is string => Boolean(name)),
    startDate: mapFuzzyDate(media.startDate),
    endDate: mapFuzzyDate(media.endDate),
    trailer: media.trailer
      ? {
          id: media.trailer.id ?? null,
          site: media.trailer.site ?? null,
          thumbnail: media.trailer.thumbnail ?? null,
        }
      : null,
    relations: mapRelations(media).filter(
      (entry) => entry.anime.id !== base.id
    ),
    recommendations: mapRecommendations(media, base.id),
  };
}
