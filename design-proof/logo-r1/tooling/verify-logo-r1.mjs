import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require("sharp");
const TOOLING_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(TOOLING_DIR, "..");
const REPORT_PATH = path.join(
  ROOT,
  "review-notes",
  "verification-report.json",
);

const PAPER = [246, 242, 232];
const LOCKUP_WIDTH = 492;
const LOCKUP_HEIGHT = 72;
const checks = [];

function record(name, passed, detail) {
  checks.push({ name, passed, detail });
}

function relative(filePath) {
  return path.relative(ROOT, filePath).replaceAll("\\", "/");
}

function insideRoot(filePath) {
  const rel = path.relative(ROOT, filePath);
  return rel !== "" && !rel.startsWith("..") && !path.isAbsolute(rel);
}

function srgbToLinear(channel) {
  const value = channel / 255;
  return value <= 0.04045
    ? value / 12.92
    : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)
    .map((value) => Number.parseInt(value, 16))
    .map(srgbToLinear);
  return (
    channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
  );
}

function contrast(foreground, background) {
  const first = luminance(foreground);
  const second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

async function assertPngSize(filePath, width, height) {
  const metadata = await sharp(filePath).metadata();
  const passed = metadata.width === width && metadata.height === height;
  record(
    `PNG dimensions: ${relative(filePath)}`,
    passed,
    `${metadata.width}×${metadata.height}; expected ${width}×${height}`,
  );
}

async function assertSvgSize(filePath, width, height) {
  const content = await fs.readFile(filePath, "utf8");
  const metadata = await sharp(Buffer.from(content)).metadata();
  const passed = metadata.width === width && metadata.height === height;
  record(
    `SVG render and dimensions: ${relative(filePath)}`,
    passed,
    `${metadata.width}×${metadata.height}; expected ${width}×${height}`,
  );
}

async function assertMaskableSafeZone(filePath, size) {
  const { data, info } = await sharp(filePath)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const radius = size * 0.4;
  const center = (size - 1) / 2;
  let coloredPixels = 0;
  let outsidePixels = 0;

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const offset = (y * info.width + x) * info.channels;
      const delta =
        Math.abs(data[offset] - PAPER[0]) +
        Math.abs(data[offset + 1] - PAPER[1]) +
        Math.abs(data[offset + 2] - PAPER[2]);
      if (delta > 20) {
        coloredPixels += 1;
        if (Math.hypot(x - center, y - center) > radius) {
          outsidePixels += 1;
        }
      }
    }
  }

  record(
    `Maskable safe zone: ${relative(filePath)}`,
    coloredPixels > 0 && outsidePixels === 0,
    `${coloredPixels} mark pixels checked; ${outsidePixels} outside centered 40% radius`,
  );
}

const manifestPath = path.join(ROOT, "manifest.json");
const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
const uniquePaths = new Set(manifest.files);
record(
  "Manifest has no duplicate file paths",
  uniquePaths.size === manifest.files.length,
  `${uniquePaths.size}/${manifest.files.length} unique`,
);

for (const entry of manifest.files) {
  const target = path.resolve(ROOT, entry);
  const contained = insideRoot(target);
  record(`Path containment: ${entry}`, contained, contained ? "inside LOGO-R1 root" : target);
  if (!contained) continue;

  try {
    const stat = await fs.stat(target);
    record(`File exists and is non-empty: ${entry}`, stat.isFile() && stat.size > 0, `${stat.size} bytes`);
  } catch (error) {
    record(`File exists and is non-empty: ${entry}`, false, error.message);
  }
}

const assetSvgFiles = manifest.files.filter(
  (entry) => entry.startsWith("assets/") && entry.endsWith(".svg"),
);
for (const entry of assetSvgFiles) {
  const target = path.join(ROOT, entry);
  const content = await fs.readFile(target, "utf8");
  record(
    `Production SVG contains no live text: ${entry}`,
    !/<text[\s>]/i.test(content),
    /<text[\s>]/i.test(content) ? "live text found" : "paths and strokes only",
  );
  try {
    await sharp(Buffer.from(content)).metadata();
    record(`Production SVG parses: ${entry}`, true, "renderable by Sharp");
  } catch (error) {
    record(`Production SVG parses: ${entry}`, false, error.message);
  }
}

