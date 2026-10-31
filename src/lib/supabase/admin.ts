import "server-only";
import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";
import { serverEnv } from "@/lib/env.server";

// Service-role client: bypasses RLS. Server only, used for the encrypted GitHub token.
export function createAdminClient() {
  return createClient(publicEnv.supabaseUrl, serverEnv.serviceRoleKey, {
    auth: { persistSession: false },
  });
}
