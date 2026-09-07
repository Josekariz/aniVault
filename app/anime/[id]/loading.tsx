import { AnimeSkeleton } from "@/components/AnimeSkeleton";

export default function AnimeLoading() {
  return (
    <main className="flex flex-col gap-12 px-8 py-10 sm:gap-14 sm:px-16 sm:py-14">
      <div className="h-4 w-40 animate-pulse rounded bg-[#1a1d27]" />

      <div className="grid gap-10 lg:grid-cols-[300px_1fr]">
        <div className="mx-auto aspect-[2/3] w-full max-w-[300px] animate-pulse rounded-2xl bg-[#1a1d27]" />
        <div className="space-y-5">
          <div className="h-4 w-28 animate-pulse rounded bg-[#1a1d27]" />
          <div className="h-12 w-[75%] max-w-lg animate-pulse rounded-lg bg-[#1a1d27]" />
          <div className="h-5 w-48 animate-pulse rounded bg-[#1a1d27]" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-8 w-20 animate-pulse rounded-full bg-[#1a1d27]"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-xl bg-[#1a1d27]"
          />
        ))}
      </div>

      <div className="space-y-3">
        <div className="h-7 w-32 animate-pulse rounded bg-[#1a1d27]" />
        <div className="h-4 w-full max-w-3xl animate-pulse rounded bg-[#1a1d27]" />
        <div className="h-4 w-[90%] max-w-3xl animate-pulse rounded bg-[#1a1d27]" />
        <div className="h-4 w-[70%] max-w-2xl animate-pulse rounded bg-[#1a1d27]" />
      </div>

      <AnimeSkeleton count={4} />
    </main>
  );
}
