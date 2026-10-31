import "server-only";
import { NextResponse } from "next/server";
import { getViewer, type Viewer } from "@/lib/github/client";
import { getRepoAccess, type RepoAccess } from "@/lib/github/repo";
import { createClient } from "@/lib/supabase/server";
import type { DeviceProfile } from "@/lib/types";

export const fail = (status: number, error: string) => NextResponse.json({ error }, { status });

// Resolves the signed-in viewer and their access to owner/repo, or the error response to return.
export async function withRepo(
  owner: unknown,
  repo: unknown,
): Promise<{ viewer: Viewer; access: RepoAccess } | { response: NextResponse }> {
  const viewer = await getViewer();
  if (!viewer) return { response: fail(401, "Your session ended. Sign in with GitHub again; your draft is saved.") };
  if (typeof owner !== "string" || typeof repo !== "string") return { response: fail(400, "Open a repo first. Go to the home page and paste its link.") };
  try {
    return { viewer, access: await getRepoAccess(viewer.octokit, owner, repo) };
  } catch {
    return { response: fail(404, `Could not open ${owner}/${repo}. Check the link, and check that your GitHub account can see the repo.`) };
  }
}

export async function loadDevice(deviceId: unknown): Promise<DeviceProfile | undefined> {
  if (typeof deviceId !== "string" || !deviceId) return undefined;
  const supabase = await createClient();
  const { data } = await supabase.from("device_profiles").select("*").eq("id", deviceId).single();
  return data ?? undefined;
}
