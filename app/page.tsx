import AnimeGrid from "@/components/AnimeGrid";
import GenreFilter from "@/components/GenreFilter";
import Hero from "@/components/Hero";
import LoadMore from "@/components/LoadMore";
import { fetchAnimePage } from "@/app/actions/anime";
import { ANIME_GENRES, isValidGenre } from "@/lib/anilist/genres";
import type { AnimeListItem } from "@/types/anime";

interface HomeProps {
  searchParams: {
    search?: string;
    genre?: string;
  };
}

export default async function Home({ searchParams }: HomeProps) {
  const search = searchParams.search?.trim() || undefined;
  const genre = isValidGenre(searchParams.genre)
    ? searchParams.genre
    : undefined;

  const filters = {
    search,
    genre,
    sort: "POPULARITY_DESC" as const,
  };

  let data: AnimeListItem[] = [];
  let hasNextPage = false;
  let loadError: string | null = null;

  try {
    const page = await fetchAnimePage({ page: 1, limit: 8, ...filters });
    data = page.media;
    hasNextPage = page.pageInfo.hasNextPage;
  } catch {
    loadError =
      "We couldn't load anime from AniList right now. Please try again shortly.";
  }

  const heading = search
    ? `Results for “${search}”`
    : genre
      ? genre
      : "Explore Anime";

  const subtitle = search
    ? "Live AniList search — not a filter of already-loaded cards."
    : genre
      ? `Browsing ${genre} titles sorted by popularity.`
      : "Browse popular titles and open any card for details, related shows, and recommendations.";

  return (
    <>
      {!search && !genre ? <Hero featured={data[0] ?? null} /> : null}

      <main
        id="explore"
        className="page-shell flex scroll-mt-24 flex-col gap-8 py-12 sm:gap-10 sm:py-16"
      >
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {heading}
          </h2>
          <p className="max-w-xl text-base text-ink-muted">{subtitle}</p>
        </div>

        <GenreFilter genres={ANIME_GENRES} />

        {loadError ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-8 text-center"
          >
            <p className="font-medium text-red-200">{loadError}</p>
          </div>
        ) : (
          <>
            <AnimeGrid
              anime={data}
              emptyMessage={
                search || genre
                  ? "No anime matched those filters. Try another search or genre."
                  : "No anime found."
              }
            />
            <LoadMore
              initialPage={2}
              initialHasMore={hasNextPage}
              filters={filters}
            />
          </>
        )}
      </main>
    </>
  );
}
