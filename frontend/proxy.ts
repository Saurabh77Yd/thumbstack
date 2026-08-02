import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ROUTES } from "@/constants/routes";

// Optimistic check only: the JWT itself lives client-side (Authorization header),
// this reads a lightweight non-httpOnly flag cookie set on login/logout to avoid
// a flash of protected content before the client-side AppShell guard confirms auth.
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has("session");

  if (!hasSession) {
    return NextResponse.redirect(new URL(ROUTES.login, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/books/:path*"],
};
