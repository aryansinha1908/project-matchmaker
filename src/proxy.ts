import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const method = req.method;

  if (pathname.startsWith("/api/auth")) {
    return;
  }

  const isPublicFrontend =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/projects" || // Explore page
    (pathname.startsWith("/projects/") &&
      pathname !== "/projects/new" &&
      !pathname.endsWith("/settings") &&
      !pathname.endsWith("/apply")) ||
    (pathname.startsWith("/dashboard/") &&
      pathname !== "/dashboard" &&
      !pathname.endsWith("/settings"));

  const isPublicApi =
    method === "GET" &&
    (pathname === "/api/projects" ||
      pathname.startsWith("/api/projects/") ||
      pathname === "/api/users" ||
      pathname.startsWith("/api/users/"));

  const isPublic = isPublicFrontend || isPublicApi;

  if (!isPublic) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { message: "Authentication required to perform this action." },
          { status: 401 },
        );
      }

      // For page navigation, redirect to login page normally
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
