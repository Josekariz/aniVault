import { formatFuzzyDate, formatScoreOutOfTen } from "@/lib/anilist/format";
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
    <div className="rounded-2xl border border-white/10 bg-surface px-4 py-3 shadow-sm">
      <dt className="text-xs uppercase tracking-wide text-ink-subtle">{label}</dt>
      <dd
        className={`mt-1 text-lg font-semibold ${
          accent ? "text-score" : "text-ink"
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
  const score = formatScoreOutOfTen(anime.averageScore) ?? "N/A";
  const aired = [formatFuzzyDate(anime.startDate), formatFuzzyDate(anime.endDate)]
    .filter(Boolean)
    .join(" → ");

  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <MetaCard label="Score" value={score} accent />
      <MetaCard label="Episodes" value={anime.episodes ?? "—"} />
      <MetaCard
        label="Format"
        value={anime.format ? anime.format.replace(/_/g, " ") : "—"}
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
