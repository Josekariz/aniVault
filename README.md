# Anime Vault

Next.js 14 App Router catalog for browsing, searching, and recommending anime.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion
- **AniList GraphQL** for catalog data (`POST https://graphql.anilist.co`) — no API key for reads
- **Gemini** (optional, server-only) for opt-in AI recommendations on the detail page

## Prerequisites

- Node.js 18+ (20 recommended)
- npm

## Setup

1. Clone the repo and install dependencies:

   ```bash
   npm install
   ```

2. Copy the env example and add a Gemini key only if you want AI recommendations:

   ```bash
   cp .env.local.example .env.local
   ```

   | Variable | Required? | Notes |
   |---|---|---|
   | `GEMINI_API_KEY` | Only for Ask Gemini | Server-side only — never `NEXT_PUBLIC_`. Create at https://aistudio.google.com/apikey |
   | `GEMINI_MODEL` | Optional | Overrides the default model fallbacks |

   Browse, search, genre filters, detail pages, and free catalog recommendations work **without** any env vars (AniList reads are unauthenticated).

3. Start the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Features

- Server-fetched anime grid with infinite scroll (`Page` + `pageInfo.hasNextPage`)
- Debounced nav search against AniList (quota-aware typeahead)
- Hardcoded genre filter chips (AniList genre enum — no genres endpoint)
- Detail page: synopsis, meta, trailer embed, relations, AniList recommendations
- Opt-in Gemini chat with seeded AniList fallbacks when AI is unavailable

## AniList rate limits

The client assumes the **current degraded budget of 30 requests/minute** (docs: https://docs.anilist.co/guide/rate-limiting). It reads `X-RateLimit-*` headers and backs off near the limit / on 429. Re-check the docs if you change fetch frequency.

## Project layout

- `app/` — routes, server actions, recommend API route
- `components/` — UI (grid, nav, detail, recommend chat)
- `lib/anilist/` — GraphQL client, queries, mappers
- `lib/gemini.ts` — server-only Gemini helper
- `types/` — shared TypeScript shapes

## License

MIT — see `LICENSE` if present.
