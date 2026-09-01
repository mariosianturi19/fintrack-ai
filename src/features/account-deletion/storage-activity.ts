import "server-only";

import { z } from "zod";

import { createPrivilegedClient } from "@/lib/supabase/privileged";

export async function reserveAccountStorage(
  userId: string,
  kind: "upload" | "copy",
): Promise<Date> {
  const { data, error } = await createPrivilegedClient(10_000).rpc(
    "reserve_account_storage",
    { p_user_id: userId, p_kind: kind },
  );
  if (error) throw new Error("Account storage is unavailable.");
  return new Date(z.string().datetime({ offset: true }).parse(data));
}
