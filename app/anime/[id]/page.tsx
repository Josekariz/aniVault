import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  fetchAnimeDetail,
  fetchRelatedAnime,
  fetchSimilarAnime,
} from "@/app/actions/anime";
import AnimeDetailHero from "@/components/detail/AnimeDetailHero";
import AnimeMeta from "@/components/detail/AnimeMeta";
import AnimeScreenshots from "@/components/detail/AnimeScreenshots";
import RelatedAnime from "@/components/detail/RelatedAnime";
import RecommendChat from "@/components/recommendations/RecommendChat";
import { shikimoriImageUrl } from "@/lib/shikimori";
import { resolveDisplaySynopsis } from "@/lib/synopsis";
import type { AnimeListItem, AnimeRelated } from "@/types/anime";

interface AnimePageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: AnimePageProps): Promise<Metadata> {
  try {
    const anime = await fetchAnimeDetail(params.id);
    const synopsis = await resolveDisplaySynopsis(anime);
    const description =
      synopsis.text.slice(0, 160) ||
      `${anime.name} — details, related titles, and more on Anime Vault.`;

    return {
      title: `${anime.name} | Anime Vault`,
      description,
      openGraph: {
        title: anime.name,
        description,
        images: [shikimoriImageUrl(anime.image?.original)],
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

  const [relatedResult, similarResult, synopsis] = await Promise.all([
    fetchRelatedAnime(id).then(
      (value) => ({ status: "fulfilled" as const, value }),
      (reason) => ({ status: "rejected" as const, reason })
    ),
    fetchSimilarAnime(id).then(
      (value) => ({ status: "fulfilled" as const, value }),
      (reason) => ({ status: "rejected" as const, reason })
    ),
    resolveDisplaySynopsis(anime),
  ]);

  const related: AnimeRelated[] =
    relatedResult.status === "fulfilled" ? relatedResult.value : [];
  const similar: AnimeListItem[] =
    similarResult.status === "fulfilled" ? similarResult.value : [];

  const relatedFailed = relatedResult.status === "rejected";
  const similarFailed = similarResult.status === "rejected";

  return (
    <main className="relative flex flex-col gap-12 px-8 py-10 sm:gap-14 sm:px-16 sm:py-14">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-white/55">
          <li>
            <Link
              href="/"
              className="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5956]"
            >
              Explore
            </Link>
          </li>
          <li aria-hidden className="text-white/30">
            /
          </li>
          <li className="truncate text-white/80">{anime.name}</li>
        </ol>
      </nav>

      <AnimeDetailHero anime={anime} />
      <AnimeMeta anime={anime} />

      <section className="space-y-3" aria-labelledby="synopsis-heading">
        <h2
          id="synopsis-heading"
          className="text-2xl font-bold tracking-tight text-white"
        >
          Synopsis
        </h2>
        <p className="max-w-3xl whitespace-pre-line text-base leading-relaxed text-white/80">
          {synopsis.text}
        </p>
        {synopsis.note ? (
          <p className="text-xs text-white/45">{synopsis.note}</p>
        ) : null}
      </section>

      <AnimeScreenshots
        screenshots={anime.screenshots ?? []}
        title={anime.name}
      />

      {relatedFailed && similarFailed ? (
        <div
          role="alert"
          className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-100"
        >
          Related titles couldn&apos;t be loaded right now. The main details
          above are still available.
        </div>
      ) : (
        <RelatedAnime related={related} similar={similar} />
      )}

      <RecommendChat
        animeId={anime.id}
        name={anime.name}
        genres={(anime.genres ?? []).map((genre) => genre.name)}
        synopsis={synopsis.text}
        similar={similar}
      />
    </main>
  );
}
