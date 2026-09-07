import { AnimeSkeleton } from "@/components/AnimeSkeleton";

export default function Loading() {
  return (
    <main className="flex flex-col gap-10 px-8 py-12 sm:px-16 sm:py-16">
      <div className="space-y-3">
        <div className="h-9 w-48 animate-pulse rounded-lg bg-[#1a1d27]" />
        <div className="h-4 w-72 max-w-full animate-pulse rounded bg-[#1a1d27]" />
      </div>
      <AnimeSkeleton count={8} />
    </main>
  );
}
