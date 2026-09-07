import Image from "next/image";
import Link from "next/link";

import { MotionDiv } from "@/components/MotionDiv";
import { shikimoriImageUrl } from "@/lib/shikimori";
import type { AnimeDetail } from "@/types/anime";

interface AnimeDetailHeroProps {
  anime: AnimeDetail;
}

function formatStatus(status: string | null) {
  if (!status) return null;
  return status.replace(/_/g, " ");
}

export default function AnimeDetailHero({ anime }: AnimeDetailHeroProps) {
  const english =
    anime.english?.filter((value): value is string => Boolean(value)) ?? [];
  const japanese =
    anime.japanese?.filter((value): value is string => Boolean(value)) ?? [];

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="grid gap-10 lg:grid-cols-[300px_1fr] lg:items-start"
    >
      <div className="relative mx-auto aspect-[2/3] w-full max-w-[300px] overflow-hidden rounded-3xl bg-surface-2 shadow-soft ring-1 ring-ink/8">
        <Image
          src={shikimoriImageUrl(anime.image?.original)}
          alt={anime.name}
          fill
          priority
          sizes="300px"
          className="object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-col gap-6">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-ink-subtle">
            {[anime.kind, formatStatus(anime.status)].filter(Boolean).join(" · ")}
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            {anime.name}
          </h1>
          {anime.russian ? (
            <p className="text-lg text-ink-muted">{anime.russian}</p>
          ) : null}
          {english.length > 0 ? (
            <p className="text-sm text-ink-subtle">
              Also known as {english.slice(0, 2).join(", ")}
            </p>
          ) : null}
          {japanese.length > 0 ? (
            <p className="text-sm text-ink-subtle">{japanese[0]}</p>
          ) : null}
        </div>

        {anime.genres?.length ? (
          <ul className="flex flex-wrap gap-2">
            {anime.genres.map((genre) => (
              <li key={genre.id}>
                <Link
                  href={`/?genre=${genre.id}`}
                  className="inline-flex rounded-full border border-white/10 bg-surface px-3 py-1 text-sm text-ink-muted transition hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {genre.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        {anime.studios?.length ? (
          <p className="text-sm text-ink-muted">
            <span className="text-ink-subtle">Studio · </span>
            {anime.studios.map((studio) => studio.name).join(", ")}
          </p>
        ) : null}

        {anime.franchise ? (
          <p className="text-sm text-ink-muted">
            <span className="text-ink-subtle">Franchise · </span>
            {anime.franchise}
          </p>
        ) : null}
      </div>
    </MotionDiv>
  );
}
