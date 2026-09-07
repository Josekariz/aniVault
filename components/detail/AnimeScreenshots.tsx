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
          className="text-2xl font-bold tracking-tight text-white"
        >
          Screenshots
        </h2>
        <p className="text-sm text-white/45">A look inside {title}.</p>
      </div>

      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {items.map((shot) => (
          <li
            key={shot.original}
            className="relative aspect-video overflow-hidden rounded-xl bg-[#161921] ring-1 ring-white/5"
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
