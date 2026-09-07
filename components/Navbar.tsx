"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  FormEvent,
  KeyboardEvent,
  Suspense,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from "react";

import { fetchSearchSuggestions } from "@/app/actions/anime";
import { formatScoreOutOfTen } from "@/lib/anilist/format";
import type { AnimeListItem } from "@/types/anime";

/** Slightly longer than before — AniList is at 30 req/min degraded. */
const DEBOUNCE_MS = 450;
const MIN_QUERY_LENGTH = 2;

function SearchField() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputId = useId();
  const [query, setQuery] = useState(searchParams.get("search") ?? "");
  const [suggestions, setSuggestions] = useState<AnimeListItem[]>([]);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [suggestError, setSuggestError] = useState(false);
  const [quotaSoftSkip, setQuotaSoftSkip] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blurRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    setQuery(searchParams.get("search") ?? "");
  }, [searchParams]);

  const commitSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = value.trim();

      if (trimmed) params.set("search", trimmed);
      else params.delete("search");

      const qs = params.toString();
      const href = qs ? `/?${qs}` : "/";

      if (pathname === "/") {
        router.replace(href, { scroll: false });
      } else {
        router.push(href);
      }
    },
    [pathname, router, searchParams]
  );

  const loadSuggestions = useCallback((value: string) => {
    const trimmed = value.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setSuggestError(false);
      setQuotaSoftSkip(false);
      setOpen(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    startTransition(async () => {
      try {
        const result = await fetchSearchSuggestions(trimmed);
        if (requestId !== requestIdRef.current) return;

        if (result.status === "skipped") {
          setSuggestions([]);
          setSuggestError(false);
          setQuotaSoftSkip(true);
          setOpen(true);
          return;
        }

        if (result.status === "error") {
          setSuggestions([]);
          setSuggestError(true);
          setQuotaSoftSkip(false);
          setOpen(true);
          return;
        }

        setSuggestions(result.media);
        setSuggestError(false);
        setQuotaSoftSkip(false);
        setOpen(true);
      } catch {
        if (requestId !== requestIdRef.current) return;
        setSuggestions([]);
        setSuggestError(true);
        setQuotaSoftSkip(false);
        setOpen(true);
      }
    });
  }, []);

  const onChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      loadSuggestions(value);
    }, DEBOUNCE_MS);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // Invalidate in-flight typeahead — Enter navigates; don't spend another request.
    requestIdRef.current += 1;
    setOpen(false);
    setSuggestions([]);
    setQuotaSoftSkip(false);
    setSuggestError(false);
    commitSearch(query);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (blurRef.current) clearTimeout(blurRef.current);
    };
  }, []);

  const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];
  const showEmpty =
    !suggestError &&
    !quotaSoftSkip &&
    safeSuggestions.length === 0 &&
    query.trim().length >= MIN_QUERY_LENGTH;

  return (
    <div className="relative w-full max-w-md">
      <form onSubmit={onSubmit} role="search" className="relative">
        <label htmlFor={inputId} className="sr-only">
          Search anime
        </label>
        <input
          id={inputId}
          type="search"
          value={query}
          placeholder="Search anime…"
          autoComplete="off"
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => {
            if (
              safeSuggestions.length > 0 ||
              suggestError ||
              quotaSoftSkip
            ) {
              setOpen(true);
            }
          }}
          onBlur={() => {
            blurRef.current = setTimeout(() => setOpen(false), 150);
          }}
          className="w-full rounded-full border border-white/10 bg-surface py-2.5 pl-4 pr-10 text-sm text-ink shadow-sm placeholder:text-ink-subtle transition hover:border-white/20 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
        {isPending ? (
          <span
            aria-hidden
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-ink/15 border-t-accent"
          />
        ) : (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle">
            ⌕
          </span>
        )}
      </form>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl border border-white/10 bg-surface-2 shadow-xl shadow-black/40">
          {suggestError ? (
            <p className="px-4 py-3 text-sm text-ink-muted">
              AniList search failed. Press Enter to search the catalog.
            </p>
          ) : null}

          {quotaSoftSkip ? (
            <p className="px-4 py-3 text-sm text-ink-muted">
              Suggestions paused to save AniList quota. Press Enter to search.
            </p>
          ) : null}

          {showEmpty ? (
            <p className="px-4 py-3 text-sm text-ink-muted">No matches found.</p>
          ) : null}

          <ul className="max-h-80 overflow-y-auto py-1">
            {safeSuggestions.map((anime) => {
              const score = formatScoreOutOfTen(anime.averageScore);
              return (
                <li key={anime.id}>
                  <Link
                    href={`/anime/${anime.id}`}
                    className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-surface focus-visible:bg-surface focus-visible:outline-none"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <span className="relative h-12 w-9 shrink-0 overflow-hidden rounded-md bg-surface-2">
                      <Image
                        src={anime.coverImage || "/logo.svg"}
                        alt=""
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">
                        {anime.displayTitle}
                      </span>
                      <span className="block text-xs capitalize text-ink-subtle">
                        {anime.format?.replace(/_/g, " ") ?? "anime"}
                        {score ? ` · ${score}` : ""}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function NavbarInner() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-canvas/90 backdrop-blur-xl">
      <nav className="page-shell flex items-center gap-4 py-3 sm:gap-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Image
            src="/logo.svg"
            alt=""
            width={34}
            height={32}
            className="object-contain"
          />
          <span className="font-display hidden text-sm font-semibold tracking-wide text-ink sm:inline">
            Anime Vault
          </span>
        </Link>

        <div className="min-w-0 flex-1">
          <SearchField />
        </div>

        <Link
          href="/#explore"
          className="hidden shrink-0 rounded-full px-3 py-2 text-sm font-medium text-ink-muted transition hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:inline-flex"
        >
          Explore
        </Link>
      </nav>
    </header>
  );
}

export default function Navbar() {
  return (
    <Suspense
      fallback={
        <header className="sticky top-0 z-40 border-b border-white/10 bg-canvas/90 backdrop-blur-xl">
          <div className="page-shell flex h-[60px] items-center">
            <div className="h-9 w-full max-w-md animate-pulse rounded-full bg-surface" />
          </div>
        </header>
      }
    >
      <NavbarInner />
    </Suspense>
  );
}
