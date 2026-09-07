import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
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
import { AnimeSkeleton } from "@/components/AnimeSkeleton";
import { shikimoriImageUrl } from "@/lib/shikimori";
import {
  getQuickSynopsis,
  resolveDisplaySynopsis,
} from "@/lib/synopsis";

interface AnimePageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: AnimePageProps): Promise<Metadata> {
  try {
    const anime = await fetchAnimeDetail(params.id);
    // Keep metadata fast — never wait on Jikan here.
    const synopsis = getQuickSynopsis(anime);
    const description =
      synopsis.text.slice(0, 160) ||
      `${anime.name} — details on Anime Vault.`;

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

async function SynopsisBlock({
  id,
  fallbackText,
  fallbackNote,
}: {
  id: string;
  fallbackText: string;
  fallbackNote?: string;
}) {
  let text = fallbackText;
  let note = fallbackNote;

  try {
    const anime = await fetchAnimeDetail(id);
    const synopsis = await resolveDisplaySynopsis(anime);
    text = synopsis.text;
    note = synopsis.note;
  } catch {
    // keep quick fallback
  }

  return (
    <section className="space-y-3" aria-labelledby="synopsis-heading">
      <h2
        id="synopsis-heading"
        className="text-2xl font-bold tracking-tight text-ink"
      >
        Synopsis
      </h2>
      <p className="max-w-3xl whitespace-pre-line text-base leading-relaxed text-ink-muted">
        {text}
      </p>
      {note ? <p className="text-xs text-ink-subtle">{note}</p> : null}
    </section>
  );
}

async function RelatedBlock({ id }: { id: string }) {
  const [relatedResult, similarResult] = await Promise.allSettled([
    fetchRelatedAnime(id),
    fetchSimilarAnime(id),
  ]);

  const related =
    relatedResult.status === "fulfilled" ? relatedResult.value : [];
  const similar =
    similarResult.status === "fulfilled" ? similarResult.value : [];

  if (relatedResult.status === "rejected" && similarResult.status === "rejected") {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-amber-500/30 bg-amber-50 px-5 py-4 text-sm text-amber-900"
      >
        Related titles couldn&apos;t be loaded right now.
      </div>
    );
  }

  return <RelatedAnime related={related} similar={similar} />;
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

  return (
    <main className="relative flex flex-col gap-12 px-8 py-10 sm:gap-14 sm:px-16 sm:py-14">
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
          <li className="truncate text-ink">{anime.name}</li>
        </ol>
      </nav>

      <AnimeDetailHero anime={anime} />
      <AnimeMeta anime={anime} />

      <Suspense
        fallback={
          <section className="space-y-3">
            <div className="h-7 w-28 animate-pulse rounded bg-surface-2" />
            <div className="h-4 w-full max-w-3xl animate-pulse rounded bg-surface-2" />
            <div className="h-4 w-5/6 max-w-2xl animate-pulse rounded bg-surface-2" />
          </section>
        }
      >
        <SynopsisBlock
          id={id}
          fallbackText={quick.text}
          fallbackNote={quick.note}
        />
      </Suspense>

      <AnimeScreenshots
        screenshots={anime.screenshots ?? []}
        title={anime.name}
      />

      <Suspense fallback={<AnimeSkeleton count={4} />}>
        <RelatedBlock id={id} />
      </Suspense>

      <RecommendChat
        animeId={anime.id}
        name={anime.name}
        genres={(anime.genres ?? []).map((genre) => genre.name)}
        synopsis={quick.text}
      />
    </main>
  );
}
