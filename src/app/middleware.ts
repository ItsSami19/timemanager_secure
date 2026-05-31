import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Seiten, die öffentlich bleiben sollen
const publicPaths = ["/login", "/auth", "/access-denied", "/favicon.ico"];

// Zugriffstabellen
const roleAccess: Record<string, string[]> = {
  HR: ["/dashboard/hr"],
  SUPERVISOR: ["/dashboard/supervisor"],
  EMPLOYEE: ["/dashboard/employee"],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const url = req.nextUrl.clone();

  // Öffentliche Seiten durchlassen
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Nicht eingeloggt → Weiterleitung zu Login
  if (!token) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const role = String(token.role); // Sicherstellen, dass role ein string ist

  const allowedPaths: string[] = roleAccess[role] || [];
  const allProtectedPaths = Object.values(roleAccess).flat();

  const isProtected = allProtectedPaths.some((protectedPath: string) =>
    pathname.startsWith(protectedPath)
  );

  const isAllowed = allowedPaths.some((allowedPath: string) =>
    pathname.startsWith(allowedPath)
  );

  if (isProtected && !isAllowed) {
    url.pathname = "/access-denied";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|static|.*\\..*|api).*)"],
};
