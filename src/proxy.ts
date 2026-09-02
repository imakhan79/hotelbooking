import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const ROLE_GATED_PREFIXES: Record<string, string> = {
  "/host": "host",
  "/admin": "admin",
};

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  const pathname = request.nextUrl.pathname;
  const gatedPrefix = Object.keys(ROLE_GATED_PREFIXES).find((prefix) =>
    pathname.startsWith(prefix),
  );

  if (gatedPrefix) {
    if (!user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(redirectUrl);
    }
    // Role membership is re-verified server-side in each gated layout via RLS-backed
    // queries (defense in depth) — middleware only blocks unauthenticated access here
    // to avoid an extra round trip on every request for the common case.
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
