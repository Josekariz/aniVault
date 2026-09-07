import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center gap-6 px-8 py-24 text-center">
      <p className="text-sm uppercase tracking-[0.2em] text-white/40">404</p>
      <h2 className="text-2xl font-bold text-white">Anime not found</h2>
      <p className="max-w-md text-white/60">
        That title doesn&apos;t exist or couldn&apos;t be fetched from AniList.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-gradient-to-r from-[#ff5956] to-[#ee1e38] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5956]"
      >
        Back to explore
      </Link>
    </main>
  );
}
