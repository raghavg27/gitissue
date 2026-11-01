import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const generateContent = vi.fn();
vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    models = { generateContent };
  },
}));

const { AiUnavailableError, explainAiFailure, generateJson } = await import("./provider");

const groqReply = (content: string) =>
  new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status: 200 });
const groqLimited = (seconds: number) =>
  new Response("rate limited", { status: 429, headers: { "retry-after": String(seconds) } });
const geminiBusy = Object.assign(new Error("high demand"), { status: 503 });

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

  // Issue #10: one draft uses most of Groq's per-minute token budget, so the next draft is often rate limited.
  it("waits and asks Groq again when Groq says the wait is short", async () => {
    vi.useFakeTimers();
    fetchMock.mockResolvedValueOnce(groqLimited(10)).mockResolvedValueOnce(groqReply('{"from":"groq"}'));
    generateContent.mockRejectedValue(geminiBusy);
    const result = generateJson("p");
    await vi.advanceTimersByTimeAsync(10_000);
    await expect(result).resolves.toEqual({ from: "groq" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it("does not wait when Groq's wait is too long, and says the AI is busy", async () => {
    fetchMock.mockResolvedValue(groqLimited(40));
    generateContent.mockRejectedValue(geminiBusy);
    const error = await generateJson("p").catch((e) => e);
    expect(error).toBeInstanceOf(AiUnavailableError);
    expect(error).toMatchObject({ reason: "busy", retryAfter: 40 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("says the AI was too slow when both calls time out", async () => {
    const timeout = Object.assign(new Error("aborted"), { name: "TimeoutError" });
    fetchMock.mockRejectedValue(timeout);
    generateContent.mockRejectedValue(timeout);
    await expect(generateJson("p")).rejects.toMatchObject({ reason: "slow" });
  });

  it("says the answer was unusable when both send text that is not JSON", async () => {
    fetchMock.mockResolvedValue(groqReply("not json"));
    generateContent.mockResolvedValue({ text: "not json" });
    await expect(generateJson("p")).rejects.toMatchObject({ reason: "bad-answer" });
  });

  it("says no AI is set up when there are no keys", async () => {
    vi.stubEnv("GROQ_API_KEY", "");
    vi.stubEnv("GEMINI_API_KEY", "");
    await expect(generateJson("p")).rejects.toMatchObject({ reason: "not-set-up" });
  });
});

describe("explainAiFailure", () => {
  it("tells the user how long to wait when the AI is busy", () => {
    expect(explainAiFailure(new AiUnavailableError("x", "busy", 37))).toMatch(/busy.*about 37 seconds/);
  });

  it("treats any other error as an answer the app could not use", () => {
    expect(explainAiFailure(new Error("AI response is not a draft"))).toMatch(/could not use/);
  });
});
