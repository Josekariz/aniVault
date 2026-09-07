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
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
      isActive
        ? "border-transparent bg-accent text-white"
        : "border-ink/10 bg-white text-ink-muted hover:border-ink/20 hover:text-ink",
    ].join(" ");

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-ink-subtle">
          Genres
        </h3>
        {active ? (
          <Link
            href={buildHref(searchParams)}
            className="text-sm text-ink-subtle transition hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
              className="h-9 w-20 shrink-0 animate-pulse rounded-full bg-surface-2"
            />
          ))}
        </div>
      }
    >
      <GenreFilterInner genres={genres} />
    </Suspense>
  );
}
