import "server-only";
import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DeviceProfile } from "@/lib/types";

// Per-user cache tags. A write clears the tag, so the next read is fresh.
export const devicesTag = (userId: string) => `devices:${userId}`;
export const reportsTag = (userId: string) => `reports:${userId}`;
// Site-wide: cleared each time GitIssue opens a new issue.
export const issuesCreatedTag = "issues-created";

export type Report = {
  id: string;
  repo_full_name: string;
  issue_number: number;
  issue_url: string;
  action: string;
  title: string;
  created_at: string;
};

// Cached reads cannot use the request cookies, so they use the service role with an explicit user_id
// filter. userId must come from a verified session (getViewer or auth.getUser), never from input.
export function getDevices(userId: string): Promise<DeviceProfile[]> {
  return unstable_cache(
    async () => {
      const { data } = await createAdminClient()
        .from("device_profiles")
        .select("id, label, platform, os_version, device_model, app_version")
        .eq("user_id", userId)
        .order("created_at");
      return data ?? [];
    },
    ["devices", userId],
    { tags: [devicesTag(userId)], revalidate: 3600 },
  )();
}

export function getReports(userId: string, from: number, to: number): Promise<{ reports: Report[]; total: number }> {
  return unstable_cache(
    async () => {
      const { data, count } = await createAdminClient()
        .from("reports")
        .select("id, repo_full_name, issue_number, issue_url, action, title, created_at", { count: "exact" })
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(from, to);
      return { reports: data ?? [], total: count ?? 0 };
    },
    ["reports", userId, String(from), String(to)],
    { tags: [reportsTag(userId)], revalidate: 3600 },
  )();
}

// How many new issues GitIssue has opened, for the home page (issue #11). Null when it cannot be read.
export async function getIssuesCreated(): Promise<number | null> {
  try {
    return await unstable_cache(
      async () => {
        const { count, error } = await createAdminClient()
          .from("reports")
          .select("id", { count: "exact", head: true })
          .eq("action", "created");
        // Thrown, not returned, so a failed read is not cached.
        if (error) throw error;
        return count ?? 0;
      },
      ["issues-created"],
      { tags: [issuesCreatedTag], revalidate: 3600 },
    )();
  } catch {
    return null;
  }
}
