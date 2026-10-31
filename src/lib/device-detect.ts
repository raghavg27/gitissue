import type { PLATFORMS } from "./validation";

type Platform = (typeof PLATFORMS)[number];
type Hints = { model?: string; platformVersion?: string; fullVersionList?: { brand: string; version: string }[] };
export type DetectedDevice = { device_model: string; platform: Platform; os_version: string };

const BRANDS: Record<string, string> = {
  "Microsoft Edge": "Edge",
  Opera: "Opera",
  "Samsung Internet": "Samsung Internet",
  Brave: "Brave",
  "Google Chrome": "Chrome",
};

function browserName(ua: string, hints?: Hints): string {
  const brand = hints?.fullVersionList?.find((b) => BRANDS[b.brand]);
  if (brand) return `${BRANDS[brand.brand]} ${brand.version.split(".")[0]}`;
  const rules: [RegExp, string][] = [
    [/Edg(?:A|iOS)?\/(\d+)/, "Edge"],
    [/OPR\/(\d+)/, "Opera"],
    [/SamsungBrowser\/(\d+)/, "Samsung Internet"],
    [/(?:FxiOS|Firefox)\/(\d+)/, "Firefox"],
    [/(?:CriOS|Chrome)\/(\d+)/, "Chrome"],
    [/Version\/(\d+).*Safari/, "Safari"],
  ];
  for (const [re, name] of rules) {
    const m = ua.match(re);
    if (m) return `${name} ${m[1]}`;
  }
  return "";
}

// Only the facts a developer needs: device, platform, OS version and browser.
// A value the browser hides is left empty for the tester to fill in, never guessed.
export function parseDevice({ ua, hints, touchPoints = 0 }: { ua: string; hints?: Hints; touchPoints?: number }): DetectedDevice {
  const hinted = hints?.platformVersion ?? "";
  const major = parseInt(hinted, 10) || 0;
  const trim = (v: string) => v.replace(/(\.0)+$/, "");
  let platform: Platform = "Web";
  let device = "Computer";
  let os = "";

  if (/Android/.test(ua)) {
    platform = "Android";
    const uaModel = ua.match(/Android [\d.]+; ([^;)]+)/)?.[1]?.trim();
    const model = hints?.model || (uaModel && !["K", "Mobile", "Tablet"].includes(uaModel) ? uaModel : "");
    device = model || (/Mobile/.test(ua) ? "Android phone" : "Android tablet");
    // Chrome freezes the user agent at "Android 10; K", so only an unfrozen one is trusted.
    os = hinted ? trim(hinted) : /; K\)/.test(ua) ? "" : (ua.match(/Android (\d+(?:\.\d+)?)/)?.[1] ?? "");
  } else if (/iPhone|iPod|iPad/.test(ua) || (/Macintosh/.test(ua) && touchPoints > 1)) {
    const ipad = /iPad|Macintosh/.test(ua);
    platform = ipad ? "iPadOS" : "iOS";
    device = ipad ? "iPad" : "iPhone";
    // Safari's version matches the iOS version. Other iOS browsers report a frozen 18_6.
    const safari = ua.match(/Version\/(\d+(?:\.\d+)?)/)?.[1];
    const reported = ua.match(/OS (\d+)_(\d+)/);
    os = safari ?? (reported && reported[0] !== "OS 18_6" ? `${reported[1]}.${reported[2]}` : "");
  } else if (/Macintosh|Mac OS X/.test(ua)) {
    platform = "macOS";
    device = "Mac";
    os = hinted ? trim(hinted) : "";
  } else if (/Windows/.test(ua)) {
    platform = "Windows";
    device = "Windows PC";
    os = major >= 13 ? "11" : major > 0 ? "10" : "";
  } else if (/CrOS/.test(ua)) {
    platform = "Linux";
    device = "Chromebook";
  } else if (/Linux/.test(ua)) {
    platform = "Linux";
    device = "Linux PC";
  }

  const browser = browserName(ua, hints);
  return { device_model: (browser ? `${device}, ${browser}` : device).slice(0, 60), platform, os_version: os };
}

type UAData = { getHighEntropyValues(keys: string[]): Promise<Hints> };

// Reads this browser. Chromium browsers give extra hints; the others fall back to the user agent.
export async function detectDevice(): Promise<DetectedDevice> {
  const data = (navigator as Navigator & { userAgentData?: UAData }).userAgentData;
  const hints = await data?.getHighEntropyValues(["model", "platformVersion", "fullVersionList"]).catch(() => undefined);
  return parseDevice({ ua: navigator.userAgent, hints, touchPoints: navigator.maxTouchPoints });
}
