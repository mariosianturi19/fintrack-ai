import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

import { createAccountSummary } from "./account";

export const getAccountSession = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || !claims) {
    return null;
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user || userData.user.id !== claims.sub)
    return null;
  const { data: access, error: accessError } = await supabase.rpc(
    "get_account_access_state",
  );
  // Fail closed on missing migration/service failure, not a cached JWT fallback.
  if (accessError) throw new Error("Account access verification unavailable.");
  if (access !== "active" && access !== "deleting") return null;
  return {
    userId: userData.user.id,
    account: createAccountSummary(userData.user),
    access,
  };
});

export const getAuthenticatedAccount = cache(async () => {
  const session = await getAccountSession();
  return session?.access === "active" ? session.account : null;
});

export const getAuthenticatedUserId = cache(async () => {
  const session = await getAccountSession();
  return session?.access === "active" ? session.userId : null;
});
