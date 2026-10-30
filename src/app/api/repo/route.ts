import { NextResponse, type NextRequest } from "next/server";
import { withRepo } from "@/lib/api";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const result = await withRepo(params.get("owner"), params.get("repo"));
  if ("response" in result) return result.response;
  return NextResponse.json({ repo: result.access, login: result.viewer.login });
}
