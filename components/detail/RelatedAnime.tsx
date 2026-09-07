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
              className="text-2xl font-bold tracking-tight text-white"
            >
              Related
            </h2>
            <p className="text-sm text-white/45">
              Adaptations, sequels, and other titles in this series.
            </p>
          </div>

          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {relatedAnime.map((entry) => (
              <li key={`${entry.relation}-${entry.anime.id}`}>
                <Link
                  href={`/anime/${entry.anime.id}`}
                  className="group flex gap-4 rounded-xl border border-white/5 bg-[#161921] p-3 transition hover:border-[#ff5956]/40 hover:bg-[#1a1e28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5956]"
                >
                  <span className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-[#0F1117]">
                    <Image
                      src={shikimoriImageUrl(entry.anime.image?.original)}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  </span>
                  <span className="min-w-0 flex flex-col justify-center gap-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ff8a87]">
                      {entry.relation}
                    </span>
                    <span className="line-clamp-2 text-base font-semibold text-white group-hover:text-[#ff8a87]">
                      {entry.anime.name}
                    </span>
                    <span className="text-xs capitalize text-white/40">
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
              className="text-2xl font-bold tracking-tight text-white"
            >
              Similar anime
            </h2>
            <p className="text-sm text-white/45">
              Titles Shikimori associates with this one.
            </p>
          </div>
          <AnimeGrid anime={similar.slice(0, 8)} />
        </section>
      ) : null}
    </div>
  );
}
