import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const generateContent = vi.fn();
vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    models = { generateContent };
  },
}));

const { generateJson } = await import("./provider");

const groqReply = (content: string) =>
  new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status: 200 });

describe("generateJson", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubEnv("GROQ_API_KEY", "groq-key");
    vi.stubEnv("GEMINI_API_KEY", "gemini-key");
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
    generateContent.mockReset();
  });

  it("asks Groq first and skips Gemini when Groq answers", async () => {
    fetchMock.mockResolvedValue(groqReply('{"from":"groq"}'));
    await expect(generateJson("p")).resolves.toEqual({ from: "groq" });
    expect(generateContent).not.toHaveBeenCalled();
  });

  it("falls back to Gemini when Groq fails", async () => {
    fetchMock.mockResolvedValue(new Response("busy", { status: 503 }));
    generateContent.mockResolvedValue({ text: '{"from":"gemini"}' });
    await expect(generateJson("p")).resolves.toEqual({ from: "gemini" });
  });

  it("gives both calls a time limit so a hung provider can't block the request", async () => {
    fetchMock.mockResolvedValue(new Response("busy", { status: 503 }));
    generateContent.mockResolvedValue({ text: "{}" });
    await generateJson("p");
    expect(fetchMock.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
    expect(generateContent.mock.calls[0][0].config.abortSignal).toBeInstanceOf(AbortSignal);
  });
});
