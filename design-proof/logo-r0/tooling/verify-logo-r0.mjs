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
const failures = [];
const checks = [];

function pass(name, evidence) {
  checks.push({ name, status: "pass", evidence });
}

function fail(name, evidence) {
  failures.push({ name, status: "fail", evidence });
}

const rootWithSeparator = `${path.resolve(ROOT)}${path.sep}`;
const listedFiles = manifest.files.map((relativePath) =>
  path.resolve(ROOT, relativePath.replaceAll("/", path.sep)),
);

for (const file of listedFiles) {
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
  pass("manifest files", `${listedFiles.length}/${listedFiles.length} exist and are non-empty`);
}

const svgFiles = listedFiles.filter((file) => file.endsWith(".svg"));
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
  pass("SVG renderability", `${svgFiles.length}/${svgFiles.length} SVG files parsed by Sharp`);
}

const pngFiles = listedFiles.filter((file) => file.endsWith(".png"));
for (const file of pngFiles) {
  try {
    const metadata = await sharp(file).metadata();
    if (metadata.format !== "png" || !metadata.width || !metadata.height) {
      fail("PNG metadata", file);
      continue;
    }

    const exactMatch = file.match(/-(16|24|32|48)px\.png$/);
    if (exactMatch) {
      const expected = Number(exactMatch[1]);
      if (metadata.width !== expected || metadata.height !== expected) {
        fail("exact-size raster", `${file}: ${metadata.width}x${metadata.height}`);
      }
    }

    const zoomMatch = file.match(/-(16|24|32|48)px-8x\.png$/);
    if (zoomMatch) {
      const expected = Number(zoomMatch[1]) * 8;
      if (metadata.width !== expected || metadata.height !== expected) {
        fail("8x raster inspection", `${file}: ${metadata.width}x${metadata.height}`);
      }
    }
  } catch (error) {
    fail("PNG metadata", `${file}: ${error.message}`);
  }
}

if (!failures.some((item) => item.name === "PNG metadata")) {
  pass("PNG metadata", `${pngFiles.length}/${pngFiles.length} PNG files parsed`);
}
if (!failures.some((item) => item.name === "exact-size raster")) {
  pass("exact-size raster", "all 16, 24, 32, and 48 px files match their declared dimensions");
}
if (!failures.some((item) => item.name === "8x raster inspection")) {
  pass("8x raster inspection", "all zoom previews are exact nearest-neighbor 8x dimensions");
}

for (const requiredAsset of [
  path.join(ROOT, "assets", "fonts", "SpaceGrotesk-Variable.ttf"),
  path.join(ROOT, "assets", "fonts", "OFL.txt"),
]) {
  try {
    const stat = await fs.stat(requiredAsset);
    if (stat.size === 0) {
      fail("font asset", requiredAsset);
    }
  } catch (error) {
    fail("font asset", `${requiredAsset}: ${error.message}`);
  }
}
if (!failures.some((item) => item.name === "font asset")) {
  pass("font asset", "Space Grotesk and its OFL license are stored locally");
}

const report = {
  track: manifest.track,
  revision: manifest.revision,
  status: failures.length === 0 ? "pass" : "fail",
  checkedManifestFiles: listedFiles.length,
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
