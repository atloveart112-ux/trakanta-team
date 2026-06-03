import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session on every request.
 * Redirects unauthenticated users to /login (except for public paths).
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Skip auth gate if Supabase env vars aren't set yet (project bootstrapping).
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: do not run code between createServerClient and getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl;
  const isAuthPage =
    url.pathname.startsWith("/login") ||
    url.pathname.startsWith("/signup") ||
    url.pathname.startsWith("/auth");
  const isPublic =
    url.pathname.startsWith("/_next") ||
    url.pathname === "/favicon.ico" ||
    url.pathname === "/manifest.webmanifest" ||
    url.pathname === "/icon" ||
    url.pathname === "/apple-icon" ||
    url.pathname === "/icon-512" ||
    url.pathname === "/sw.js" ||
    url.pathname.startsWith("/api/cron/");

  if (!user && !isAuthPage && !isPublic) {
    const loginUrl = url.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", url.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && isAuthPage) {
    const homeUrl = url.clone();
    homeUrl.pathname = "/";
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  return supabaseResponse;
}
