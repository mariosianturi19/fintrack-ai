import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import manifest from "../src/app/manifest";

const projectRoot = process.cwd();

describe("PWA foundation", () => {
  it("publishes an installable standalone manifest", () => {
    const appManifest = manifest();

    expect(appManifest).toMatchObject({
      background_color: "#F6F2E8",
      display: "standalone",
      lang: "id-ID",
      name: "Fintrack AI",
      scope: "/",
      short_name: "Fintrack",
      start_url: "/",
      theme_color: "#F6F2E8",
    });
  });

  it("provides standard and maskable icons at both required sizes", () => {
    const icons = manifest().icons ?? [];

    expect(icons.map((icon) => [icon.sizes, icon.purpose]).sort()).toEqual(
      [
        ["192x192", "any"],
        ["192x192", "maskable"],
        ["512x512", "any"],
        ["512x512", "maskable"],
      ].sort(),
    );
  });

  it("keeps navigation fallback separate from API and sensitive data caching", async () => {
    const serviceWorker = await readFile(
      join(projectRoot, "public", "sw.js"),
      "utf8",
    );

    expect(serviceWorker).toContain('const OFFLINE_FALLBACK = "/offline.html"');
    expect(serviceWorker).toContain('url.pathname.startsWith("/api/")');
    expect(serviceWorker).toContain('request.mode === "navigate"');
    expect(serviceWorker).toContain("fetch(request).catch");
    expect(serviceWorker).not.toContain("localStorage");
    expect(serviceWorker).not.toContain("indexedDB");
  });

  it("ships a self-contained, accessible offline fallback", async () => {
    const offlinePage = await readFile(
      join(projectRoot, "public", "offline.html"),
      "utf8",
    );

    expect(offlinePage).toContain('<html lang="id">');
    expect(offlinePage).toContain('aria-labelledby="offline-title"');
    expect(offlinePage).toContain("Data finansial dan respons API tidak");
    expect(offlinePage).toContain('href="/"');
  });
});
