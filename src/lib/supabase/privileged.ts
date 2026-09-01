import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { getSupabasePrivilegedEnvironment } from "./privileged-environment";

export function createPrivilegedClient(
  timeoutMs?: number,
  signal?: AbortSignal,
) {
  const environment = getSupabasePrivilegedEnvironment();

  return createSupabaseClient(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.SUPABASE_SECRET_KEY,
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
      ...(timeoutMs
        ? {
            global: {
              fetch: (input: RequestInfo | URL, init?: RequestInit) =>
                fetch(input, {
                  ...init,
                  signal: AbortSignal.any([
                    AbortSignal.timeout(timeoutMs),
                    ...(signal ? [signal] : []),
                    ...(init?.signal ? [init.signal] : []),
                  ]),
                }),
            },
          }
        : {}),
    },
  );
}
