import "server-only";
import { GoogleGenAI } from "@google/genai";

export class AiUnavailableError extends Error {}

function parseJson(text: string): unknown {
  return JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, ""));
}

async function gemini(prompt: string): Promise<unknown> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const res = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
    contents: prompt,
    config: { responseMimeType: "application/json", temperature: 0.2 },
  });
  return parseJson(res.text ?? "");
}

// Groq exposes an OpenAI-compatible endpoint.
async function groq(prompt: string): Promise<unknown> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
    }),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}`);
  const data = await res.json();
  return parseJson(data.choices[0].message.content);
}

// Single entry point for all AI calls, so the provider can be swapped (§10.2).
export async function generateJson(prompt: string): Promise<unknown> {
  const providers = [
    process.env.GEMINI_API_KEY && gemini,
    process.env.GROQ_API_KEY && groq,
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
