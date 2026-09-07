import type { AnimeDetail } from "@/types/anime";

interface AnimeMetaProps {
  anime: AnimeDetail;
}

function MetaCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-app-soft px-4 py-3">
      <dt className="text-xs uppercase tracking-wide text-white/40">{label}</dt>
      <dd
        className={`mt-1 text-lg font-semibold ${
          accent ? "text-[#FFAD49]" : "text-white"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function formatDuration(minutes: number | null | undefined) {
  if (!minutes) return "—";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

export default function AnimeMeta({ anime }: AnimeMetaProps) {
  const score =
    anime.score && anime.score !== "0.0" ? anime.score : "N/A";
  const episodes = anime.episodes || anime.episodes_aired || "—";
  const aired = [anime.aired_on, anime.released_on]
    .filter(Boolean)
    .join(" → ");

  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <MetaCard label="Score" value={score} accent />
      <MetaCard label="Episodes" value={episodes} />
      <MetaCard
        label="Rating"
        value={anime.rating ? anime.rating.replace(/_/g, " ") : "—"}
      />
      <MetaCard label="Duration" value={formatDuration(anime.duration)} />
      <MetaCard
        label="Status"
        value={anime.status ? anime.status.replace(/_/g, " ") : "—"}
      />
      <MetaCard label="Aired" value={aired || "—"} />
    </dl>
  );
}
