"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import type { Genre } from "@/types/anime";

interface GenreFilterProps {
  genres: Genre[];
}

function buildHref(searchParams: URLSearchParams, genreId?: number) {
  const params = new URLSearchParams(searchParams.toString());
  if (genreId === undefined) {
    params.delete("genre");
  } else {
    params.set("genre", String(genreId));
  }
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

function GenreFilterInner({ genres }: GenreFilterProps) {
  const searchParams = useSearchParams();
  const active = searchParams.get("genre");

  if (genres.length === 0) return null;

  const chipClass = (isActive: boolean) =>
    [
      "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5956]",
      isActive
        ? "border-transparent bg-gradient-to-r from-[#ff5956] to-[#ee1e38] text-white"
        : "border-white/10 bg-[#161921] text-white/70 hover:border-white/25 hover:text-white",
    ].join(" ");

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/45">
          Genres
        </h3>
        {active ? (
          <Link
            href={buildHref(searchParams)}
            className="text-sm text-white/50 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5956]"
          >
            Clear
          </Link>
        ) : null}
      </div>

      <div
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]"
        role="list"
        aria-label="Filter by genre"
      >
        <Link
          href={buildHref(searchParams)}
          scroll={false}
          role="listitem"
          className={chipClass(!active)}
        >
          All
        </Link>
        {genres.map((genre) => (
          <Link
            key={genre.id}
            href={buildHref(searchParams, genre.id)}
            scroll={false}
            role="listitem"
            className={chipClass(active === String(genre.id))}
          >
            {genre.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function GenreFilter({ genres }: GenreFilterProps) {
  return (
    <Suspense
      fallback={
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-9 w-20 shrink-0 animate-pulse rounded-full bg-[#161921]"
            />
          ))}
        </div>
      }
    >
      <GenreFilterInner genres={genres} />
    </Suspense>
  );
}
