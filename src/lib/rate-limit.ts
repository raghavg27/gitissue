import "server-only";
import { createHmac } from "node:crypto";
import { cookies, headers } from "next/headers";
import { serverEnv } from "@/lib/env.server";
import { plural, resetsIn } from "@/lib/format";
import { logError } from "@/lib/log";
import { DEVICE_COOKIE } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";

const WINDOW_SECONDS = 60 * 60;

// Per hour. A network (one IP address) gets more, because people can share one.
export const RATE_LIMITS = {
  draft: { thing: "AI draft", user: 30, device: 30, network: 60 },
  post: { thing: "post", user: 20, device: 20, network: 40 },
  upload: { thing: "screenshot upload", user: 40, device: 40, network: 80 },
  device: { thing: "device save", user: 20, device: 20, network: 40 },
} as const;

export type RateAction = keyof typeof RATE_LIMITS;
type Kind = "user" | "device" | "network";

// A keyed hash, so the stored key cannot be turned back into an IP address or an ID.
export function rateKey(secret: string, action: RateAction, kind: Kind, subject: string): string {
  return createHmac("sha256", secret).update(`${action}:${kind}:${subject}`).digest("hex");
}

// The limit in plain words: what happened, when it resets, and that nothing is lost.
export function limitMessage(action: RateAction, limit: number, secondsLeft: number): string {
  return `You reached the limit of ${plural(limit, RATE_LIMITS[action].thing)} per hour. ${resetsIn(secondsLeft)}. Your draft is saved on this device.`;
}

export type Limited = { message: string; retryAfter: number };

// Counts one hit for the user, the device and the network. Returns null when all are inside the limit.
// If the counter store fails, the request is allowed: a broken limiter must not break the app.
export async function checkRateLimit(action: RateAction, userId: string): Promise<Limited | null> {
  const [h, c] = await Promise.all([headers(), cookies()]);
  const network = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const subjects: [Kind, string | undefined][] = [
    ["user", userId],
    ["device", c.get(DEVICE_COOKIE)?.value],
    ["network", network],
  ];
  const secret = serverEnv.tokenEncryptionKey;
  const admin = createAdminClient();
  const rule = RATE_LIMITS[action];

  const results = await Promise.all(
    subjects
      .filter((s): s is [Kind, string] => !!s[1])
      .map(async ([kind, subject]) => {
        const { data, error } = await admin.rpc("hit_rate_limit", {
          p_key: rateKey(secret, action, kind, subject),
          p_limit: rule[kind],
          p_window_seconds: WINDOW_SECONDS,
        });
        if (error) throw error;
        const row = (data as { allowed: boolean; reset_at: string }[])[0];
        return { kind, ...row };
      }),
  ).catch((e) => {
    logError("rate-limit: counter failed", e);
    return [];
  });

  const blocked = results.find((r) => !r.allowed);
  if (!blocked) return null;
  const retryAfter = Math.max(1, Math.ceil((new Date(blocked.reset_at).getTime() - Date.now()) / 1000));
  return { message: limitMessage(action, rule[blocked.kind], retryAfter), retryAfter };
}
