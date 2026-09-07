import Image from "next/image";
import Link from "next/link";

import { MotionDiv } from "./MotionDiv";
import { shikimoriImageUrl } from "@/lib/shikimori";
import type { AnimeListItem } from "@/types/anime";

interface Prop {
  anime: AnimeListItem;
  index: number;
}

const variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

function AnimeCard({ anime, index }: Prop) {
  const episodeCount = anime.episodes || anime.episodes_aired || "—";

  return (
    <MotionDiv
      variants={variants}
      initial="hidden"
      animate="visible"
      transition={{
        delay: Math.min(index * 0.08, 0.4),
        ease: "easeOut",
        duration: 0.35,
      }}
      className="group w-full"
    >
      <Link
        href={`/anime/${anime.id}`}
        className="block w-full rounded-xl outline-none transition duration-200 focus-visible:ring-2 focus-visible:ring-[#ff5956] focus-visible:ring-offset-2 focus-visible:ring-offset-app"
      >
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-app-soft">
          <Image
            src={shikimoriImageUrl(anime.image?.original)}
            alt={anime.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
          {anime.kind ? (
            <span className="absolute right-3 top-3 rounded-md bg-black/70 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
              {anime.kind}
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 py-4">
          <h2 className="line-clamp-2 text-lg font-semibold text-white transition group-hover:text-[#ff8a87]">
            {anime.name}
          </h2>
          <div className="flex items-center gap-4 text-sm text-white/80">
            <div className="flex items-center gap-1.5">
              <Image
                src="/episodes.svg"
                alt=""
                width={18}
                height={18}
                className="object-contain opacity-80"
              />
              <span className="font-medium">{episodeCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Image
                src="/star.svg"
                alt=""
                width={16}
                height={16}
                className="object-contain"
              />
              <span className="font-medium text-[#FFAD49]">
                {anime.score && anime.score !== "0.0" ? anime.score : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </MotionDiv>
  );
}

export default AnimeCard;
