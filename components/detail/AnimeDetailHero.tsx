import Image from "next/image";
import Link from "next/link";

import { MotionDiv } from "@/components/MotionDiv";
import type { AnimeDetail } from "@/types/anime";

interface AnimeDetailHeroProps {
  anime: AnimeDetail;
}

function formatLabel(value: string | null) {
  if (!value) return null;
  return value.replace(/_/g, " ");
}

export default function AnimeDetailHero({ anime }: AnimeDetailHeroProps) {
  const backdrop = anime.bannerImage || anime.coverImage || null;
  const cover = anime.coverImage || "/logo.svg";
  const altTitle =
    anime.title.romaji && anime.title.romaji !== anime.displayTitle
      ? anime.title.romaji
      : anime.title.native && anime.title.native !== anime.displayTitle
        ? anime.title.native
        : null;

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative isolate overflow-hidden rounded-3xl ring-1 ring-white/10"
    >
      {backdrop ? (
        <div className="pointer-events-none absolute inset-0 -z-10 min-h-full">
          <Image
            src={backdrop}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_20%]"
          />
          <div className="absolute inset-0 bg-canvas/55" />
          <div className="absolute inset-0 bg-gradient-to-r from-canvas via-canvas/80 to-canvas/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/40 to-transparent" />
        </div>
      ) : (
        <div className="pointer-events-none absolute inset-0 -z-10 bg-surface" />
      )}

      <div className="relative grid gap-10 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[280px_1fr] lg:items-start lg:gap-12">
        <div className="relative mx-auto aspect-[2/3] w-full max-w-[280px] overflow-hidden rounded-3xl bg-surface-2 shadow-soft ring-1 ring-white/15">
          <Image
            src={cover}
            alt={anime.displayTitle}
            fill
            priority
            sizes="280px"
            className="object-cover"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.2em] text-ink-subtle">
              {[formatLabel(anime.format), formatLabel(anime.status)]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              {anime.displayTitle}
            </h1>
            {altTitle ? (
              <p className="text-lg text-ink-muted">{altTitle}</p>
            ) : null}
            {anime.title.native &&
            anime.title.native !== anime.displayTitle &&
            anime.title.native !== altTitle ? (
              <p className="text-sm text-ink-subtle">{anime.title.native}</p>
            ) : null}
          </div>

          {anime.genres.length ? (
            <ul className="flex flex-wrap gap-2">
              {anime.genres.map((genre) => (
                <li key={genre}>
                  <Link
                    href={`/?genre=${encodeURIComponent(genre)}`}
                    className="inline-flex rounded-full border border-white/10 bg-surface/80 px-3 py-1 text-sm text-ink-muted backdrop-blur transition hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {genre}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}

          {anime.studios.length ? (
            <p className="text-sm text-ink-muted">
              <span className="text-ink-subtle">Studio · </span>
              {anime.studios.join(", ")}
            </p>
          ) : null}

          {anime.season || anime.seasonYear ? (
            <p className="text-sm text-ink-muted">
              <span className="text-ink-subtle">Season · </span>
              {[formatLabel(anime.season), anime.seasonYear]
                .filter(Boolean)
                .join(" ")}
            </p>
          ) : null}
        </div>
      </div>
    </MotionDiv>
  );
}
