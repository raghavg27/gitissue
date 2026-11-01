import { beforeEach, describe, expect, it, vi } from "vitest";

const query = { select: vi.fn(), eq: vi.fn() };
const from = vi.fn(() => query);

vi.mock("next/cache", () => ({ unstable_cache: (fn: () => unknown) => fn }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ from }) }));

const { getIssuesCreated } = await import("./data");

describe("getIssuesCreated", () => {
  beforeEach(() => {
    query.select.mockReturnValue(query);
  });

  it("counts only the reports that created a new issue", async () => {
    query.eq.mockResolvedValue({ count: 1248, error: null });
    await expect(getIssuesCreated()).resolves.toBe(1248);
    expect(from).toHaveBeenCalledWith("reports");
    expect(query.eq).toHaveBeenCalledWith("action", "created");
  });

  it("gives null when the count cannot be read", async () => {
    query.eq.mockResolvedValue({ count: null, error: { message: "down" } });
    await expect(getIssuesCreated()).resolves.toBeNull();
  });
});
