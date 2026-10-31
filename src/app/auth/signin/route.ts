import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath, siteUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

// A plain form post starts GitHub sign-in, so it works without JavaScript.
// The PKCE verifier is stored in a cookie here and read back in /auth/callback.
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const next = safeNextPath(form.get("next")?.toString());
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      scopes: "repo",
      redirectTo: `${siteUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
      skipBrowserRedirect: true,
    },
  });
  if (error || !data.url) return NextResponse.redirect(`${siteUrl()}/?error=auth`, 303);
  return NextResponse.redirect(data.url, 303);
}
