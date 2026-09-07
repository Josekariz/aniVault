"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Spinner } from "@/components/AnimeSkeleton";
import { MotionDiv } from "@/components/MotionDiv";
import type {
  RecommendRequestBody,
  RecommendSuccessResponse,
  RecommendationItem,
} from "@/types/recommend";

interface RecommendSectionProps {
  animeId: number;
  name: string;
  genres: string[];
  synopsis?: string | null;
}

function RecommendationCard({
  item,
  index,
}: {
  item: RecommendationItem;
  index: number;
}) {
  const href = item.shikimoriId ? `/anime/${item.shikimoriId}` : undefined;

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-white group-hover:text-[#ff8a87]">
          {item.title}
        </h3>
        <span className="shrink-0 rounded-md bg-black/30 px-2 py-0.5 text-xs text-white/40">
          #{index + 1}
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-white/60">{item.reason}</p>
      {href ? (
        <span className="mt-3 inline-flex text-xs font-medium text-[#ff8a87]">
          View details →
        </span>
      ) : null}
    </>
  );

  const className =
    "group block h-full rounded-xl border border-white/5 bg-[#161921] p-4 transition hover:border-[#ff5956]/40 hover:bg-[#1a1e28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5956]";

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

export default function RecommendSection({
  animeId,
  name,
  genres,
  synopsis,
}: RecommendSectionProps) {
  const [data, setData] = useState<RecommendSuccessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const genresKey = useMemo(() => JSON.stringify(genres), [genres]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      const body: RecommendRequestBody = {
        animeId,
        name,
        genres: JSON.parse(genresKey) as string[],
        synopsis,
      };

      try {
        const response = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        const payload = (await response.json()) as
          | RecommendSuccessResponse
          | { error?: string };

        if (cancelled) return;

        if (!response.ok || !("recommendations" in payload)) {
          setError(
            ("error" in payload && payload.error) ||
              "Recommendations are temporarily unavailable."
          );
          setData(null);
          return;
        }

        setData(payload);
      } catch (err) {
        if (
          cancelled ||
          (err instanceof DOMException && err.name === "AbortError")
        ) {
          return;
        }
        setError("Recommendations are temporarily unavailable.");
        setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [animeId, name, genresKey, synopsis]);

  return (
    <section className="space-y-6" aria-labelledby="recommend-heading">
      <div className="space-y-1">
        <h2
          id="recommend-heading"
          className="text-2xl font-bold tracking-tight text-white"
        >
          Recommended for you
        </h2>
        <p className="text-sm text-white/45">
          AI picks based on this title — with a Shikimori fallback if Gemini is
          unavailable.
        </p>
      </div>

      {loading ? (
        <div className="flex min-h-[140px] items-center justify-center rounded-xl border border-white/5 bg-[#161921]">
          <div className="flex flex-col items-center gap-3">
            <Spinner />
            <p className="text-sm text-white/45">Finding recommendations…</p>
          </div>
        </div>
      ) : null}

      {!loading && error ? (
        <div
          role="alert"
          className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-100"
        >
          {error}
        </div>
      ) : null}

      {!loading && data ? (
        <MotionDiv
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-4"
        >
          {data.source === "fallback" && data.message ? (
            <p className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/55">
              {data.message}
            </p>
          ) : (
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#ff8a87]">
              Powered by Gemini
            </p>
          )}

          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {data.recommendations.map((item, index) => (
              <li key={`${item.title}-${index}`}>
                <RecommendationCard item={item} index={index} />
              </li>
            ))}
          </ul>
        </MotionDiv>
      ) : null}
    </section>
  );
}
