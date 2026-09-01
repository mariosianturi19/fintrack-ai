export const primaryNavigation = [
  {
    href: "/",
    icon: "dashboard",
    label: "Dashboard",
  },
  {
    href: "/transactions",
    icon: "transactions",
    label: "Transaksi",
  },
  {
    href: "/scan",
    icon: "scan",
    label: "Scan",
  },
  {
    href: "/profile",
    icon: "profile",
    label: "Profil",
  },
] as const;

export type NavigationIcon = (typeof primaryNavigation)[number]["icon"];

export function isNavigationItemActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
