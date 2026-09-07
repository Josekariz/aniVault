export default function AnimeLoading() {
  return (
    <main className="page-shell flex flex-col gap-12 py-10 sm:gap-14 sm:py-14">
      <div className="h-4 w-40 animate-pulse rounded bg-surface-2" />

      <div className="overflow-hidden rounded-3xl ring-1 ring-white/10">
        <div className="grid gap-10 bg-surface/40 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[280px_1fr]">
          <div className="mx-auto aspect-[2/3] w-full max-w-[280px] animate-pulse rounded-3xl bg-surface-2" />
          <div className="space-y-5">
            <div className="h-4 w-28 animate-pulse rounded bg-surface-2" />
            <div className="h-12 w-[75%] max-w-lg animate-pulse rounded-lg bg-surface-2" />
            <div className="h-5 w-48 animate-pulse rounded bg-surface-2" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-20 animate-pulse rounded-full bg-surface-2"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-surface-2" />
        ))}
      </div>

      <div className="space-y-3">
        <div className="h-7 w-28 animate-pulse rounded bg-surface-2" />
        <div className="h-4 w-full max-w-3xl animate-pulse rounded bg-surface-2" />
        <div className="h-4 w-5/6 max-w-2xl animate-pulse rounded bg-surface-2" />
        <div className="h-4 w-2/3 max-w-xl animate-pulse rounded bg-surface-2" />
      </div>

      <div className="aspect-video animate-pulse rounded-2xl bg-surface-2" />
    </main>
  );
}
