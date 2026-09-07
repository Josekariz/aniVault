import type { AnimeTrailer } from "@/types/anime";

interface AnimeTrailerEmbedProps {
  trailer: AnimeTrailer | null | undefined;
  title: string;
}

function trailerEmbedUrl(trailer: AnimeTrailer): string | null {
  if (!trailer.id || !trailer.site) return null;
  const site = trailer.site.toLowerCase();
  if (site === "youtube") {
    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(trailer.id)}`;
  }
  if (site === "dailymotion") {
    return `https://www.dailymotion.com/embed/video/${encodeURIComponent(trailer.id)}`;
  }
  return null;
}

/** Renders an embedded trailer when AniList provides one; otherwise renders nothing. */
export default function AnimeTrailerEmbed({
  trailer,
  title,
}: AnimeTrailerEmbedProps) {
  if (!trailer) return null;
  const src = trailerEmbedUrl(trailer);
  if (!src) return null;

  return (
    <section className="space-y-4" aria-labelledby="trailer-heading">
      <h2
        id="trailer-heading"
        className="font-display text-2xl font-semibold tracking-tight text-ink"
      >
        Trailer
      </h2>
      <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black shadow-soft">
        <iframe
          src={src}
          title={`${title} trailer`}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </section>
  );
}
