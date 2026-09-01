import type { Metadata, Viewport } from "next";

import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";

import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";

import "./globals.css";

export const metadata: Metadata = {
  applicationName: "Fintrack AI",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Fintrack AI",
  },
  description:
    "Catat dan pahami pengeluaran dengan bantuan AI yang transparan dan dapat ditinjau.",
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.webmanifest",
  title: {
    default: "Fintrack AI",
    template: "%s · Fintrack AI",
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#F6F2E8",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="id">
      <body>
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
