import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const TOOLING_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(TOOLING_DIR, "..");
const runtimeRequire = createRequire(
  path.join(ROOT, "tooling-runtime", "package.json"),
);
const sharp = runtimeRequire("sharp");

const MANIFEST_PATH = path.join(ROOT, "manifest.json");
const TOKENS_PATH = path.join(ROOT, "cp2-ui-tokens.json");
const REPORT_DIR = path.join(ROOT, "review-notes");
const REPORT_PATH = path.join(REPORT_DIR, "verification-report.json");

const checks = [];
const addCheck = (name, passed, evidence, severity = "error") => {
  checks.push({ name, passed: Boolean(passed), severity, evidence });
};

const isContained = (candidate) => {
  const relative = path.relative(ROOT, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
};

const hexToRgb = (hex) => {
  const clean = hex.replace("#", "");
  return [
    Number.parseInt(clean.slice(0, 2), 16),
    Number.parseInt(clean.slice(2, 4), 16),
    Number.parseInt(clean.slice(4, 6), 16),
  ];
};

const luminance = (hex) => {
  const channels = hexToRgb(hex).map((value) => {
    const normalized = value / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};

const contrast = (foreground, background) => {
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};

const readJson = async (filePath) =>
  JSON.parse(await fs.readFile(filePath, "utf8"));

const manifest = await readJson(MANIFEST_PATH);
const tokens = await readJson(TOKENS_PATH);
const generatorSource = await fs.readFile(
  path.join(TOOLING_DIR, "generate-cp2.mjs"),
  "utf8",
);

addCheck(
  "Checkpoint identity",
  manifest.checkpoint === "CP2" &&
    manifest.revision === "R0" &&
    manifest.status === "Final / Locked",
  `${manifest.checkpoint}-${manifest.revision}; ${manifest.status}`,
);
addCheck(
  "Primary frame count",
  manifest.frames?.length === 10,
  `${manifest.frames?.length ?? 0} frames declared`,
);
addCheck(
  "Review board count",
  manifest.reviewBoards?.length === 6,
  `${manifest.reviewBoards?.length ?? 0} SVG/PNG board files declared`,
);
addCheck(
  "Token viewport contract",
  tokens.viewport?.primary?.width === 390 &&
    tokens.viewport?.primary?.height === 844 &&
    tokens.viewport?.spotcheck?.width === 360 &&
    tokens.viewport?.spotcheck?.height === 844,
  JSON.stringify(tokens.viewport),
);
addCheck(
  "Minimum touch target token",
  tokens.viewport?.minimumTouchTarget >= 44,
  `${tokens.viewport?.minimumTouchTarget}px`,
);
addCheck(
  "Primary control primitives exceed minimum touch target",
  /function button[\s\S]*?height = 48,/u.test(generatorSource) &&
    /function field[\s\S]*?height = 48,/u.test(generatorSource) &&
    tokens.viewport?.bottomNavigationHeight === 80,
  "Button and field defaults are 48px; bottom navigation is 80px",
);

const declaredFiles = [
  ...manifest.generatedFiles,
  "manifest.json",
  "CP2_R0_FINAL_LOCK.md",
  "tooling/generate-cp2.mjs",
  "tooling/verify-cp2.mjs",
  "tooling-runtime/package.json",
  "tooling-runtime/package-lock.json",
].map((relative) => path.resolve(ROOT, relative));

for (const filePath of declaredFiles) {
  const contained = isContained(filePath);
  let size = 0;
  try {
    size = (await fs.stat(filePath)).size;
  } catch {
    size = 0;
  }
  addCheck(
    `File present: ${path.relative(ROOT, filePath)}`,
    contained && size > 0,
    `contained=${contained}; bytes=${size}`,
  );
}

for (const frame of manifest.frames) {
  const svgPath = path.resolve(ROOT, frame.svg);
  const pngPath = path.resolve(ROOT, frame.png);
  const [svg, pngMetadata] = await Promise.all([
    fs.readFile(svgPath, "utf8"),
    sharp(pngPath).metadata(),
  ]);
  const svgSizeMatches =
    /<svg[^>]*width="390"[^>]*height="844"/su.test(svg) &&
    /viewBox="0 0 390 844"/u.test(svg);
  const pngSizeMatches =
    pngMetadata.width === 390 && pngMetadata.height === 844;
  addCheck(
    `${frame.number} viewport 390x844`,
    svgSizeMatches && pngSizeMatches,
    `svg=${svgSizeMatches}; png=${pngMetadata.width}x${pngMetadata.height}`,
  );
  addCheck(
    `${frame.number} target fonts embedded`,
    svg.includes('font-family: "Space Grotesk"') &&
      svg.includes('font-family: "IBM Plex Sans"') &&
      svg.includes("data:font/ttf") &&
      svg.includes("data:font/woff"),
    "Space Grotesk TTF and IBM Plex Sans WOFF embedded",
  );
  addCheck(
    `${frame.number} anti-slop primitives absent`,
    !/(linearGradient|radialGradient|backdrop-filter|glassmorphism|drop-shadow|glow)/iu.test(
      svg,
    ),
    "No gradients, glass, glow, or decorative filters",
  );
}

const spotchecks = [
  "tests/dashboard-360-px-cp2-r0.png",
  "tests/transactions-360-px-cp2-r0.png",
  "tests/review-360-px-cp2-r0.png",
];
for (const relative of spotchecks) {
  const metadata = await sharp(path.join(ROOT, relative)).metadata();
  addCheck(
    `Spot-check ${path.basename(relative)} is 360x844`,
    metadata.width === 360 && metadata.height === 844,
    `${metadata.width}x${metadata.height}`,
  );
}

const processingPath = path.join(
  ROOT,
  "mobile",
  "mobile-scan-processing-cp2-r0.svg",
);
const processingSvg = await fs.readFile(processingPath, "utf8");
addCheck(
  "Focused inspection is intentionally dark",
  processingSvg.includes('<rect width="390" height="844" fill="#0B1220"/>'),
  "Midnight is the root canvas only for processing",
);
addCheck(
  "Focused inspection has no fake numeric progress",
  !/\b\d{1,3}%\b/u.test(processingSvg) &&
    !/\bconfidence\s*[:=]\s*\d/iu.test(processingSvg),
  "No percentage or numeric confidence is rendered",
);

for (const frame of manifest.frames.filter((item) => item.number !== "07")) {
  const svg = await fs.readFile(path.join(ROOT, frame.svg), "utf8");
  addCheck(
    `${frame.number} remains light-first`,
    svg.includes('<rect width="390" height="844" fill="#F6F2E8"/>'),
    "Rice Paper is the root canvas",
  );
}

const contrastPairs = [
  ["ink / canvas", "#0B1220", "#F6F2E8"],
  ["secondary / canvas", "#53606C", "#F6F2E8"],
  ["primary / surface", "#285A73", "#FFFFFF"],
  ["expense ink / surface", "#A63D2A", "#FFFFFF"],
  ["error / surface", "#B42318", "#FFFFFF"],
  ["warning / warning soft", "#8A3C00", "#FFF1D6"],
  ["signal ink / signal soft", "#526827", "#EDF5D5"],
  ["surface / midnight", "#FFFFFF", "#0B1220"],
  ["dark muted / midnight", "#AAB3BF", "#0B1220"],
];
for (const [name, foreground, background] of contrastPairs) {
  const ratio = contrast(foreground, background);
  addCheck(
    `WCAG AA ${name}`,
    ratio >= 4.5,
    `${ratio.toFixed(2)}:1`,
  );
}

const failures = checks.filter((check) => !check.passed);
const report = {
  project: "Fintrack AI",
  checkpoint: "CP2-R0",
  generatedAt: new Date().toISOString(),
  status: failures.length === 0 ? "PASS" : "FAIL",
  summary: {
    total: checks.length,
    passed: checks.length - failures.length,
    failed: failures.length,
  },
  checks,
};

await fs.mkdir(REPORT_DIR, { recursive: true });
await fs.writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log(
  JSON.stringify(
    {
      status: report.status,
      ...report.summary,
      report: REPORT_PATH,
      failures: failures.map((failure) => failure.name),
    },
    null,
    2,
  ),
);

if (failures.length > 0) process.exitCode = 1;
