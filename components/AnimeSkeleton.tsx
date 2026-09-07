export function AnimeSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="w-full animate-pulse">
          <div className="aspect-[2/3] w-full rounded-xl bg-app-elevated" />
          <div className="mt-4 space-y-3">
            <div className="h-5 w-[80%] rounded bg-app-elevated" />
            <div className="flex gap-4">
              <div className="h-4 w-12 rounded bg-app-elevated" />
              <div className="h-4 w-12 rounded bg-app-elevated" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-[#ff5956] ${className}`}
    />
  );
}
