// One set of rules for the browser (fast hints) and the server (the real check).

export const PLATFORMS = ["Android", "iOS", "iPadOS", "Web", "Windows", "macOS", "Linux"] as const;

// GitHub allows 256 characters in a title and 65,536 in a body; the body limit leaves room for screenshots.
export const LIMITS = {
  description: { max: 5_000, name: "description", empty: "Describe the bug first." },
  instruction: { max: 500, name: "change", empty: "Say what to change." },
  title: { max: 256, name: "title", empty: "The issue needs a title." },
  body: { max: 60_000, name: "body", empty: "The issue needs a body." },
  label: { max: 50, name: "label", empty: "" },
  device_model: { max: 60, name: "device name", empty: "Enter the device name." },
  os_version: { max: 40, name: "OS version", empty: "Enter the OS version." },
  appVersion: { max: 40, name: "app version", empty: "" },
  labels: 10,
} as const;

type Field = Exclude<keyof typeof LIMITS, "labels">;
export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

// Control and zero-width characters can hide text or break markdown; new lines and tabs stay.
const UNSAFE = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u200b-\u200f\u2028\u2029\u2060\ufeff]/g;

export function cleanText(value: string): string {
  return value.replace(/\r\n?/g, "\n").replace(UNSAFE, "").trim();
}

export function validateText(value: unknown, field: Field): Result<string> {
  const rule = LIMITS[field];
  const text = typeof value === "string" ? cleanText(value) : "";
  if (!text) return rule.empty ? { ok: false, error: rule.empty } : { ok: true, value: "" };
  if (text.length > rule.max) {
    return { ok: false, error: `The ${rule.name} can have up to ${rule.max.toLocaleString("en-US")} characters.` };
  }
  return { ok: true, value: text };
}

export function validateIssue(
  input: { title?: unknown; body?: unknown; labels?: unknown },
  { needsTitle = true } = {},
): Result<{ title: string; body: string; labels: string[] }> {
  const title = needsTitle ? validateText(input.title, "title") : { ok: true as const, value: "" };
  if (!title.ok) return title;
  const body = validateText(input.body, "body");
  if (!body.ok) return body;
  const labels = (Array.isArray(input.labels) ? input.labels : [])
    .filter((l): l is string => typeof l === "string")
    .map(cleanText)
    .filter((l) => l && l.length <= LIMITS.label.max);
  if (labels.length > LIMITS.labels) return { ok: false, error: `An issue can have up to ${LIMITS.labels} labels.` };
  return { ok: true, value: { title: title.value, body: body.value, labels } };
}

export type DeviceInput = { device_model?: unknown; platform?: unknown; os_version?: unknown; app_version?: unknown };
export type DeviceErrors = Partial<Record<"device_model" | "platform" | "os_version" | "app_version", string>>;

export function validateDevice(input: DeviceInput):
  | { ok: true; value: { label: string; device_model: string; platform: string; os_version: string; app_version: string | null } }
  | { ok: false; errors: DeviceErrors } {
  const errors: DeviceErrors = {};
  const model = validateText(input.device_model, "device_model");
  const os = validateText(input.os_version, "os_version");
  const app = validateText(input.app_version, "appVersion");
  const platform = PLATFORMS.find((p) => p === input.platform);
  if (!model.ok) errors.device_model = model.error;
  if (!platform) errors.platform = "Pick a platform from the list.";
  if (!os.ok) errors.os_version = os.error;
  if (!app.ok) errors.app_version = app.error;
  if (!model.ok || !platform || !os.ok || !app.ok) return { ok: false, errors };
  return {
    ok: true,
    value: {
      label: `${model.value} · ${platform} ${os.value}`,
      device_model: model.value,
      platform,
      os_version: os.value,
      app_version: app.value || null,
    },
  };
}
