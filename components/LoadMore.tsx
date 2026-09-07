"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";

import { fetchAnimePage } from "@/app/actions/anime";
import AnimeCard from "./AnimeCard";
import { Spinner } from "./AnimeSkeleton";
import type { AnimeListItem, FetchAnimeParams } from "@/types/anime";

interface LoadMoreProps {
  initialPage?: number;
  /** From the SSR first page — avoid a wasted page-2 request when false. */
  initialHasMore?: boolean;
  filters?: Omit<FetchAnimeParams, "page" | "limit">;
  limit?: number;
}

function LoadMore({
  initialPage = 2,
  initialHasMore = true,
  filters = {},
  limit = 8,
}: LoadMoreProps) {
  const { ref, inView } = useInView({ rootMargin: "200px" });
  const [items, setItems] = useState<AnimeListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const pageRef = useRef(initialPage);
  const loadingRef = useRef(false);
  const filtersKey = JSON.stringify(filters);

  useEffect(() => {
    pageRef.current = initialPage;
    setItems([]);
    setError(null);
    setHasMore(initialHasMore);
    setIsLoading(false);
    loadingRef.current = false;
  }, [filtersKey, initialPage, initialHasMore]);

  const loadNext = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;
    setIsLoading(true);
    const page = pageRef.current;

    try {
      const result = await fetchAnimePage({ ...filters, page, limit });
      const next = result.media;

      if (next.length === 0) {
        setHasMore(false);
      } else {
        setItems((prev) => {
          const seen = new Set(prev.map((item) => item.id));
          const unique = next.filter((item) => !seen.has(item.id));
          return unique.length ? [...prev, ...unique] : prev;
        });
        pageRef.current = page + 1;
        setHasMore(Boolean(result.pageInfo.hasNextPage));
      }
      setError(null);
    } catch {
      setError("Couldn't load more from AniList. Try again in a moment.");
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

  if (!initialHasMore && items.length === 0 && !error) {
    return null;
  }

  return (
    <>
      {items.length > 0 ? (
        <section className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((anime, index) => (
            <AnimeCard key={anime.id} anime={anime} index={index} />
          ))}
        </section>
      ) : null}

      <section className="flex w-full flex-col items-center justify-center gap-3 py-6">
        {error ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-ink-muted">{error}</p>
            <button
              type="button"
              onClick={() => {
                setError(null);
                void loadNext();
              }}
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

        {!hasMore && !error && items.length > 0 ? (
          <p className="text-sm text-ink-subtle">You&apos;ve reached the end.</p>
        ) : null}
      </section>
    </>
  );
}

export default LoadMore;
