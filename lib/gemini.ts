import type { RecommendationItem } from "@/types/recommend";

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

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
    finishReason?: string;
  }[];
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
}

interface RawRecommendationPayload {
  recommendations?: {
    title?: unknown;
    reason?: unknown;
  }[];
}

export interface GeminiRecommendInput {
  name: string;
  genres: string[];
  synopsis?: string | null;
}

function buildPrompt(input: GeminiRecommendInput): string {
  const genres =
    input.genres.length > 0 ? input.genres.join(", ") : "unknown";
  const synopsis = input.synopsis?.trim()
    ? input.synopsis.trim().slice(0, 600)
    : "No synopsis provided.";

  return [
    "You are an anime recommendation expert.",
    "Suggest exactly 4 anime similar in tone, themes, or audience to the title below.",
    "Do not recommend the same title. Prefer well-known shows that exist on MyAnimeList/Shikimori.",
    "Each reason must be one concise sentence explaining why a fan of the source would enjoy it.",
    "",
    `Title: ${input.name}`,
    `Genres: ${genres}`,
    `Synopsis: ${synopsis}`,
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

function parseRecommendations(text: string): RecommendationItem[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new GeminiError(
      "Gemini returned malformed JSON.",
      "invalid_response"
    );
  }

  const list = Array.isArray(parsed)
    ? parsed
    : (parsed as RawRecommendationPayload).recommendations;

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
    .slice(0, 4);

  if (recommendations.length === 0) {
    throw new GeminiError(
      "Gemini returned no usable recommendations.",
      "invalid_response"
    );
  }

  return recommendations;
}

export async function getGeminiRecommendations(
  input: GeminiRecommendInput
): Promise<RecommendationItem[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiError(
      "GEMINI_API_KEY is not configured.",
      "missing_key",
      503
    );
  }

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(input) }] }],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
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
          required: ["recommendations"],
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

    if (response.status === 429 || payload.error?.status === "RESOURCE_EXHAUSTED") {
      throw new GeminiError(message, "rate_limit", 429);
    }

    throw new GeminiError(message, "upstream", response.status || 502);
  }

  return parseRecommendations(extractText(payload));
}
