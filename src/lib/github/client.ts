import "server-only";
import { Octokit } from "@octokit/rest";
import { decryptToken } from "@/lib/crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type Viewer = { userId: string; login: string; octokit: Octokit };

// Signed-in user plus an Octokit authed with their stored GitHub token; null if either is missing.
export async function getViewer(): Promise<Viewer | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: profile } = await createAdminClient()
    .from("profiles")
    .select("github_login, github_token_enc")
    .eq("user_id", data.user.id)
    .single();
  if (!profile?.github_token_enc) return null;
  return {
    userId: data.user.id,
    login: profile.github_login,
    octokit: new Octokit({ auth: decryptToken(profile.github_token_enc) }),
  };
}
