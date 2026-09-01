import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const TOOLING_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(TOOLING_DIR, "..");
const MANIFEST_PATH = path.join(ROOT, "manifest.json");
const REPORT_PATH = path.join(ROOT, "review-notes", "verification-report.json");

const manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, "utf8"));
const checks = [];
const failures = [];

function pass(name, evidence) {
  checks.push({ name, status: "pass", evidence });
}

function fail(name, evidence) {
  failures.push({ name, status: "fail", evidence });
}

const rootWithSeparator = `${path.resolve(ROOT)}${path.sep}`;
const files = manifest.files.map((relativePath) =>
  path.resolve(ROOT, relativePath.replaceAll("/", path.sep)),
);

for (const file of files) {
  if (!file.startsWith(rootWithSeparator)) {
    fail("path containment", file);
    continue;
  }
  try {
    const stat = await fs.stat(file);
    if (!stat.isFile() || stat.size === 0) {
      fail("non-empty file", file);
    }
  } catch (error) {
    fail("manifest file exists", `${file}: ${error.message}`);
  }
}
if (failures.length === 0) {
  pass("manifest files", `${files.length}/${files.length} exist and are non-empty`);
}

const svgFiles = files.filter((file) => file.endsWith(".svg"));
for (const file of svgFiles) {
  try {
    const metadata = await sharp(file).metadata();
    if (!metadata.width || !metadata.height) {
      fail("SVG renderability", file);
    }
  } catch (error) {
    fail("SVG renderability", `${file}: ${error.message}`);
  }
}
if (!failures.some((item) => item.name === "SVG renderability")) {
  pass("SVG renderability", `${svgFiles.length}/${svgFiles.length} SVG files parsed`);
}

const pngFiles = files.filter((file) => file.endsWith(".png"));
for (const file of pngFiles) {
  try {
    const metadata = await sharp(file).metadata();
    if (metadata.format !== "png" || !metadata.width || !metadata.height) {
      fail("PNG metadata", file);
      continue;
    }

    const markExact = file.match(/-mark-(16|24|32|48)px\.png$/);
    if (markExact) {
      const expected = Number(markExact[1]);
      if (metadata.width !== expected || metadata.height !== expected) {
        fail("mark exact size", `${file}: ${metadata.width}x${metadata.height}`);
      }
    }

    const markZoom = file.match(/-mark-(16|24|32|48)px-8x\.png$/);
    if (markZoom) {
      const expected = Number(markZoom[1]) * 8;
      if (metadata.width !== expected || metadata.height !== expected) {
        fail("mark zoom size", `${file}: ${metadata.width}x${metadata.height}`);
      }
    }

    const lockupExact = file.match(/-lockup-(24|32|48)h\.png$/);
    if (lockupExact) {
      const expectedHeight = Number(lockupExact[1]);
      if (metadata.height !== expectedHeight) {
        fail("lockup exact height", `${file}: ${metadata.width}x${metadata.height}`);
      }
    }

    const lockupZoom = file.match(/-lockup-(24|32|48)h-4x\.png$/);
    if (lockupZoom) {
      const expectedHeight = Number(lockupZoom[1]) * 4;
      if (metadata.height !== expectedHeight) {
        fail("lockup zoom height", `${file}: ${metadata.width}x${metadata.height}`);
      }
    }
  } catch (error) {
    fail("PNG metadata", `${file}: ${error.message}`);
  }
}
if (!failures.some((item) => item.name === "PNG metadata")) {
  pass("PNG metadata", `${pngFiles.length}/${pngFiles.length} PNG files parsed`);
}
if (!failures.some((item) => item.name === "mark exact size")) {
  pass("mark exact size", "all 16, 24, 32, and 48 px mark files match");
}
if (!failures.some((item) => item.name === "mark zoom size")) {
  pass("mark zoom size", "all mark zooms are exact 8x dimensions");
}
if (!failures.some((item) => item.name === "lockup exact height")) {
  pass("lockup exact height", "all 24, 32, and 48 px lockups match");
}
if (!failures.some((item) => item.name === "lockup zoom height")) {
  pass("lockup zoom height", "all lockup zooms are exact 4x dimensions");
}

const report = {
  track: manifest.track,
  round: manifest.round,
  status: failures.length === 0 ? "pass" : "fail",
  verdict: manifest.verdict,
  checkedManifestFiles: files.length,
  svgCount: svgFiles.length,
  pngCount: pngFiles.length,
  checks,
  failures,
};

await fs.mkdir(path.dirname(REPORT_PATH), { recursive: true });
await fs.writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));

if (failures.length > 0) {
  process.exitCode = 1;
}

