"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import { Spinner } from "@/components/AnimeSkeleton";
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
            <p className="text-sm font-semibold text-ink">
              {index + 1}. {item.title}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">
              {item.reason}
            </p>
          </>
        );

        return (
          <li key={`${item.title}-${index}`}>
            {href ? (
              <Link
                href={href}
                className="block rounded-xl border border-ink/10 bg-white px-3 py-2 transition hover:border-accent/40 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {inner}
              </Link>
            ) : (
              <div className="rounded-xl border border-ink/10 bg-white px-3 py-2">
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
}: RecommendChatProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [geminiUsed, setGeminiUsed] = useState(false);
  const [shownIds, setShownIds] = useState<number[]>([animeId]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: `Ask for picks related to ${name}. Free catalog refresh anytime — Gemini is optional (1×).`,
    },
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
          text: "Gemini is limited to one ask per title. Use Refresh free picks for more catalog titles.",
        },
      ]);
      return;
    }

    setLoading(true);
    const body: RecommendRequestBody = {
      animeId,
      name,
      genres: JSON.parse(genresKey) as string[],
      synopsis: synopsis?.slice(0, 160) ?? null,
      message: options.message,
      useGemini: options.useGemini,
      excludeIds: shownIds,
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

      const nextIds = payload.recommendations
        .map((item) => item.shikimoriId)
        .filter((id): id is number => typeof id === "number");
      setShownIds((prev) => Array.from(new Set([...prev, ...nextIds])));

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
        <div className="flex h-[min(32rem,70vh)] w-[min(22rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-3xl border border-ink/10 bg-canvas shadow-2xl shadow-ink/15">
          <header className="flex items-center justify-between border-b border-ink/8 bg-white px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ink">Ask AniVault</p>
              <p className="text-[11px] text-ink-subtle">
                Catalog free · Gemini on demand (1×)
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-1 text-sm text-ink-subtle transition hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
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
                        ? "rounded-br-md bg-accent text-white"
                        : "rounded-bl-md bg-white text-ink-muted shadow-sm ring-1 ring-ink/5"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              );
            })}
            {loading ? (
              <div className="flex items-center gap-2 text-xs text-ink-subtle">
                <Spinner className="h-4 w-4 border-[1.5px]" />
                Thinking…
              </div>
            ) : null}
          </div>

          <div className="space-y-2 border-t border-ink/8 bg-white p-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  void requestRecommendations({ useGemini: false })
                }
                className="rounded-full border border-ink/10 bg-surface px-3 py-1 text-xs font-medium text-ink-muted transition hover:bg-surface-2 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
                className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent transition hover:bg-accent/15 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
                    : "e.g. darker tone…"
                }
                disabled={loading || geminiUsed}
                className="min-w-0 flex-1 rounded-xl border border-ink/10 bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/25 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || geminiUsed || !input.trim()}
                className="rounded-xl bg-accent px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
        className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-sm font-bold text-white shadow-lg shadow-accent/30 transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        aria-expanded={open}
        aria-label={
          open ? "Close recommendations chat" : "Open recommendations chat"
        }
      >
        {open ? "✕" : "AI"}
      </button>
    </div>
  );
}
