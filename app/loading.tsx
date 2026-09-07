import { AnimeSkeleton } from "@/components/AnimeSkeleton";

export default function Loading() {
  return (
    <main className="flex flex-col gap-8 px-8 py-12 sm:gap-10 sm:px-16 sm:py-16">
      <div className="space-y-3">
        <div className="h-9 w-48 animate-pulse rounded-lg bg-surface-2" />
        <div className="h-4 w-72 max-w-full animate-pulse rounded bg-surface-2" />
      </div>
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-9 w-20 shrink-0 animate-pulse rounded-full bg-surface-2"
          />
        ))}
      </div>
      <AnimeSkeleton count={8} />
    </main>
  );
}
