"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";

import { fetchAnimeList } from "@/app/actions/anime";
import AnimeCard from "./AnimeCard";
import { Spinner } from "./AnimeSkeleton";
import type { AnimeListItem, FetchAnimeParams } from "@/types/anime";

interface LoadMoreProps {
  initialPage?: number;
  filters?: Omit<FetchAnimeParams, "page" | "limit">;
  limit?: number;
}

function LoadMore({
  initialPage = 2,
  filters = {},
  limit = 8,
}: LoadMoreProps) {
  const { ref, inView } = useInView({ rootMargin: "200px" });
  const [items, setItems] = useState<AnimeListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const pageRef = useRef(initialPage);
  const loadingRef = useRef(false);
  const filtersKey = JSON.stringify(filters);

  // Reset when filters change (search/genre in later chunks).
  useEffect(() => {
    pageRef.current = initialPage;
    setItems([]);
    setError(null);
    setHasMore(true);
    setIsLoading(false);
    loadingRef.current = false;
  }, [filtersKey, initialPage]);

  const loadNext = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;
    setIsLoading(true);
    const page = pageRef.current;

    try {
      const next = await fetchAnimeList({ ...filters, page, limit });
      if (next.length === 0) {
        setHasMore(false);
      } else {
        setItems((prev) => [...prev, ...next]);
        pageRef.current = page + 1;
        if (next.length < limit) setHasMore(false);
      }
      setError(null);
    } catch {
      setError("Couldn't load more anime. Try again.");
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [filters, hasMore, limit]);

  useEffect(() => {
    if (inView && hasMore && !loadingRef.current && !error) {
      void loadNext();
    }
  }, [inView, hasMore, loadNext, items.length, error]);

  return (
    <>
      {items.length > 0 ? (
        <section className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((anime, index) => (
            <AnimeCard key={`${anime.id}-${index}`} anime={anime} index={index} />
          ))}
        </section>
      ) : null}

      <section className="flex w-full flex-col items-center justify-center gap-3 py-6">
        {error ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-ink-muted">{error}</p>
            <button
              type="button"
              onClick={() => void loadNext()}
              className="rounded-full bg-surface px-4 py-2 text-sm font-medium text-ink shadow-sm ring-1 ring-white/10 transition hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Retry
            </button>
          </div>
        ) : null}

        {hasMore && !error ? (
          <div ref={ref} className="flex min-h-12 items-center justify-center">
            {isLoading || inView ? <Spinner /> : null}
          </div>
        ) : null}

        {!hasMore && !error ? (
          <p className="text-sm text-ink-subtle">You&apos;ve reached the end.</p>
        ) : null}
      </section>
    </>
  );
}

export default LoadMore;
