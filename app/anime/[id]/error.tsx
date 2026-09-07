"use client";

import Link from "next/link";

export default function AnimeError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex flex-col items-center justify-center gap-6 px-8 py-24 text-center">
      <h2 className="text-2xl font-bold text-white">Couldn&apos;t load this anime</h2>
      <p className="max-w-md text-white/60">
        The detail page failed to load from AniList. You can retry or return to
        explore.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-gradient-to-r from-[#ff5956] to-[#ee1e38] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5956]"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-white/15 bg-[#161921] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1f2430] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5956]"
        >
          Back to explore
        </Link>
      </div>
    </main>
  );
}
