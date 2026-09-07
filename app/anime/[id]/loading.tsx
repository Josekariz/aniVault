import { AnimeSkeleton } from "@/components/AnimeSkeleton";

export default function AnimeLoading() {
  return (
    <main className="flex flex-col gap-12 px-8 py-12 sm:px-16 sm:py-16">
      <div className="h-4 w-32 animate-pulse rounded bg-[#1a1d27]" />
      <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
        <div className="mx-auto aspect-[2/3] w-full max-w-[280px] animate-pulse rounded-2xl bg-[#1a1d27]" />
        <div className="space-y-6">
          <div className="h-10 w-[75%] max-w-md animate-pulse rounded-lg bg-[#1a1d27]" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-xl bg-[#1a1d27]"
              />
            ))}
          </div>
          <div className="space-y-3">
            <div className="h-4 w-full animate-pulse rounded bg-[#1a1d27]" />
            <div className="h-4 w-[83%] animate-pulse rounded bg-[#1a1d27]" />
            <div className="h-4 w-[66%] animate-pulse rounded bg-[#1a1d27]" />
          </div>
        </div>
      </div>
      <AnimeSkeleton count={4} />
    </main>
  );
}
