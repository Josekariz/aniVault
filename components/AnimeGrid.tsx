import AnimeCard from "@/components/AnimeCard";

import type { AnimeListItem } from "@/types/anime";

interface AnimeGridProps {
  anime: AnimeListItem[];
  emptyMessage?: string;
}

export default function AnimeGrid({
  anime,
  emptyMessage = "No anime found.",
}: AnimeGridProps) {
  if (anime.length === 0) {
    return (
      <p className="rounded-xl border border-white/12 bg-app-soft px-6 py-10 text-center text-white/65">
        {emptyMessage}
      </p>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {anime.map((item, index) => (
        <AnimeCard key={item.id} anime={item} index={index} />
      ))}
    </section>
  );
}
