import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#F6F2E8",
    categories: ["finance", "productivity"],
    description:
      "Catat dan pahami pengeluaran dengan bantuan AI yang transparan dan dapat ditinjau.",
    display: "standalone",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192-maskable.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    id: "/",
    lang: "id-ID",
    name: "Fintrack AI",
    orientation: "any",
    scope: "/",
    short_name: "Fintrack",
    start_url: "/",
    theme_color: "#F6F2E8",
  };
}
