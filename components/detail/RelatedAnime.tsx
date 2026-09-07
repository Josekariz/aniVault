import Image from "next/image";
import Link from "next/link";

import AnimeGrid from "@/components/AnimeGrid";
import { shikimoriImageUrl } from "@/lib/shikimori";
import type { AnimeListItem, AnimeRelated } from "@/types/anime";

interface RelatedAnimeProps {
  related: AnimeRelated[];
  similar: AnimeListItem[];
}

export default function RelatedAnime({ related, similar }: RelatedAnimeProps) {
  const relatedAnime = related.filter(
    (entry): entry is AnimeRelated & { anime: AnimeListItem } =>
      entry.anime !== null
  );

  return (
    <div className="flex flex-col gap-12">
      {relatedAnime.length > 0 ? (
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
            {relatedAnime.map((entry) => (
              <li key={`${entry.relation}-${entry.anime.id}`}>
                <Link
                  href={`/anime/${entry.anime.id}`}
                  className="group flex gap-4 rounded-2xl border border-ink/8 bg-white p-3 shadow-sm transition hover:border-accent/35 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <span className="relative h-24 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                    <Image
                      src={shikimoriImageUrl(entry.anime.image?.original)}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  </span>
                  <span className="flex min-w-0 flex-col justify-center gap-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                      {entry.relation}
                    </span>
                    <span className="line-clamp-2 text-base font-semibold text-ink group-hover:text-accent">
                      {entry.anime.name}
                    </span>
                    <span className="text-xs capitalize text-ink-subtle">
                      {entry.anime.kind ?? "anime"}
                      {entry.anime.score && entry.anime.score !== "0.0"
                        ? ` · ${entry.anime.score}`
                        : ""}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {similar.length > 0 ? (
        <section className="space-y-6" aria-labelledby="similar-heading">
          <div className="space-y-1">
            <h2
              id="similar-heading"
              className="font-display text-2xl font-semibold tracking-tight text-ink"
            >
              Similar anime
            </h2>
            <p className="text-sm text-ink-muted">
              Titles Shikimori associates with this one.
            </p>
          </div>
          <AnimeGrid anime={similar.slice(0, 8)} />
        </section>
      ) : null}
    </div>
  );
}
