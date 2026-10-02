import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

type AppRole = "candidate" | "global_candidate" | "recruiter" | "admin";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Build a mutable response that we will return
  let response = NextResponse.next({ request });

  const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey  =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  // If Supabase is not configured (missing env vars), pass all requests through
  // rather than crashing and causing 404s on every page.
  if (!supabaseUrl || !supabaseKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Write cookies to the request first (so getAll returns them)
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        // Rebuild the response so it carries refreshed cookies to the browser
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: always call getUser() so the session is refreshed and cookies propagated
  const { data: { user } } = await supabase.auth.getUser();

  const isProtected = (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/global-dashboard") ||
    pathname.startsWith("/hire") ||
    pathname.startsWith("/admin")
  );
  const isRecruiter  = pathname.startsWith("/hire");
  const isAdmin      = pathname.startsWith("/admin");
  const isAuthPage   = pathname.startsWith("/auth");

  // ── Unauthenticated user hitting a protected page ─────────────────────────
  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = isAdmin ? "/auth/admin" : "/auth/signin";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (user) {
    const role = await getProfileRole(supabase, user.id, user.user_metadata?.role);

    // ── Recruiter → candidate portals ────────────────────────────────────────
    const isCandidatePortal =
      pathname.startsWith("/dashboard") || pathname.startsWith("/global-dashboard");
    if (isCandidatePortal && role === "recruiter") {
      return NextResponse.redirect(new URL("/hire", request.url));
    }

    // ── Non-recruiter → /hire ─────────────────────────────────────────────────
    if (isRecruiter && role !== "recruiter" && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // ── Non-admin → /admin ────────────────────────────────────────────────────
    if (isAdmin && role !== "admin") {
      return NextResponse.redirect(new URL(role === "recruiter" ? "/hire" : "/dashboard", request.url));
    }

    // ── Authenticated user on an auth page → redirect to their dashboard ─────
    if (isAuthPage) {
      const nextParam = request.nextUrl.searchParams.get("next");
      const callbackParam = request.nextUrl.searchParams.get("callbackUrl");
      let dest = nextParam || callbackParam;
      
      if (!dest || !dest.startsWith("/") || dest.startsWith("//")) {
        dest =
          role === "admin"            ? "/admin"
          : role === "recruiter"      ? "/hire"
          : role === "global_candidate" ? "/career-support"
          : "/dashboard";
      }

      const redirect = NextResponse.redirect(new URL(dest, request.url));
      // Carry the session cookies over to the redirect response
      response.cookies.getAll().forEach(({ name, value }) => {
        redirect.cookies.set(name, value);
      });
      return redirect;
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/global-dashboard/:path*",
    "/hire/:path*",
    "/admin/:path*",
    "/auth/:path*",
  ],
};

async function getProfileRole(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
  metaRole?: string
): Promise<AppRole> {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  const rawRole = data?.role ?? metaRole;
  return normalizeRole(rawRole);
}

function normalizeRole(value: unknown): AppRole {
  if (
    value === "global_candidate" ||
    value === "recruiter" ||
    value === "admin"
  ) {
    return value;
  }
  return "candidate";
}