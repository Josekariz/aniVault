import Image from "next/image";

import { shikimoriImageUrl } from "@/lib/shikimori";

interface AnimeScreenshotsProps {
  screenshots: { original: string; preview: string }[];
  title: string;
}

export default function AnimeScreenshots({
  screenshots,
  title,
}: AnimeScreenshotsProps) {
  if (!screenshots.length) return null;

  const items = screenshots.slice(0, 6);

  return (
    <section className="space-y-6" aria-labelledby="screenshots-heading">
      <div className="space-y-1">
        <h2
          id="screenshots-heading"
          className="font-display text-2xl font-semibold tracking-tight text-ink"
        >
          Screenshots
        </h2>
        <p className="text-sm text-ink-muted">A look inside {title}.</p>
      </div>

      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {items.map((shot) => (
          <li
            key={shot.original}
            className="relative aspect-video overflow-hidden rounded-2xl bg-surface-2 ring-1 ring-ink/8"
          >
            <Image
              src={shikimoriImageUrl(shot.preview || shot.original)}
              alt=""
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
