import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, deleteSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const bearer = request.headers.get("authorization");
  if (bearer?.startsWith("Bearer ")) {
    await deleteSession(bearer.slice(7));
  } else {
    await clearSessionCookie();
  }
  return NextResponse.json({ ok: true });
}
