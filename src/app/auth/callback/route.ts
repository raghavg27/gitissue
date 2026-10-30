import { NextResponse, type NextRequest } from "next/server";
import { encryptToken } from "@/lib/crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    // provider_token is only returned here, at sign-in, so it is persisted now (FR-3).
    if (!error && data.session.provider_token) {
      const { error: saveError } = await createAdminClient()
        .from("profiles")
        .upsert({
          user_id: data.user.id,
          github_login: data.user.user_metadata.user_name,
          github_token_enc: encryptToken(data.session.provider_token),
        });
      if (!saveError) return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/?error=auth`);
}
