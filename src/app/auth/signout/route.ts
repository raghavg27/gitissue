import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) {
    await createAdminClient().from("profiles").update({ github_token_enc: null }).eq("user_id", data.user.id);
  }
  await supabase.auth.signOut();
  return NextResponse.redirect(`${request.nextUrl.origin}/`, { status: 303 });
}
