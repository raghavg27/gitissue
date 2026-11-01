import "server-only";
import { GoogleGenAI } from "@google/genai";
import { serverEnv } from "@/lib/env.server";

export type AiFailure = "busy" | "slow" | "bad-answer" | "error" | "not-set-up";

export class AiUnavailableError extends Error {
  constructor(message: string, readonly reason: AiFailure, readonly retryAfter?: number) {
    super(message);
  }
}

// Per provider, so a hung call still leaves time for the backup inside Vercel's 60 s limit.
const TIMEOUT_MS = 20_000;
// Groq's free tier refills its per-minute token budget, so a short wait usually gets an answer.
// 25 s of waiting plus two 20 s calls still fits inside the 60 s limit.
const MAX_WAIT_S = 25;

type ProviderError = { name?: string; status?: number; retryAfter?: number };

function reasonOf(e: unknown): AiFailure {
  const err = e as ProviderError;
  if (err?.status === 429 || err?.status === 503) return "busy";
  if (err?.name === "TimeoutError" || err?.name === "AbortError") return "slow";
  if (e instanceof SyntaxError) return "bad-answer";
  return "error";
}

function parseJson(text: string): unknown {
  return JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, ""));
}

async function gemini(prompt: string): Promise<unknown> {
  const ai = new GoogleGenAI({ apiKey: serverEnv.geminiKey() });
  const res = await ai.models.generateContent({
    model: serverEnv.geminiModel(),
    contents: prompt,
    config: { responseMimeType: "application/json", temperature: 0.2, abortSignal: AbortSignal.timeout(TIMEOUT_MS) },
  });
  return parseJson(res.text ?? "");
}

// Groq exposes an OpenAI-compatible endpoint.
async function groq(prompt: string): Promise<unknown> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${serverEnv.groqKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: serverEnv.groqModel(),
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) {
    const retryAfter = Number(res.headers.get("retry-after")) || undefined;
    throw Object.assign(new Error(`Groq ${res.status}`), { status: res.status, retryAfter });
  }
  const data = await res.json();
  return parseJson(data.choices[0].message.content);
}

// Single entry point for all AI calls, so the provider can be swapped (§10.2).
// Groq first: it answers in about a second, while Gemini's free tier can hang for minutes.
export async function generateJson(prompt: string): Promise<unknown> {
  const providers = [
    serverEnv.groqKey() && groq,
    serverEnv.geminiKey() && gemini,
  ].filter((p) => typeof p === "function");
  if (!providers.length) throw new AiUnavailableError("No AI provider configured", "not-set-up");
  const started = Date.now();
  const errors: unknown[] = [];
  let groqWait: number | undefined;
  for (const provider of providers) {
    try {
      return await provider(prompt);
    } catch (e) {
      errors.push(e);
      if (provider === groq) groqWait = (e as ProviderError).retryAfter;
    }
  }
  // Issue #10: one draft uses most of Groq's budget for a minute, so the next call is often rate limited.
  if (groqWait && groqWait <= MAX_WAIT_S) {
    await new Promise((r) => setTimeout(r, Math.max(0, groqWait * 1000 - (Date.now() - started))));
    try {
      return await groq(prompt);
    } catch (e) {
      errors.push(e);
    }
  }
  const reasons = errors.map(reasonOf);
  const reason = (["busy", "slow", "bad-answer"] as const).find((r) => reasons.includes(r)) ?? "error";
  const retryAfter = (errors.findLast((e) => (e as ProviderError).retryAfter) as ProviderError | undefined)?.retryAfter;
  const message = errors.map((e) => (e instanceof Error ? e.message : String(e))).join("; ");
  throw new AiUnavailableError(message, reason, retryAfter);
}

const FAILURE_TEXT: Record<AiFailure, string> = {
  busy: "The AI service is busy right now.",
  slow: "The AI service took too long to answer.",
  "bad-answer": "The AI sent back an answer that the app could not use.",
  error: "The AI service sent back an error.",
  "not-set-up": "No AI service is set up on this server.",
};

// A plain reason for the user, with how long to wait when the AI service tells us.
export function explainAiFailure(e: unknown): string {
  if (!(e instanceof AiUnavailableError)) return FAILURE_TEXT["bad-answer"];
  const wait = e.retryAfter ? ` Wait about ${e.retryAfter} seconds, then try again.` : "";
  return `${FAILURE_TEXT[e.reason]}${wait}`;
}
