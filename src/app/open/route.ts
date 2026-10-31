import { NextResponse, type NextRequest } from "next/server";
import { parseRepoUrl } from "@/lib/repo-url";

// The no-JavaScript path of the repo box: /open?repo=github.com/owner/repo goes to /owner/repo.
export function GET(request: NextRequest) {
  const ref = parseRepoUrl(request.nextUrl.searchParams.get("repo") ?? "");
  const target = ref ? `/${ref.owner}/${ref.repo}` : "/?error=repo#repo";
  return NextResponse.redirect(new URL(target, request.url), 303);
}
