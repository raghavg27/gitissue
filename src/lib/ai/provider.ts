import "server-only";
import { GoogleGenAI } from "@google/genai";
import { serverEnv } from "@/lib/env.server";

export class AiUnavailableError extends Error {}

// Per provider, so a hung call still leaves time for the backup inside Vercel's 60 s limit.
const TIMEOUT_MS = 20_000;

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
  if (!res.ok) throw new Error(`Groq ${res.status}`);
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
  const errors: string[] = [];
  for (const provider of providers) {
    try {
      return await provider(prompt);
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }
  }
  throw new AiUnavailableError(errors.join("; ") || "No AI provider configured");
}
