import { createBrowserClient } from "@supabase/ssr";

import { getSupabasePublicEnvironment } from "./environment";

export function createClient() {
  const environment = getSupabasePublicEnvironment();

  return createBrowserClient(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
