import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { signedUrl } from "@/lib/storage";

// Returns a short-lived signed URL for a stored file. Restricted to staff and
// supervisors who legitimately review applications.
export async function GET(request: Request) {
  const session = await getSession();
  if (
    !session ||
    !["REGISTRAR", "MAIN_ADMIN", "FACULTY_ADMIN", "SUPERVISOR", "STUDENT"].includes(
      session.role,
    )
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const path = new URL(request.url).searchParams.get("path");
  if (!path) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  const url = await signedUrl(path);
  if (!url) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
  return NextResponse.redirect(url);
}
