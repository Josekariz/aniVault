import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import AnimeGrid from "@/components/AnimeGrid";
import { fetchAnimeDetail, fetchSimilarAnime } from "@/app/actions/anime";
import { shikimoriImageUrl } from "@/lib/shikimori";

interface AnimePageProps {
  params: { id: string };
}

export default async function AnimePage({ params }: AnimePageProps) {
  const id = params.id;

  if (!id || Number.isNaN(Number(id))) {
    notFound();
  }

  let anime;
  try {
    anime = await fetchAnimeDetail(id);
  } catch {
    notFound();
  }

  let similar: Awaited<ReturnType<typeof fetchSimilarAnime>> = [];
  try {
    similar = await fetchSimilarAnime(id);
  } catch {
    similar = [];
  }

  const synopsis =
    anime.description?.trim() ||
    "No synopsis is available for this title yet.";

  return (
    <main className="flex flex-col gap-12 px-8 py-12 sm:px-16 sm:py-16">
      <Link
        href="/"
        className="w-fit text-sm font-medium text-white/50 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5956]"
      >
        ← Back to explore
      </Link>

      <section className="grid gap-10 lg:grid-cols-[280px_1fr]">
        <div className="relative mx-auto aspect-[2/3] w-full max-w-[280px] overflow-hidden rounded-2xl bg-[#161921] shadow-2xl shadow-black/40">
          <Image
            src={shikimoriImageUrl(anime.image?.original)}
            alt={anime.name}
            fill
            priority
            sizes="280px"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col gap-6">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.2em] text-white/40">
              {anime.kind ?? "Anime"}
              {anime.status ? ` · ${anime.status}` : ""}
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {anime.name}
            </h1>
            {anime.russian ? (
              <p className="text-lg text-white/50">{anime.russian}</p>
            ) : null}
          </div>

          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl bg-[#161921] px-4 py-3">
              <dt className="text-xs uppercase tracking-wide text-white/40">
                Score
              </dt>
              <dd className="mt-1 text-lg font-semibold text-[#FFAD49]">
                {anime.score && anime.score !== "0.0" ? anime.score : "N/A"}
              </dd>
            </div>
            <div className="rounded-xl bg-[#161921] px-4 py-3">
              <dt className="text-xs uppercase tracking-wide text-white/40">
                Episodes
              </dt>
              <dd className="mt-1 text-lg font-semibold text-white">
                {anime.episodes || anime.episodes_aired || "—"}
              </dd>
            </div>
            <div className="rounded-xl bg-[#161921] px-4 py-3">
              <dt className="text-xs uppercase tracking-wide text-white/40">
                Rating
              </dt>
              <dd className="mt-1 text-lg font-semibold capitalize text-white">
                {anime.rating ?? "—"}
              </dd>
            </div>
            <div className="rounded-xl bg-[#161921] px-4 py-3">
              <dt className="text-xs uppercase tracking-wide text-white/40">
                Aired
              </dt>
              <dd className="mt-1 text-lg font-semibold text-white">
                {anime.aired_on ?? "—"}
              </dd>
            </div>
          </dl>

          {anime.genres?.length ? (
            <ul className="flex flex-wrap gap-2">
              {anime.genres.map((genre) => (
                <li
                  key={genre.id}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/70"
                >
                  {genre.name}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-white">Synopsis</h2>
            <p className="max-w-3xl whitespace-pre-line leading-relaxed text-white/70">
              {synopsis}
            </p>
          </div>
        </div>
      </section>

      {similar.length > 0 ? (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Similar anime</h2>
          <AnimeGrid anime={similar.slice(0, 8)} />
        </section>
      ) : null}
    </main>
  );
}
