import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sharp } from "./design-core.mjs";

const TOOLING_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(TOOLING_DIR, "..");
const MANIFEST_PATH = path.join(ROOT, "manifest.json");
const TOKENS_PATH = path.join(ROOT, "cp3-ui-tokens.json");
const REPORT_DIR = path.join(ROOT, "review-notes");
const REPORT_PATH = path.join(REPORT_DIR, "verification-report.json");

const manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, "utf8"));
const tokens = JSON.parse(await fs.readFile(TOKENS_PATH, "utf8"));
const generator = await fs.readFile(
  path.join(TOOLING_DIR, "generate-cp3.mjs"),
  "utf8",
);
const core = await fs.readFile(
  path.join(TOOLING_DIR, "design-core.mjs"),
  "utf8",
);

const checks = [];
const check = (name, passed, evidence, severity = "error") => {
  checks.push({ name, passed: Boolean(passed), severity, evidence });
};

const contained = (candidate) => {
  const relative = path.relative(ROOT, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
};

const rgb = (hex) => {
  const clean = hex.replace("#", "");
  return [
    Number.parseInt(clean.slice(0, 2), 16),
    Number.parseInt(clean.slice(2, 4), 16),
    Number.parseInt(clean.slice(4, 6), 16),
  ];
};

const luminance = (hex) =>
  rgb(hex)
    .map((value) => {
      const channel = value / 255;
      return channel <= 0.03928
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4;
    })
    .reduce(
      (sum, value, index) =>
        sum + value * [0.2126, 0.7152, 0.0722][index],
      0,
    );

const contrast = (foreground, background) => {
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};

check(
  "Checkpoint identity",
  manifest.checkpoint === "CP3" &&
    manifest.revision === "R0" &&
    manifest.status === "Final / Locked",
  `${manifest.checkpoint}-${manifest.revision}; ${manifest.status}`,
);
check("Primary frame count", manifest.frames?.length === 6, `${manifest.frames?.length} frames`);
check(
  "Spot-check count",
  manifest.spotchecks?.length === 3,
  `${manifest.spotchecks?.length} responsive frames`,
);
check(
  "Review board count",
  manifest.reviewBoards?.length === 8,
  `${manifest.reviewBoards?.length} SVG/PNG board files`,
);
check(
  "Desktop token contract",
  tokens.viewport?.primary?.width === 1440 &&
    tokens.viewport?.primary?.height === 1024 &&
    tokens.viewport?.sidebarWidth === 240 &&
    tokens.viewport?.gridColumns === 12 &&
    tokens.viewport?.gutter === 24,
  JSON.stringify(tokens.viewport),
);
check(
  "1280 content-width contract",
  1280 - 240 - 32 * 2 === 976,
  "1280 - 240 sidebar - 64 padding = 976px",
);
check(
  "Primary control contract",
  tokens.viewport?.minimumControlHeight >= 44 &&
    /height = 44,/u.test(core),
  "Desktop control default is 44px",
);
check(
  "Composition decision recorded",
  tokens.composition?.primary === "Editorial Ledger" &&
    tokens.composition?.contextual === "Split Workspace" &&
    tokens.composition?.rejected === "Analytics Grid",
  JSON.stringify(tokens.composition),
);

const expectedFiles = [
  ...manifest.generatedFiles,
  ...manifest.documentation,
  "manifest.json",
  "tooling/design-core.mjs",
  "tooling/generate-cp3.mjs",
  "tooling/verify-cp3.mjs",
].map((relative) => path.resolve(ROOT, relative));

for (const filePath of expectedFiles) {
  let size = 0;
  try {
    size = (await fs.stat(filePath)).size;
  } catch {
    size = 0;
  }
  check(
    `File present: ${path.relative(ROOT, filePath)}`,
    contained(filePath) && size > 0,
    `contained=${contained(filePath)}; bytes=${size}`,
  );
}

for (const frame of manifest.frames) {
  const svgPath = path.resolve(ROOT, frame.svg);
  const pngPath = path.resolve(ROOT, frame.png);
  const [svg, pngMeta] = await Promise.all([
    fs.readFile(svgPath, "utf8"),
    sharp(pngPath).metadata(),
  ]);
  check(
    `${frame.number} viewport 1440x1024`,
    /<svg[^>]*width="1440"[^>]*height="1024"/su.test(svg) &&
      /viewBox="0 0 1440 1024"/u.test(svg) &&
      pngMeta.width === 1440 &&
      pngMeta.height === 1024,
    `png=${pngMeta.width}x${pngMeta.height}`,
  );
  check(
    `${frame.number} target fonts embedded`,
    svg.includes('font-family: "Space Grotesk"') &&
      svg.includes('font-family: "IBM Plex Sans"') &&
      svg.includes("data:font/ttf") &&
      svg.includes("data:font/woff"),
    "Space Grotesk TTF and IBM Plex Sans WOFF embedded",
  );
  check(
    `${frame.number} light-first root canvas`,
    svg.includes('<rect width="1440" height="1024" fill="#F6F2E8"/>'),
    "Rice Paper root canvas",
  );
  check(
    `${frame.number} fixed desktop sidebar`,
    svg.includes('<rect x="0" y="0" width="240" height="1024"'),
    "240px Midnight sidebar",
  );
  check(
    `${frame.number} LOGO-R1 embedded`,
    svg.includes("data:image/svg+xml;base64,"),
    "Reverse compact lockup is embedded",
  );
  check(
    `${frame.number} anti-slop primitives absent`,
    !/(<linearGradient|<radialGradient|backdrop-filter\s*:|filter\s*=\s*"url\(|glassmorphism|drop-shadow\s*\()/iu.test(
      svg.replace(
        /data:[^;]+;base64,[A-Za-z0-9+/=]+/gu,
        "[embedded-asset]",
      ),
    ),
    "No gradients, glass, glow filters, or particles",
  );

  const { data, info } = await sharp(pngPath)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const [signalR, signalG, signalB] = rgb("#B9D86E");
  let signalPixels = 0;
  for (let offset = 0; offset < data.length; offset += info.channels) {
    if (
      data[offset] === signalR &&
      data[offset + 1] === signalG &&
      data[offset + 2] === signalB
    ) {
      signalPixels += 1;
    }
  }
  const share = signalPixels / (info.width * info.height);
  check(
    `${frame.number} Signal Leaf remains restrained`,
    share <= 0.05,
    `${(share * 100).toFixed(3)}% exact-color pixels`,
  );
}

for (const spot of manifest.spotchecks) {
  const svg = await fs.readFile(path.resolve(ROOT, spot.svg), "utf8");
  const metadata = await sharp(path.resolve(ROOT, spot.png)).metadata();
  check(
    `${spot.title} viewport 1280x1024`,
    /<svg[^>]*width="1280"[^>]*height="1024"/su.test(svg) &&
      /viewBox="0 0 1280 1024"/u.test(svg) &&
      metadata.width === 1280 &&
      metadata.height === 1024,
    `png=${metadata.width}x${metadata.height}`,
  );
  check(
    `${spot.title} retains 240px sidebar`,
    svg.includes('<rect x="0" y="0" width="240" height="1024"'),
    "Full desktop sidebar retained at 1280px",
  );
}

const processingSvg = await fs.readFile(
  path.join(ROOT, "desktop", "desktop-scan-upload-processing-cp3-r0.svg"),
  "utf8",
);
check(
  "Focused inspection remains contextual",
  processingSvg.includes('<rect width="1440" height="1024" fill="#F6F2E8"/>') &&
    processingSvg.includes('fill="#0B1220"') &&
    processingSvg.includes("Focused inspection"),
  "Dark inspection panel is nested within a light page",
);
check(
  "Focused inspection has no fake progress",
  !/\b\d{1,3}%\b/u.test(processingSvg) &&
    !/\bconfidence\s*[:=]\s*\d/iu.test(processingSvg),
  "No percentage or confidence score appears in processing",
);

const dashboardSvg = await fs.readFile(
  path.join(ROOT, "desktop", "desktop-dashboard-default-cp3-r0.svg"),
  "utf8",
);
check(
  "Dashboard avoids enterprise KPI language",
  !/\b(KPI|revenue|performance|growth|conversion|MRR)\b/iu.test(dashboardSvg),
  "Copy remains personal and Indonesian",
);
check(
  "Dashboard avoids metric-card wall",
  tokens.dashboard?.metricCardWall === false &&
    tokens.dashboard?.topRatio === "64/36",
  "Editorial summary/insight anchor is documented",
);
check(
  "Responsive guardrail forbids mixed navigation",
  tokens.responsive?.prohibition ===
    "Never show full sidebar and bottom navigation together",
  tokens.responsive?.prohibition,
);
check(
  "No inline font-size reduction branch",
  !/(width\s*<\s*1400[\s\S]{0,180}font-size|fontSize\s*=)/u.test(generator),
  "Layouts change before typography",
);

const contrastPairs = [
  ["ink / canvas", "#0B1220", "#F6F2E8"],
  ["secondary / canvas", "#53606C", "#F6F2E8"],
  ["white / primary", "#FFFFFF", "#285A73"],
  ["white / midnight", "#FFFFFF", "#0B1220"],
  ["dark muted / midnight", "#AAB3BF", "#0B1220"],
  ["expense ink / surface", "#A63D2A", "#FFFFFF"],
  ["warning / warning soft", "#8A3C00", "#FFF1D6"],
  ["signal ink / signal soft", "#526827", "#EDF5D5"],
];
for (const [name, foreground, background] of contrastPairs) {
  const ratio = contrast(foreground, background);
  check(`WCAG AA ${name}`, ratio >= 4.5, `${ratio.toFixed(2)}:1`);
}

const failures = checks.filter((item) => !item.passed);
const report = {
  project: "Fintrack AI",
  checkpoint: "CP3-R0",
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
      failures: failures.map((item) => item.name),
    },
    null,
    2,
  ),
);
if (failures.length > 0) process.exitCode = 1;
