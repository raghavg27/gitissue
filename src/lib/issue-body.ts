export const SCREENSHOT_MARKER = "<!-- screenshots -->";

// Puts screenshot images where the draft left the marker, or at the end if the tester removed it.
export function attachScreenshots(body: string, urls: string[]): string {
  const images = urls.map((url, i) => `![screenshot ${i + 1}](${url})`).join("\n");
  if (body.includes(SCREENSHOT_MARKER)) return body.replace(SCREENSHOT_MARKER, images).trimEnd();
  return images ? `${body.trimEnd()}\n\n${images}` : body;
}
