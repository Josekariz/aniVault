"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import { Spinner } from "@/components/AnimeSkeleton";
import type { AnimeListItem } from "@/types/anime";
import type {
  RecommendRequestBody,
  RecommendSuccessResponse,
  RecommendationItem,
} from "@/types/recommend";

interface RecommendChatProps {
  animeId: number;
  name: string;
  genres: string[];
  synopsis?: string | null;
  similar: AnimeListItem[];
}

type ChatMessage =
  | { id: string; role: "assistant" | "user"; text: string }
  | {
      id: string;
      role: "recs";
      source: "gemini" | "fallback";
      items: RecommendationItem[];
    };

function RecCards({ items }: { items: RecommendationItem[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, index) => {
        const href = item.shikimoriId
          ? `/anime/${item.shikimoriId}`
          : undefined;
        const inner = (
          <>
            <p className="text-sm font-semibold text-white">
              {index + 1}. {item.title}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-white/65">
              {item.reason}
            </p>
          </>
        );

        return (
          <li key={`${item.title}-${index}`}>
            {href ? (
              <Link
                href={href}
                className="block rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition hover:border-[#ff5956]/40 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5956]"
              >
                {inner}
              </Link>
            ) : (
              <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                {inner}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function RecommendChat({
  animeId,
  name,
  genres,
  synopsis,
  similar,
}: RecommendChatProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [geminiUsed, setGeminiUsed] = useState(false);
  const seedRecs = useMemo(
    () =>
      similar.slice(0, 3).map((anime) => ({
        title: anime.name,
        reason: "Similar on Shikimori — no AI used.",
        shikimoriId: anime.id,
      })),
    [similar]
  );

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "welcome",
      role: "assistant",
      text: `Want picks related to ${name}? I can show free catalog matches, or use Gemini once if you ask.`,
    },
    ...(seedRecs.length
      ? ([
          {
            id: "seed-recs",
            role: "recs" as const,
            source: "fallback" as const,
            items: seedRecs,
          },
        ] as ChatMessage[])
      : []),
  ]);

  const genresKey = useMemo(() => JSON.stringify(genres), [genres]);

  async function requestRecommendations(options: {
    useGemini: boolean;
    message?: string;
  }) {
    if (loading) return;
    if (options.useGemini && geminiUsed) {
      setMessages((prev) => [
        ...prev,
        {
          id: `limit-${Date.now()}`,
          role: "assistant",
          text: "Gemini is limited to one ask per title here to save quota. Use the free catalog matches above, or browse Similar on the page.",
        },
      ]);
      return;
    }

    setLoading(true);
    const body: RecommendRequestBody = {
      animeId,
      name,
      genres: JSON.parse(genresKey) as string[],
      synopsis: synopsis?.slice(0, 180) ?? null,
      message: options.message,
      useGemini: options.useGemini,
    };

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await response.json()) as
        | RecommendSuccessResponse
        | { error?: string };

      if (!response.ok || !("recommendations" in payload)) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            text:
              ("error" in payload && payload.error) ||
              "Couldn't fetch recommendations right now.",
          },
        ]);
        return;
      }

      if (payload.source === "gemini") setGeminiUsed(true);

      setMessages((prev) => [
        ...prev,
        {
          id: `reply-${Date.now()}`,
          role: "assistant",
          text:
            payload.reply ||
            (payload.source === "gemini"
              ? "Here are a few AI picks."
              : "Here are catalog matches."),
        },
        {
          id: `recs-${Date.now()}`,
          role: "recs",
          source: payload.source,
          items: payload.recommendations,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          text: "Network error — try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: "user", text },
    ]);
    void requestRecommendations({ useGemini: true, message: text });
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 sm:bottom-8 sm:right-8">
      {open ? (
        <div className="flex h-[min(32rem,70vh)] w-[min(22rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-white/12 bg-[#1c2130] shadow-2xl shadow-black/40">
          <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-white">Ask AniVault</p>
              <p className="text-[11px] text-white/50">
                Free similar first · Gemini on demand (1×)
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-1 text-sm text-white/60 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5956]"
              aria-label="Close chat"
            >
              ✕
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {messages.map((message) => {
              if (message.role === "recs") {
                return (
                  <div key={message.id} className="space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
                      {message.source === "gemini"
                        ? "Gemini picks"
                        : "Catalog picks"}
                    </p>
                    <RecCards items={message.items} />
                  </div>
                );
              }

              const isUser = message.role === "user";
              return (
                <div
                  key={message.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      isUser
                        ? "rounded-br-md bg-gradient-to-r from-[#ff5956] to-[#ee1e38] text-white"
                        : "rounded-bl-md bg-[#2a3142] text-white/85"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              );
            })}
            {loading ? (
              <div className="flex items-center gap-2 text-xs text-white/50">
                <Spinner className="h-4 w-4 border-[1.5px]" />
                Thinking…
              </div>
            ) : null}
          </div>

          <div className="space-y-2 border-t border-white/10 p-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  void requestRecommendations({ useGemini: false })
                }
                className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs font-medium text-white/75 transition hover:bg-white/10 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5956]"
              >
                Refresh free picks
              </button>
              <button
                type="button"
                disabled={loading || geminiUsed}
                onClick={() => {
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: `user-${Date.now()}`,
                      role: "user",
                      text: "Suggest 3 similar anime",
                    },
                  ]);
                  void requestRecommendations({
                    useGemini: true,
                    message: "Suggest 3 similar anime",
                  });
                }}
                className="rounded-full border border-[#ff5956]/40 bg-[#ff5956]/15 px-3 py-1 text-xs font-medium text-[#ffb0ae] transition hover:bg-[#ff5956]/25 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5956]"
              >
                Ask Gemini (1×)
              </button>
            </div>

            <form onSubmit={onSubmit} className="flex gap-2">
              <label htmlFor="recommend-chat-input" className="sr-only">
                Ask for recommendations
              </label>
              <input
                id="recommend-chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  geminiUsed
                    ? "Gemini already used for this title"
                    : "e.g. darker tone, fewer episodes…"
                }
                disabled={loading || geminiUsed}
                className="min-w-0 flex-1 rounded-xl border border-white/12 bg-[#151822] px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-[#ff5956]/50 focus:outline-none focus:ring-2 focus:ring-[#ff5956]/30 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || geminiUsed || !input.trim()}
                className="rounded-xl bg-gradient-to-r from-[#ff5956] to-[#ee1e38] px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5956]"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#ff5956] to-[#ee1e38] text-sm font-bold text-white shadow-lg shadow-[#ee1e38]/30 transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5956] focus-visible:ring-offset-2 focus-visible:ring-offset-[#151822]"
        aria-expanded={open}
        aria-label={open ? "Close recommendations chat" : "Open recommendations chat"}
      >
        {open ? "✕" : "AI"}
      </button>
    </div>
  );
}
