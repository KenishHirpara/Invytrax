import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/reset-password"];
const MANAGER_ONLY = ["/settings", "/reports"];

export default async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Allow public routes through
  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    // If authenticated, redirect away from login
    if (session?.user && pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!session?.user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Enforce manager-only routes for staff
  if (
    session.user.role === "staff" &&
    MANAGER_ONLY.some((r) => pathname.startsWith(r))
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
