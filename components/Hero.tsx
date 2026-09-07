"use client";

import Image from "next/image";
import Link from "next/link";

import { MotionDiv } from "@/components/MotionDiv";
import { formatScoreOutOfTen } from "@/lib/anilist/format";
import type { AnimeListItem } from "@/types/anime";

interface HeroProps {
  featured?: AnimeListItem | null;
}

function Hero({ featured }: HeroProps) {
  const score = featured ? formatScoreOutOfTen(featured.averageScore) : null;
  const cover = featured?.coverImage || "/anime.png";

  return (
    <header className="relative overflow-hidden">
      <div className="absolute inset-0 bg-hero bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#10131a]/92 via-[#10131a]/75 to-[#10131a]/35" />
      <div className="absolute -left-16 top-10 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />

      <div className="page-shell relative grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr]">
        <MotionDiv
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="flex flex-col gap-7 text-white"
        >
          <Image
            src="/logo.svg"
            alt="Anime Vault"
            width={88}
            height={82}
            className="object-contain"
            priority
          />
          <div className="space-y-4">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
              Anime discovery
            </p>
            <h1 className="font-display max-w-xl text-5xl font-semibold leading-[1.05] sm:text-6xl">
              Explore The <span className="red-gradient">Diverse Realms</span> of
              Anime Magic
            </h1>
            <p className="max-w-md text-base text-white/70 sm:text-lg">
              Search the catalog, filter by genre, and open any title for
              details. AI recommendations stay opt-in.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="#explore"
              className="inline-flex items-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Start exploring
            </a>
            {featured ? (
              <Link
                href={`/anime/${featured.id}`}
                className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Featured: {featured.displayTitle}
              </Link>
            ) : null}
          </div>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-md"
        >
          {featured ? (
            <Link
              href={`/anime/${featured.id}`}
              className="group relative block aspect-[3/4] overflow-hidden rounded-[1.75rem] bg-white/10 shadow-soft ring-1 ring-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Image
                src={cover}
                alt={featured.displayTitle}
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 420px"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 space-y-1 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ff8a87]">
                  Trending now
                </p>
                <p className="font-display text-2xl font-semibold text-white">
                  {featured.displayTitle}
                </p>
                <p className="text-sm text-white/65">
                  {featured.format?.replace(/_/g, " ") ?? "Anime"}
                  {score ? ` · ${score}` : ""}
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
