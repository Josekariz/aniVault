"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  FormEvent,
  Suspense,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from "react";

import { fetchAnimeList } from "@/app/actions/anime";
import { shikimoriImageUrl } from "@/lib/shikimori";
import type { AnimeListItem } from "@/types/anime";

const DEBOUNCE_MS = 350;

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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blurRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  // Keep input in sync when URL changes (genre chips / back button).
  useEffect(() => {
    setQuery(searchParams.get("search") ?? "");
  }, [searchParams]);

  const pushSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = value.trim();

      if (trimmed) params.set("search", trimmed);
      else params.delete("search");

      // Search always lands on the catalog.
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
    if (trimmed.length < 2) {
      setSuggestions([]);
      setSuggestError(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    startTransition(async () => {
      try {
        const results = await fetchAnimeList({
          search: trimmed,
          limit: 6,
          order: "popularity",
        });
        if (requestId !== requestIdRef.current) return;
        setSuggestions(results);
        setSuggestError(false);
        setOpen(true);
      } catch {
        if (requestId !== requestIdRef.current) return;
        setSuggestions([]);
        setSuggestError(true);
        setOpen(true);
      }
    });
  }, []);

  const onChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      pushSearch(value);
      loadSuggestions(value);
    }, DEBOUNCE_MS);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    pushSearch(query);
    loadSuggestions(query);
    setOpen(false);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (blurRef.current) clearTimeout(blurRef.current);
    };
  }, []);

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
          onFocus={() => {
            if (suggestions.length > 0 || suggestError) setOpen(true);
          }}
          onBlur={() => {
            blurRef.current = setTimeout(() => setOpen(false), 150);
          }}
          className="w-full rounded-xl border border-white/10 bg-[#161921] py-2.5 pl-4 pr-10 text-sm text-white placeholder:text-white/35 transition hover:border-white/20 focus:border-[#ff5956]/60 focus:outline-none focus:ring-2 focus:ring-[#ff5956]/40"
        />
        {isPending ? (
          <span
            aria-hidden
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-white/20 border-t-[#ff5956]"
          />
        ) : (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
            ⌕
          </span>
        )}
      </form>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-xl border border-white/10 bg-[#12151c] shadow-2xl shadow-black/50">
          {suggestError ? (
            <p className="px-4 py-3 text-sm text-white/55">
              Search failed. Showing catalog results from the URL instead.
            </p>
          ) : null}

          {!suggestError && suggestions.length === 0 && query.trim().length >= 2 ? (
            <p className="px-4 py-3 text-sm text-white/55">No matches found.</p>
          ) : null}

          <ul className="max-h-80 overflow-y-auto py-1">
            {suggestions.map((anime) => (
              <li key={anime.id}>
                <Link
                  href={`/anime/${anime.id}`}
                  className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-white/5 focus-visible:bg-white/5 focus-visible:outline-none"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <span className="relative h-12 w-9 shrink-0 overflow-hidden rounded-md bg-[#1a1d27]">
                    <Image
                      src={shikimoriImageUrl(anime.image?.original)}
                      alt=""
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-white">
                      {anime.name}
                    </span>
                    <span className="block text-xs capitalize text-white/45">
                      {anime.kind ?? "anime"}
                      {anime.score && anime.score !== "0.0"
                        ? ` · ${anime.score}`
                        : ""}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function NavbarInner() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0F1117]/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:gap-6 sm:px-8 lg:px-16">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5956]"
        >
          <Image
            src="/logo.svg"
            alt=""
            width={36}
            height={34}
            className="object-contain"
          />
          <span className="hidden text-sm font-semibold tracking-wide text-white sm:inline">
            Anime Vault
          </span>
        </Link>

        <div className="min-w-0 flex-1">
          <SearchField />
        </div>

        <Link
          href="/#explore"
          className="hidden shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5956] md:inline-flex"
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
        <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0F1117]/90 backdrop-blur-md">
          <div className="mx-auto flex h-[60px] max-w-7xl items-center px-4 sm:px-8 lg:px-16">
            <div className="h-9 w-full max-w-md animate-pulse rounded-xl bg-[#161921]" />
          </div>
        </header>
      }
    >
      <NavbarInner />
    </Suspense>
  );
}
