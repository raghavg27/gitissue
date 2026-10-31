export const PAGE_SIZE = 20;

// Reads ?page= safely: a missing, bad or too large value becomes the nearest real page.
export function pageInfo(raw: unknown, total: number) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const asked = Number.parseInt(typeof raw === "string" ? raw : "1", 10);
  const page = Number.isFinite(asked) ? Math.min(Math.max(asked, 1), pages) : 1;
  return { page, pages, from: (page - 1) * PAGE_SIZE, to: page * PAGE_SIZE - 1 };
}
