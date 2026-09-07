import Image from "next/image";
import Link from "next/link";

import AnimeGrid from "@/components/AnimeGrid";
import { formatScoreOutOfTen } from "@/lib/anilist/format";
import type { AnimeListItem, AnimeRelation } from "@/types/anime";

interface RelatedAnimeProps {
  related: AnimeRelation[];
  similar: AnimeListItem[];
}

export default function RelatedAnime({ related, similar }: RelatedAnimeProps) {
  const similarSlice = similar.slice(0, 8);
  if (related.length === 0 && similarSlice.length === 0) return null;

  return (
    <div className="flex flex-col gap-12">
      {related.length > 0 ? (
        <section className="space-y-6" aria-labelledby="related-heading">
          <div className="space-y-1">
            <h2
              id="related-heading"
              className="font-display text-2xl font-semibold tracking-tight text-ink"
            >
              Related
            </h2>
            <p className="text-sm text-ink-muted">
              Adaptations, sequels, and other titles in this series.
            </p>
          </div>

          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {related.map((entry) => {
              const score = formatScoreOutOfTen(entry.anime.averageScore);
              return (
                <li key={`${entry.relationType}-${entry.anime.id}`}>
                  <Link
                    href={`/anime/${entry.anime.id}`}
                    className="group flex gap-4 rounded-2xl border border-white/10 bg-surface p-3 shadow-sm transition hover:border-accent/35 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <span className="relative h-24 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                      <Image
                        src={entry.anime.coverImage || "/logo.svg"}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                    </span>
                    <span className="flex min-w-0 flex-col justify-center gap-1">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                        {entry.relationType.replace(/_/g, " ")}
                      </span>
                      <span className="line-clamp-2 text-base font-semibold text-ink group-hover:text-accent">
                        {entry.anime.displayTitle}
                      </span>
                      <span className="text-xs capitalize text-ink-subtle">
                        {entry.anime.format?.replace(/_/g, " ") ?? "anime"}
                        {score ? ` · ${score}` : ""}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {similarSlice.length > 0 ? (
        <section className="space-y-6" aria-labelledby="similar-heading">
          <div className="space-y-1">
            <h2
              id="similar-heading"
              className="font-display text-2xl font-semibold tracking-tight text-ink"
            >
              Similar anime
            </h2>
            <p className="text-sm text-ink-muted">
              Titles AniList users recommend alongside this one.
            </p>
          </div>
          <AnimeGrid anime={similarSlice} />
        </section>
      ) : null}
    </div>
  );
}
