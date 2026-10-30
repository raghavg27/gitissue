const EXCLUDED_DIR = /(^|\/)(node_modules|vendor|Pods|dist|build|out|\.next|coverage|generated|__tests__|__mocks__|tests?|e2e)\//i;
const EXCLUDED_FILE = /\.(test|spec|stories|d)\.[a-z]+$/i;
const SOURCE_EXT = /\.(tsx?|jsx?|vue|svelte|kt|java|swift|dart|py|rb|go|php)$/i;

const SCREEN_DIR = /(^|\/)(screens?|pages?|app|routes?|views?|features?)\//i;
const SCREEN_FILE = /(Screen|Page|Activity|Fragment|ViewController|View)\.(tsx?|jsx?|kt|java|swift|dart)$/;
const NAVIGATION = /(navigat|router|routes)/i;

const MAX_SCREENS = 60;

// Heuristic pick of files that name screens/routes/flows, ranked by keyword hits in the path (FR-9).
export function selectCodeFiles(
  paths: string[],
  keywords: string[],
  max = 8,
): { screens: string[]; fetch: string[] } {
  const scored = paths
    .filter((p) => SOURCE_EXT.test(p) && !EXCLUDED_DIR.test(p) && !EXCLUDED_FILE.test(p))
    .map((path) => {
      const lower = path.toLowerCase();
      const hits = keywords.filter((k) => lower.includes(k)).length;
      const nav = NAVIGATION.test(path);
      const screen = SCREEN_DIR.test(path) || SCREEN_FILE.test(path) || nav;
      return { path, hits, screen, score: hits * 3 + (screen ? 2 : 0) + (nav ? 2 : 0) };
    });

  const screens = scored
    .filter((f) => f.screen)
    .sort((a, b) => b.hits - a.hits)
    .slice(0, MAX_SCREENS)
    .map((f) => f.path);
  const fetch = scored
    .filter((f) => f.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((f) => f.path);
  return { screens, fetch };
}
