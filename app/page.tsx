import AnimeGrid from "@/components/AnimeGrid";
import GenreFilter from "@/components/GenreFilter";
import Hero from "@/components/Hero";
import LoadMore from "@/components/LoadMore";
import { fetchAnimeList, fetchGenres } from "@/app/actions/anime";
import type { AnimeListItem, Genre } from "@/types/anime";

interface HomeProps {
  searchParams: {
    search?: string;
    genre?: string;
  };
}

export default async function Home({ searchParams }: HomeProps) {
  const search = searchParams.search?.trim() || undefined;
  const genre =
    searchParams.genre && /^\d+$/.test(searchParams.genre)
      ? searchParams.genre
      : undefined;

  const filters = {
    search,
    genre,
    order: "popularity" as const,
  };

  let data: AnimeListItem[] = [];
  let genres: Genre[] = [];
  let loadError: string | null = null;

  try {
    const [animeResult, genreResult] = await Promise.all([
      fetchAnimeList({ page: 1, limit: 8, ...filters }),
      fetchGenres().catch(() => [] as Genre[]),
    ]);
    data = animeResult;
    genres = genreResult;
  } catch {
    loadError = "We couldn't load anime right now. Please try again shortly.";
  }

  const activeGenreName = genre
    ? genres.find((g) => String(g.id) === genre)?.name
    : undefined;

  const heading = search
    ? `Results for “${search}”`
    : activeGenreName
      ? activeGenreName
      : "Explore Anime";

  const subtitle = search
    ? "Server-side matches from Shikimori — not a filter of already-loaded cards."
    : activeGenreName
      ? `Browsing the ${activeGenreName} catalog.`
      : "Browse popular titles and open any card for details, related shows, and recommendations.";

  return (
    <>
      {!search && !genre ? <Hero featured={data[0] ?? null} /> : null}

      <main
        id="explore"
        className="flex scroll-mt-24 flex-col gap-8 px-8 py-12 sm:gap-10 sm:px-16 sm:py-16"
      >
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {heading}
          </h2>
          <p className="max-w-xl text-base text-ink-muted">{subtitle}</p>
        </div>

        {genres.length > 0 ? <GenreFilter genres={genres} /> : null}

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
            <LoadMore initialPage={2} filters={filters} />
          </>
        )}
      </main>
    </>
  );
}