for (const name of [
  "fintrack-ai-mark-primary.svg",
  "fintrack-ai-mark-midnight.svg",
  "fintrack-ai-mark-reverse.svg",
  "fintrack-ai-mark-micro-primary.svg",
  "fintrack-ai-mark-micro-midnight.svg",
  "fintrack-ai-mark-micro-reverse.svg",
]) {
  await assertSvgSize(path.join(ROOT, "assets", "marks", name), 160, 160);
}

for (const name of [
  "fintrack-ai-lockup-primary.svg",
  "fintrack-ai-lockup-reverse.svg",
  "fintrack-ai-lockup-monochrome-dark.svg",
  "fintrack-ai-lockup-monochrome-light.svg",
  "fintrack-ai-lockup-compact-primary.svg",
  "fintrack-ai-lockup-compact-reverse.svg",
  "fintrack-ai-lockup-compact-monochrome-dark.svg",
  "fintrack-ai-lockup-compact-monochrome-light.svg",
]) {
  await assertSvgSize(
    path.join(ROOT, "assets", "lockups", name),
    LOCKUP_WIDTH,
    LOCKUP_HEIGHT,
  );
}

for (const size of [192, 512]) {
  for (const suffix of ["", "-maskable"]) {
    await assertPngSize(
      path.join(
        ROOT,
        "assets",
        "app-icons",
        `fintrack-ai-pwa-${size}${suffix}.png`,
      ),
      size,
      size,
    );
  }
  await assertMaskableSafeZone(
    path.join(
      ROOT,
      "assets",
      "app-icons",
      `fintrack-ai-pwa-${size}-maskable.png`,
    ),
    size,
  );
}

for (const size of [16, 32]) {
  await assertPngSize(
    path.join(ROOT, "assets", "app-icons", `fintrack-ai-favicon-${size}.png`),
    size,
    size,
  );
}

for (const mark of ["master", "micro"]) {
  for (const size of [16, 20, 24, 32, 48, 64]) {
    await assertPngSize(
      path.join(ROOT, "tests", `${mark}-${size}px.png`),
      size,
      size,
    );
  }
}

for (const height of [24, 32, 48]) {
  await assertPngSize(
    path.join(ROOT, "tests", `lockup-${height}h.png`),
    Math.round((LOCKUP_WIDTH / LOCKUP_HEIGHT) * height),
    height,
  );
}

const contrastPairs = [
  ["Midnight / Rice Paper", "#0B1220", "#F6F2E8", 4.5],
  ["Mineral Blue / Rice Paper", "#285A73", "#F6F2E8", 4.5],
  ["Rice Paper / Midnight", "#F6F2E8", "#0B1220", 4.5],
  ["White / Midnight", "#FFFFFF", "#0B1220", 4.5],
];
for (const [name, foreground, background, threshold] of contrastPairs) {
  const ratio = contrast(foreground, background);
  record(
    `Contrast: ${name}`,
    ratio >= threshold,
    `${ratio.toFixed(2)}:1; threshold ${threshold}:1`,
  );
}

const failures = checks.filter((check) => !check.passed);
const report = {
  project: "Fintrack AI",
  revision: "LOGO-R1",
  generatedAt: new Date().toISOString(),
  status: failures.length === 0 ? "PASS" : "FAIL",
  summary: {
    total: checks.length,
    passed: checks.length - failures.length,
    failed: failures.length,
  },
  limitations: [
    "Automated checks validate file integrity, renderability, dimensions, contrast, and maskable safe-zone geometry.",
    "Optical balance, distinctiveness, and interface presence require human visual review.",
    "Trademark clearance and production lock are outside LOGO-R1 and remain pending.",
  ],
  checks,
};

await fs.mkdir(path.dirname(REPORT_PATH), { recursive: true });
await fs.writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log(
  JSON.stringify(
    {
      report: REPORT_PATH,
      status: report.status,
      ...report.summary,
    },
    null,
    2,
  ),
);

if (failures.length > 0) {
  process.exitCode = 1;
}
