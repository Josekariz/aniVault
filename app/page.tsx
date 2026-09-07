import AnimeGrid from "@/components/AnimeGrid";
import LoadMore from "@/components/LoadMore";
import { fetchAnimeList } from "@/app/actions/anime";

export default async function Home() {
  let data: Awaited<ReturnType<typeof fetchAnimeList>> = [];
  let loadError: string | null = null;

  try {
    data = await fetchAnimeList({ page: 1, limit: 8, order: "popularity" });
  } catch {
    loadError = "We couldn't load anime right now. Please try again shortly.";
  }

  return (
    <main
      id="explore"
      className="flex scroll-mt-8 flex-col gap-10 px-8 py-12 sm:px-16 sm:py-16"
    >
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Explore Anime
        </h2>
        <p className="max-w-xl text-base text-white/55">
          Browse popular titles and open any card for details, related shows, and
          recommendations.
        </p>
      </div>

      {loadError ? (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-8 text-center"
        >
          <p className="font-medium text-red-200">{loadError}</p>
        </div>
      ) : (
        <>
          <AnimeGrid anime={data} />
          <LoadMore initialPage={2} />
        </>
      )}
    </main>
  );
}
