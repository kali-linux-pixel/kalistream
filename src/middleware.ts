import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const role = request.cookies.get("kalistream_role")?.value;
  const uid = request.cookies.get("kalistream_uid")?.value;

  if (path.startsWith("/kalicore-admin")) {
    if (uid && (role === "admin" || role === "owner" || role === "moderator")) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (path.startsWith("/premium")) {
    if (uid) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (path.startsWith("/ultra")) {
    if (uid && (role === "ultra" || role === "admin")) return NextResponse.next();
    return NextResponse.redirect(new URL("/premium", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/kalicore-admin/:path*", "/premium/:path*", "/ultra/:path*"],
};
