import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();

describe("design-system foundation", () => {
  it("keeps the locked core tokens in the runtime stylesheet", async () => {
    const tokens = await readFile(
      join(projectRoot, "src", "styles", "tokens.css"),
      "utf8",
    );

    expect(tokens).toContain("--ft-color-canvas: #f6f2e8;");
    expect(tokens).toContain("--ft-color-ink: #0b1220;");
    expect(tokens).toContain("--ft-color-primary: #285a73;");
    expect(tokens).toContain('--ft-font-display: "Space Grotesk", sans-serif;');
    expect(tokens).toContain('--ft-font-body: "IBM Plex Sans", sans-serif;');
    expect(tokens).toContain("--ft-sidebar-desktop: 240px;");
  });

  it.each([
    [
      "lockups/fintrack-ai-lockup-primary.svg",
      "fintrack-ai-lockup-primary.svg",
    ],
    [
      "lockups/fintrack-ai-lockup-reverse.svg",
      "fintrack-ai-lockup-reverse.svg",
    ],
    ["marks/fintrack-ai-mark-primary.svg", "fintrack-ai-mark-primary.svg"],
    ["marks/fintrack-ai-mark-reverse.svg", "fintrack-ai-mark-reverse.svg"],
  ])(
    "copies the approved LOGO-R1 asset without modification",
    async (sourceRelativePath, publicFileName) => {
      const [source, publicAsset] = await Promise.all([
        readFile(
          join(
            projectRoot,
            "design-proof",
            "logo-r1",
            "assets",
            sourceRelativePath,
          ),
        ),
        readFile(join(projectRoot, "public", "brand", publicFileName)),
      ]);

      expect(publicAsset).toEqual(source);
    },
  );
});
