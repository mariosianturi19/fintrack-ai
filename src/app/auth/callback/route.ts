import { NextResponse } from "next/server";

import { getSafeRedirectPath, createLoginPath } from "@/lib/auth/redirects";
import { environment } from "@/lib/env/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeRedirectPath(requestUrl.searchParams.get("next"));
  const appOrigin = new URL(environment.NEXT_PUBLIC_APP_URL).origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, appOrigin));
    }
  }

  return NextResponse.redirect(
    new URL(createLoginPath({ error: "callback_failed", next }), appOrigin),
  );
}
