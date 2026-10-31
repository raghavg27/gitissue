import { describe, expect, it } from "vitest";
import { pageInfo } from "./pagination";

describe("pageInfo", () => {
  it("starts at page 1", () => {
    expect(pageInfo(undefined, 45)).toEqual({ page: 1, pages: 3, from: 0, to: 19 });
  });

  it("reads a page number", () => {
    expect(pageInfo("3", 45)).toEqual({ page: 3, pages: 3, from: 40, to: 59 });
  });

  it.each(["0", "-2", "abc", ["2"]])("uses page 1 for %s", (raw) => {
    expect(pageInfo(raw, 45).page).toBe(1);
  });

  it("uses the last page when the number is too large", () => {
    expect(pageInfo("99", 45).page).toBe(3);
  });

  it("has one page when there is nothing", () => {
    expect(pageInfo("2", 0)).toEqual({ page: 1, pages: 1, from: 0, to: 19 });
  });
});
