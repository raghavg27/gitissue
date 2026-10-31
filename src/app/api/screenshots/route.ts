import { NextResponse, type NextRequest } from "next/server";
import { fail, limited } from "@/lib/api";
import { getViewer } from "@/lib/github/client";
import { logError } from "@/lib/log";
import { checkRateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateImage } from "@/lib/validation";

// The server checks each screenshot, then gives the browser a one-time signed URL to upload it.
// The browser has no storage write rights of its own.
export async function POST(request: NextRequest) {
  const viewer = await getViewer();
  if (!viewer) return fail(401, "Your session ended. Sign in with GitHub again; your draft is saved.");
  const limit = await checkRateLimit("upload", viewer.userId);
  if (limit) return limited(limit);
  const image = validateImage(await request.json().catch(() => ({})));
  if (!image.ok) return fail(400, image.error);

  // Two random parts make the public address impossible to guess. The user ID is not in it.
  const path = `${crypto.randomUUID()}/${crypto.randomUUID()}.${image.value}`;
  const storage = createAdminClient().storage.from("screenshots");
  const { data, error } = await storage.createSignedUploadUrl(path);
  if (error) {
    logError("screenshots: signed URL failed", error);
    return fail(503, "Could not get ready for the upload. Try again in a minute.");
  }
  return NextResponse.json({ path, token: data.token, url: storage.getPublicUrl(path).data.publicUrl });
}
