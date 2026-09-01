import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabasePublicEnvironment } from "./environment";

const sessionOptionalPathPrefixes = [
  "/api/cron",
  "/api/account/deletion",
  "/account/deletion",
  "/auth",
  "/login",
] as const;

export function isSessionOptionalPath(pathname: string) {
  return sessionOptionalPathPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const environment = getSupabasePublicEnvironment();

  const supabase = createServerClient(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headersToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          supabaseResponse = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, options, value }) => {
            supabaseResponse.cookies.set(name, value, options);
          });

          Object.entries(headersToSet).forEach(([name, value]) => {
            supabaseResponse.headers.set(name, value);
          });
        },
      },
    },
  );

  // Keep this call immediately after client creation. It verifies the JWT and
  // lets @supabase/ssr refresh cookies before Server Components run.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims && !isSessionOptionalPath(request.nextUrl.pathname)) {
    const loginUrl = request.nextUrl.clone();
    const requestedPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", requestedPath);

    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}
