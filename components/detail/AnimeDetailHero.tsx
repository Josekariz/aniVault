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
      <div className="relative mx-auto aspect-[2/3] w-full max-w-[300px] overflow-hidden rounded-2xl bg-[#161921] shadow-2xl shadow-black/50 ring-1 ring-white/10">
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
          <p className="text-sm uppercase tracking-[0.2em] text-white/40">
            {[anime.kind, formatStatus(anime.status)].filter(Boolean).join(" · ")}
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {anime.name}
          </h1>
          {anime.russian ? (
            <p className="text-lg text-white/50">{anime.russian}</p>
          ) : null}
          {english.length > 0 ? (
            <p className="text-sm text-white/40">
              Also known as {english.slice(0, 2).join(", ")}
            </p>
          ) : null}
          {japanese.length > 0 ? (
            <p className="text-sm text-white/35">{japanese[0]}</p>
          ) : null}
        </div>

        {anime.genres?.length ? (
          <ul className="flex flex-wrap gap-2">
            {anime.genres.map((genre) => (
              <li key={genre.id}>
                <Link
                  href={`/?genre=${genre.id}`}
                  className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/70 transition hover:border-[#ff5956]/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5956]"
                >
                  {genre.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        {anime.studios?.length ? (
          <p className="text-sm text-white/55">
            <span className="text-white/35">Studio · </span>
            {anime.studios.map((studio) => studio.name).join(", ")}
          </p>
        ) : null}

        {anime.franchise ? (
          <p className="text-sm text-white/55">
            <span className="text-white/35">Franchise · </span>
            {anime.franchise}
          </p>
        ) : null}
      </div>
    </MotionDiv>
  );
}
