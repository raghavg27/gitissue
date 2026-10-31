import { NextResponse } from "next/server";
import { siteUrl } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) {
    await createAdminClient().from("profiles").update({ github_token_enc: null }).eq("user_id", data.user.id);
  }
  await supabase.auth.signOut();
  return NextResponse.redirect(`${siteUrl()}/`, { status: 303 });
}
