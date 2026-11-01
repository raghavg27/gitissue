import { BRAND } from "@/lib/site";

export const SCREENSHOT_MARKER = "<!-- screenshots -->";

// Puts screenshot images where the draft left the marker, or at the end if the tester removed it.
export function attachScreenshots(body: string, urls: string[]): string {
  const images = urls.map((url, i) => `![screenshot ${i + 1}](${url})`).join("\n");
  if (body.includes(SCREENSHOT_MARKER)) return body.replace(SCREENSHOT_MARKER, images).trimEnd();
  return images ? `${body.trimEnd()}\n\n${images}` : body;
}

// A line at the end of each new issue, so people who read it can find the app.
export function addAttribution(body: string, appUrl: string): string {
  return `${body.trimEnd()}\n\n_Created with [${BRAND}](${appUrl})_`;
}
