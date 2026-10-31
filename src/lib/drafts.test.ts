import { beforeEach, describe, expect, it } from "vitest";
import { clearDraft, loadDraft, saveDraft } from "./drafts";

function memoryStorage() {
  const items = new Map<string, string>();
  return {
    getItem: (k: string) => items.get(k) ?? null,
    setItem: (k: string, v: string) => void items.set(k, v),
    removeItem: (k: string) => void items.delete(k),
  };
}

describe("drafts", () => {
  beforeEach(() => {
    Object.assign(globalThis, { localStorage: memoryStorage() });
  });

  it("saves and loads a draft per repo, ignoring case", () => {
    saveDraft("Owner/Repo", { description: "it crashes" });
    expect(loadDraft("owner/repo")).toEqual({ description: "it crashes" });
    expect(loadDraft("owner/other")).toEqual({});
  });

  it("clears a draft", () => {
    saveDraft("o/r", { description: "x" });
    clearDraft("o/r");
    expect(loadDraft("o/r")).toEqual({});
  });

  it("returns an empty draft when storage is broken or holds bad JSON", () => {
    localStorage.setItem("gitissue:draft:o/r", "{bad");
    expect(loadDraft("o/r")).toEqual({});
    Object.assign(globalThis, { localStorage: undefined });
    expect(loadDraft("o/r")).toEqual({});
    expect(() => saveDraft("o/r", {})).not.toThrow();
  });
});
