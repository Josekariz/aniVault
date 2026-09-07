import type { AnimeListItem } from "@/types/anime";
import AnimeCard from "@/components/AnimeCard";

interface AnimeGridProps {
  anime: AnimeListItem[];
  emptyMessage?: string;
}

export default function AnimeGrid({
  anime,
  emptyMessage = "No anime found.",
}: AnimeGridProps) {
  if (!Array.isArray(anime) || anime.length === 0) {
    return (
      <p className="rounded-2xl border border-white/10 bg-surface px-6 py-10 text-center text-ink-muted shadow-sm">
        {emptyMessage}
      </p>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {anime.map((item, index) => (
        <AnimeCard key={item.id} anime={item} index={index} />
      ))}
    </section>
  );
}
