import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { fetchAnimeDetail } from "@/app/actions/anime";
import AnimeDetailHero from "@/components/detail/AnimeDetailHero";
import AnimeMeta from "@/components/detail/AnimeMeta";
import AnimeSynopsis from "@/components/detail/AnimeSynopsis";
import AnimeTrailerEmbed from "@/components/detail/AnimeTrailerEmbed";
import RelatedAnime from "@/components/detail/RelatedAnime";
import RecommendChat from "@/components/recommendations/RecommendChat";
import { getQuickSynopsis } from "@/lib/synopsis";

interface AnimePageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: AnimePageProps): Promise<Metadata> {
  try {
    const anime = await fetchAnimeDetail(params.id);
    const synopsis = getQuickSynopsis(anime);
    const description =
      synopsis.text.slice(0, 160) ||
      `${anime.displayTitle} — details on Anime Vault.`;

    return {
      title: `${anime.displayTitle} | Anime Vault`,
      description,
      openGraph: {
        title: anime.displayTitle,
        description,
        images: anime.bannerImage
          ? [anime.bannerImage]
          : anime.coverImage
            ? [anime.coverImage]
            : undefined,
      },
    };
  } catch {
    return { title: "Anime | Anime Vault" };
  }
}

export default async function AnimePage({ params }: AnimePageProps) {
  const id = params.id;

  if (!id || Number.isNaN(Number(id))) {
    notFound();
  }

  let anime;
  try {
    anime = await fetchAnimeDetail(id);
  } catch {
    notFound();
  }

  const quick = getQuickSynopsis(anime);
  // Single Media query already includes relations + recommendations.
  const similar = anime.recommendations.map((item) => item.anime);

  return (
    <main className="page-shell relative flex flex-col gap-12 py-10 sm:gap-14 sm:py-14">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-ink-subtle">
          <li>
            <Link
              href="/"
              className="transition hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Explore
            </Link>
          </li>
          <li aria-hidden className="text-ink-subtle/50">
            /
          </li>
          <li className="truncate text-ink">{anime.displayTitle}</li>
        </ol>
      </nav>

      <AnimeDetailHero anime={anime} />
      <AnimeMeta anime={anime} />
      <AnimeSynopsis text={quick.text} />
      <AnimeTrailerEmbed trailer={anime.trailer} title={anime.displayTitle} />
      <RelatedAnime related={anime.relations} similar={similar} />

      <RecommendChat
        animeId={anime.id}
        name={anime.displayTitle}
        genres={anime.genres}
        synopsis={quick.text}
        seedRecommendations={anime.recommendations.map((item) => ({
          title: item.anime.displayTitle,
          reason: "Recommended on AniList.",
          anilistId: item.anime.id,
        }))}
      />
    </main>
  );
}
