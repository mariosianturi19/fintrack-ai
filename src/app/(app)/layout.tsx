import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell/app-shell";
import { getAccountSession } from "@/lib/auth/session";

type ApplicationLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default async function ApplicationLayout({
  children,
}: ApplicationLayoutProps) {
  const session = await getAccountSession();
  if (session?.access === "deleting") redirect("/account/deletion");
  const account = session?.account;

  if (!account) {
    redirect("/login");
  }

  return <AppShell account={account}>{children}</AppShell>;
}
