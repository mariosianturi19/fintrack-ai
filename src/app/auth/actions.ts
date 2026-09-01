"use server";

import { redirect } from "next/navigation";

import { environment } from "@/lib/env/server";
import { createClient } from "@/lib/supabase/server";

import { createLoginPath, getSafeRedirectPath } from "@/lib/auth/redirects";

export async function signInWithGoogle(formData: FormData) {
  const next = getSafeRedirectPath(formData.get("next")?.toString());
  const supabase = await createClient();
  const callbackUrl = new URL(
    "/auth/callback",
    environment.NEXT_PUBLIC_APP_URL,
  );

  if (next !== "/") {
    callbackUrl.searchParams.set("next", next);
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    options: {
      redirectTo: callbackUrl.toString(),
    },
    provider: "google",
  });

  if (error || !data.url) {
    redirect(createLoginPath({ error: "oauth_start_failed", next }));
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect(createLoginPath({ message: "signed_out" }));
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    redirect("/profile?error=signout_failed");
  }

  redirect(createLoginPath({ message: "signed_out" }));
}
