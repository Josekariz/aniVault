"use client";

import Image from "next/image";
import Link from "next/link";

import { MotionDiv } from "@/components/MotionDiv";
import { shikimoriImageUrl } from "@/lib/shikimori";
import type { AnimeListItem } from "@/types/anime";

interface HeroProps {
  featured?: AnimeListItem | null;
}

function Hero({ featured }: HeroProps) {
  return (
    <header className="relative overflow-hidden px-8 py-16 sm:px-16 sm:py-20">
      <div className="pointer-events-none absolute inset-0 bg-hero bg-cover bg-center opacity-40" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0F1117] via-[#0F1117]/92 to-[#0F1117]/55" />
      <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-[#ee1e38]/20 blur-3xl" />

      <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <MotionDiv
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="flex flex-col gap-7"
        >
          <Image
            src="/logo.svg"
            alt="Anime Vault"
            width={96}
            height={90}
            className="object-contain"
            priority
          />
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/45">
              Anime discovery
            </p>
            <h1 className="max-w-xl text-5xl font-bold leading-[1.1] text-white sm:text-6xl">
              Explore The <span className="red-gradient">Diverse Realms</span> of
              Anime Magic
            </h1>
            <p className="max-w-md text-base text-white/60 sm:text-lg">
              Search the catalog, filter by genre, and open any title for details
              plus AI-assisted recommendations.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="#explore"
              className="inline-flex items-center rounded-lg bg-gradient-to-r from-[#ff5956] to-[#ee1e38] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5956] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1117]"
            >
              Start exploring
            </a>
            {featured ? (
              <Link
                href={`/anime/${featured.id}`}
                className="inline-flex items-center rounded-lg border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5956]"
              >
                Featured: {featured.name}
              </Link>
            ) : null}
          </div>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-md"
        >
          {featured ? (
            <Link
              href={`/anime/${featured.id}`}
              className="group relative block aspect-[3/4] overflow-hidden rounded-2xl bg-[#161921] ring-1 ring-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5956]"
            >
              <Image
                src={shikimoriImageUrl(featured.image?.original)}
                alt={featured.name}
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 420px"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 space-y-1 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ff8a87]">
                  Trending now
                </p>
                <p className="text-2xl font-bold text-white">{featured.name}</p>
                <p className="text-sm text-white/60">
                  {featured.kind ?? "Anime"}
                  {featured.score && featured.score !== "0.0"
                    ? ` · ${featured.score}`
                    : ""}
                </p>
              </div>
            </Link>
          ) : (
            <div className="relative aspect-[3/4] w-full">
              <Image
                src="/anime.png"
                alt=""
                fill
                priority
                className="object-contain"
              />
            </div>
          )}
        </MotionDiv>
      </div>
    </header>
  );
}

export default Hero;
