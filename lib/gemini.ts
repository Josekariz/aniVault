import type { RecommendationItem } from "@/types/recommend";

/**
 * Prefer current free-tier friendly flash-lite models.
 * Override with GEMINI_MODEL in env. We try fallbacks if the primary 404s.
 * Docs: https://ai.google.dev/api/generate-content
 */
const DEFAULT_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-3.1-flash-lite",
  "gemini-2.0-flash",
].filter((value, index, arr): value is string => {
  return Boolean(value) && arr.indexOf(value) === index;
});

const MAX_RECS = 3;
const MAX_SYNOPSIS_CHARS = 160;
const MAX_OUTPUT_TOKENS = 350;

export class GeminiError extends Error {
  code: "missing_key" | "rate_limit" | "upstream" | "invalid_response";
  status: number;

  constructor(
    message: string,
    code: GeminiError["code"],
    status = 502
  ) {
    super(message);
    this.name = "GeminiError";
    this.code = code;
    this.status = status;
  }
}

interface GeminiGenerateResponse {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
  }[];
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
}

interface RawRecommendationPayload {
  reply?: unknown;
  recommendations?: {
    title?: unknown;
    reason?: unknown;
  }[];
}

export interface GeminiRecommendInput {
  name: string;
  genres: string[];
  synopsis?: string | null;
  message?: string;
}

export interface GeminiRecommendResult {
  reply: string;
  recommendations: RecommendationItem[];
}

function buildPrompt(input: GeminiRecommendInput): string {
  const genres =
    input.genres.length > 0 ? input.genres.slice(0, 4).join(", ") : "unknown";
  const synopsis = input.synopsis?.trim()
    ? input.synopsis.trim().slice(0, MAX_SYNOPSIS_CHARS)
    : "No synopsis provided.";
  const userAsk = input.message?.trim()
    ? input.message.trim().slice(0, 140)
    : "Suggest similar anime.";

  return [
    "Recommend anime. Be brief.",
    `JSON with reply (1 short sentence) and exactly ${MAX_RECS} recommendations.`,
    "Each item: title + one short reason. Do not recommend the source title.",
    "",
    `Source: ${input.name}`,
    `Genres: ${genres}`,
    `Synopsis: ${synopsis}`,
    `Ask: ${userAsk}`,
  ].join("\n");
}

function extractText(payload: GeminiGenerateResponse): string {
  const text = payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!text) {
    throw new GeminiError(
      "Gemini returned an empty response.",
      "invalid_response"
    );
  }

  return text;
}

function parseRecommendations(text: string): GeminiRecommendResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new GeminiError(
      "Gemini returned malformed JSON.",
      "invalid_response"
    );
  }

  const payload = parsed as RawRecommendationPayload;
  const list = Array.isArray(parsed) ? parsed : payload.recommendations;

  if (!Array.isArray(list)) {
    throw new GeminiError(
      "Gemini JSON was missing recommendations.",
      "invalid_response"
    );
  }

  const recommendations = list
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as { title?: unknown; reason?: unknown };
      const title = typeof record.title === "string" ? record.title.trim() : "";
      const reason =
        typeof record.reason === "string" ? record.reason.trim() : "";
      if (!title || !reason) return null;
      return { title, reason };
    })
    .filter((item): item is RecommendationItem => item !== null)
    .slice(0, MAX_RECS);

  if (recommendations.length === 0) {
    throw new GeminiError(
      "Gemini returned no usable recommendations.",
      "invalid_response"
    );
  }

  const reply =
    typeof payload.reply === "string" && payload.reply.trim()
      ? payload.reply.trim().slice(0, 180)
      : `Here are ${recommendations.length} picks.`;

  return { reply, recommendations };
}

async function callModel(
  model: string,
  apiKey: string,
  input: GeminiRecommendInput
): Promise<GeminiRecommendResult> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(input) }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            reply: { type: "STRING" },
            recommendations: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  title: { type: "STRING" },
                  reason: { type: "STRING" },
                },
                required: ["title", "reason"],
              },
            },
          },
          required: ["reply", "recommendations"],
        },
      },
    }),
    cache: "no-store",
  });

  const payload = (await response.json()) as GeminiGenerateResponse;

  if (!response.ok || payload.error) {
    const message =
      payload.error?.message ||
      `Gemini request failed with status ${response.status}`;

    if (
      response.status === 429 ||
      payload.error?.status === "RESOURCE_EXHAUSTED"
    ) {
      throw new GeminiError(message, "rate_limit", 429);
    }

    throw new GeminiError(message, "upstream", response.status || 502);
  }

  return parseRecommendations(extractText(payload));
}

export async function getGeminiRecommendations(
  input: GeminiRecommendInput
): Promise<GeminiRecommendResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiError(
      "GEMINI_API_KEY is not configured on the server.",
      "missing_key",
      503
    );
  }

  let lastError: GeminiError | null = null;

  for (const model of DEFAULT_MODELS) {
    try {
      return await callModel(model, apiKey, input);
    } catch (error) {
      if (error instanceof GeminiError) {
        lastError = error;
        // Try next model on not-found / upstream; stop on missing key / rate limit.
        if (error.code === "rate_limit" || error.code === "missing_key") {
          throw error;
        }
        continue;
      }
      throw error;
    }
  }

  throw (
    lastError ??
    new GeminiError("No Gemini model succeeded.", "upstream", 502)
  );
}
