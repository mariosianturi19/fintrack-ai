import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const TOOLING_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(TOOLING_DIR, "..");
const DESIGN_PROOF = path.resolve(ROOT, "..");
const REVIEW_DIR = path.join(ROOT, "review-notes");
const CP2_RUNTIME = path.join(DESIGN_PROOF, "local-cp2", "tooling-runtime");
const runtimeRequire = createRequire(path.join(CP2_RUNTIME, "package.json"));
const sharp = runtimeRequire("sharp");

const manifest = JSON.parse(
  await fs.readFile(path.join(ROOT, "manifest.json"), "utf8"),
);
const model = JSON.parse(
  await fs.readFile(path.join(ROOT, "cp4-interaction-model.json"), "utf8"),
);
const html = await fs.readFile(
  path.join(ROOT, "prototype", "index.html"),
  "utf8",
);
const css = await fs.readFile(
  path.join(ROOT, "prototype", "styles.css"),
  "utf8",
);
const app = await fs.readFile(
  path.join(ROOT, "prototype", "app.js"),
  "utf8",
);
const server = await fs.readFile(
  path.join(ROOT, "tooling", "serve-prototype.mjs"),
  "utf8",
);

const checks = [];
function check(name, passed, evidence, category = "general") {
  checks.push({
    name,
    category,
    passed: Boolean(passed),
    evidence: String(evidence),
  });
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ];
}

function luminance(hex) {
  const channels = hexToRgb(hex).map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return (
    0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
  );
}

function contrast(foreground, background) {
  const first = luminance(foreground);
  const second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

async function exists(relativePath) {
  try {
    await fs.access(path.join(ROOT, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function exactColorShare(filePath, rgb) {
  const { data, info } = await sharp(filePath)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let matches = 0;
  for (let index = 0; index < data.length; index += info.channels) {
    if (
      data[index] === rgb[0] &&
      data[index + 1] === rgb[1] &&
      data[index + 2] === rgb[2]
    ) {
      matches += 1;
    }
  }
  return matches / (info.width * info.height);
}

check(
  "Checkpoint identity",
  manifest.checkpoint === "CP4" &&
    manifest.revision === "R0" &&
    manifest.status === "Final / Locked",
  `${manifest.checkpoint}-${manifest.revision}; ${manifest.status}`,
  "identity",
);
check(
  "Direction remains locked",
  manifest.direction === "Quiet Signal — Refined",
  manifest.direction,
  "identity",
);
check(
  "State/runtime frame count",
  manifest.stateFrames?.length === 12,
  `${manifest.stateFrames?.length} frames`,
  "inventory",
);
check(
  "Review board count",
  manifest.reviewBoards?.length === 14,
  `${manifest.reviewBoards?.length} SVG/PNG board files`,
  "inventory",
);
check(
  "Prototype artifact count",
  manifest.prototype?.length === 4,
  `${manifest.prototype?.length} prototype files`,
  "inventory",
);
check(
  "Documentation count",
  manifest.documentation?.length === 6,
  `${manifest.documentation?.length} documentation files`,
  "inventory",
);

const expectedFiles = [
  ...manifest.stateFrames.flatMap((frame) => [frame.svg, frame.png]),
  ...manifest.reviewBoards,
  ...manifest.prototype,
  ...manifest.documentation,
  "manifest.json",
  "tooling/generate-cp4.mjs",
  "tooling/verify-cp4.mjs",
  "tooling/serve-prototype.mjs",
];

for (const relativePath of expectedFiles) {
  check(
    `Artifact exists: ${relativePath}`,
    await exists(relativePath),
    relativePath,
    "files",
  );
}

const boardDimensions = {
  CP4_R0_INTERACTION_STRATEGY: [1800, 1000],
  CP4_R0_STATE_INVENTORY: [1800, 1260],
  CP4_R0_SCAN_FLOW: [1800, 1020],
  CP4_R0_CORRECTION_FLOW: [1800, 1000],
  CP4_R0_FOCUS_MOTION: [1800, 1120],
  CP4_R0_RESPONSIVE_STATES: [1800, 900],
  CP4_R0_STATE_CONTACT_SHEET: [1800, 1900],
};

for (const frame of manifest.stateFrames) {
  const expected =
    frame.platform === "mobile" ? [390, 844] : [1440, 1024];
  for (const format of ["svg", "png"]) {
    const metadata = await sharp(path.join(ROOT, frame[format])).metadata();
    check(
      `${frame.title} ${format.toUpperCase()} dimensions`,
      metadata.width === expected[0] && metadata.height === expected[1],
      `${metadata.width}x${metadata.height}`,
      "dimensions",
    );
  }
}

for (const [baseName, expected] of Object.entries(boardDimensions)) {
  for (const format of ["svg", "png"]) {
    const metadata = await sharp(
      path.join(ROOT, `${baseName}.${format}`),
    ).metadata();
    check(
      `${baseName} ${format.toUpperCase()} dimensions`,
      metadata.width === expected[0] && metadata.height === expected[1],
      `${metadata.width}x${metadata.height}`,
      "dimensions",
    );
  }
}

const forbiddenVisualPatterns = [
  ["gradient", /<(?:linear|radial)Gradient\b/iu],
  ["filter", /<filter\b/iu],
  ["foreignObject", /<foreignObject\b/iu],
  ["glass blur", /backdrop-filter|feGaussianBlur/iu],
];

for (const frame of manifest.stateFrames) {
  const svg = await fs.readFile(path.join(ROOT, frame.svg), "utf8");
  for (const [label, pattern] of forbiddenVisualPatterns) {
    check(
      `${frame.title} avoids ${label}`,
      !pattern.test(svg),
      pattern.test(svg) ? `Found ${label}` : "Not found",
      "anti-generic",
    );
  }
  check(
    `${frame.title} has no numeric fake progress`,
    !/\b(?:[1-9]|[1-9]\d|100)%\b/u.test(svg),
    "No numeric percentage",
    "ai-integrity",
  );
}

const signalRgb = [185, 216, 110];
for (const frame of manifest.stateFrames) {
  const share = await exactColorShare(path.join(ROOT, frame.png), signalRgb);
  check(
    `${frame.title} Signal Leaf <= 5%`,
    share <= 0.05,
    `${(share * 100).toFixed(3)}% exact-color pixels`,
    "color",
  );
}

const requiredStateIds = [
  "loading",
  "empty",
  "offline",
  "error",
  "quota",
  "review",
  "success",
  "destructive",
];
const actualStateIds = model.states.map((state) => state.id);
for (const id of requiredStateIds) {
  check(
    `State modeled: ${id}`,
    actualStateIds.includes(id),
    actualStateIds.join(", "),
    "state-model",
  );
}

check(
  "State inventory has no duplicates",
  new Set(actualStateIds).size === actualStateIds.length,
  `${actualStateIds.length} entries; ${new Set(actualStateIds).size} unique`,
  "state-model",
);
check(
  "Scan happy path is complete",
  model.flows.scan.happyPath.join(">") ===
    "dashboard>scan-start>preparation>processing>review>save>dashboard-updated",
  model.flows.scan.happyPath.join(" → "),
  "flows",
);
check(
  "Correction happy path is complete",
  model.flows.correction.happyPath.join(">") ===
    "transactions>detail>edit-category>save>list-updated",
  model.flows.correction.happyPath.join(" → "),
  "flows",
);
check(
  "Scan recovery coverage",
  [
    "permission-denied",
    "offline",
    "upload-error",
    "quota",
    "validation",
    "save-error",
  ].every((state) => model.flows.scan.recovery.includes(state)),
  model.flows.scan.recovery.join(", "),
  "flows",
);
check(
  "Correction recovery coverage",
  ["save-error", "delete-confirmation"].every((state) =>
    model.flows.correction.recovery.includes(state),
  ),
  model.flows.correction.recovery.join(", "),
  "flows",
);

const allActions = model.states.flatMap((state) => state.actions);
for (const [label, options] of Object.entries({
  retry: ["retry"],
  back: ["back"],
  cancel: ["cancel-default"],
  manual: ["manual-entry"],
})) {
  check(
    `Recovery action modeled: ${label}`,
    options.some((option) => allActions.includes(option)),
    allActions.join(", "),
    "flows",
  );
}

check(
  "Destructive initial focus is Cancel",
  model.focus.destructiveDialog.initial === "cancel",
  model.focus.destructiveDialog.initial,
  "focus",
);
check(
  "Destructive focus trap specified",
  model.focus.destructiveDialog.trapped === true,
  model.focus.destructiveDialog.trapped,
  "focus",
);
check(
  "Escape closes destructive dialog",
  model.focus.destructiveDialog.escapeCloses === true,
  model.focus.destructiveDialog.escapeCloses,
  "focus",
);
check(
  "Focus returns to trigger",
  model.focus.destructiveDialog.returnsToTrigger === true,
  model.focus.destructiveDialog.returnsToTrigger,
  "focus",
);
check(
  "Success toast does not take focus",
  model.focus.successToastTakesFocus === false,
  model.focus.successToastTakesFocus,
  "focus",
);

check(
  "Motion tokens remain 120/180/260",
  model.motion.fast === 120 &&
    model.motion.base === 180 &&
    model.motion.slow === 260,
  `${model.motion.fast}/${model.motion.base}/${model.motion.slow}`,
  "motion",
);
check(
  "Async flow does not auto-advance",
  model.motion.asyncAutoAdvance === false &&
    !/\bsetTimeout\s*\(|\bsetInterval\s*\(/u.test(app),
  "No timer-driven state transition",
  "motion",
);
check(
  "Fake progress disabled",
  model.motion.fakeProgress === false,
  model.motion.fakeProgress,
  "ai-integrity",
);
check(
  "Reduced motion rule exists",
  /@media\s*\(prefers-reduced-motion:\s*reduce\)/u.test(css),
  "prefers-reduced-motion: reduce",
  "motion",
);
check(
  "Reduced motion removes transform duration",
  /transition-duration:\s*0\.01ms/iu.test(css) &&
    /animation-duration:\s*0\.01ms/iu.test(css),
  "0.01ms fallback",
  "motion",
);

check(
  "Prototype has aria-live announcement",
  /aria-live="polite"/u.test(html),
  "aria-live=polite",
  "prototype",
);
check(
  "Prototype has visible focus rule",
  /\.hotspot:focus-visible/u.test(css) &&
    /outline:\s*2px solid var\(--primary\)/u.test(css),
  "2px Mineral Blue focus",
  "prototype",
);
check(
  "Prototype hotspot minimum is 44px",
  /\.hotspot[\s\S]*?min-width:\s*44px[\s\S]*?min-height:\s*44px/u.test(css),
  "44x44 CSS minimum",
  "prototype",
);
check(
  "Prototype offers event simulator",
  /id="event-button"/u.test(html) &&
    /eventButton\.dataset\.target/u.test(app),
  "External async event control",
  "prototype",
);
check(
  "Prototype offers recovery controls",
  ["offline", "upload-error", "quota", "save-error", "destructive"].every(
    (state) => html.includes(`data-recovery="${state}"`),
  ),
  "5 recovery controls",
  "prototype",
);
check(
  "Prototype supports Escape",
  /event\.key === "Escape"/u.test(app),
  "Escape key handler",
  "prototype",
);
check(
  "Prototype traps Tab in destructive state",
  /event\.key === "Tab" && state\.node === "destructive"/u.test(app) &&
    /focusTargets\[nextIndex\]\.focus\(\)/u.test(app),
  "Tab cycles destructive hotspots",
  "prototype",
);
check(
  "Prototype restores focus after back or cancel",
  /function restoreFocus\(/u.test(app) &&
    /returnFocusElement/u.test(app) &&
    /returnFocusLabel/u.test(app),
  "Element or hotspot label focus restoration",
  "prototype",
);
check(
  "Prototype supports back navigation",
  /id="back-button"/u.test(html) && /state\.history\.pop/u.test(app),
  "History-backed control",
  "prototype",
);
check(
  "Prototype supports mobile and desktop",
  /data-viewport="mobile"/u.test(html) &&
    /data-viewport="desktop"/u.test(html),
  "Two viewport controls",
  "prototype",
);
check(
  "Prototype has no external runtime dependency",
  !/(?:src|href)="https?:\/\//iu.test(html),
  "No external URL in HTML",
  "prototype",
);
check(
  "Server guards project root",
  /requestedPath\.startsWith/u.test(server) && /response\.writeHead\(403\)/u.test(server),
  "Path containment check",
  "prototype",
);

const manualMobile = await fs.readFile(
  path.join(
    ROOT,
    "states",
    "mobile",
    "mobile-manual-entry-fallback-cp4-r0.svg",
  ),
  "utf8",
);
const manualDesktop = await fs.readFile(
  path.join(
    ROOT,
    "states",
    "desktop",
    "desktop-manual-entry-fallback-cp4-r0.svg",
  ),
  "utf8",
);
for (const [platform, svg] of [
  ["mobile", manualMobile],
  ["desktop", manualDesktop],
]) {
  check(
    `${platform} manual fallback has Manual label`,
    />MANUAL</u.test(svg),
    "MANUAL label",
    "manual-fallback",
  );
  check(
    `${platform} manual fallback removes AI source badge`,
    !/AI · Struk/u.test(svg),
    "No AI · Struk",
    "manual-fallback",
  );
  check(
    `${platform} manual fallback explains no AI result`,
    /Tidak ada hasil AI yang diterapkan/iu.test(svg),
    "Explicit no-AI copy",
    "manual-fallback",
  );
}

check(
  "Desktop upload and processing are separate assets",
  app.includes("desktop-scan-upload-ready-cp4-r0.png") &&
    app.includes("desktop-scan-processing-cp4-r0.png"),
  "Distinct runtime PNGs",
  "runtime-separation",
);
check(
  "Desktop prototype maps upload and processing correctly",
  /desktop:\s*\{[\s\S]*?scan:\s*\{[\s\S]*?upload:\s*\{[\s\S]*?image:\s*assets\.desktop\.upload[\s\S]*?processing:\s*\{[\s\S]*?image:\s*assets\.desktop\.processing/u.test(
    app,
  ),
  "Upload uses upload-ready; processing uses focused inspection",
  "runtime-separation",
);
check(
  "Desktop processing is contextual dark mode",
  /fill="#0B1220"/u.test(
    await fs.readFile(
      path.join(
        ROOT,
        "states",
        "desktop",
        "desktop-scan-processing-cp4-r0.svg",
      ),
      "utf8",
    ),
  ),
  "Midnight focused panel",
  "runtime-separation",
);

for (const [label, foreground, background, threshold] of [
  ["Primary button", "#FFFFFF", "#285A73", 4.5],
  ["Error text", "#B42318", "#FDE8E7", 4.5],
  ["Warning text", "#8A3C00", "#FFF1D6", 4.5],
  ["Success text", "#526827", "#EDF5D5", 4.5],
  ["Primary text", "#285A73", "#DCEAF0", 4.5],
]) {
  const ratio = contrast(foreground, background);
  check(
    `${label} contrast`,
    ratio >= threshold,
    `${ratio.toFixed(2)}:1`,
    "contrast",
  );
}

const report = {
  checkpoint: "CP4-R0",
  status: checks.every((item) => item.passed) ? "PASS" : "FAIL",
  summary: {
    total: checks.length,
    passed: checks.filter((item) => item.passed).length,
    failed: checks.filter((item) => !item.passed).length,
  },
  categories: Object.fromEntries(
    [...new Set(checks.map((item) => item.category))].map((category) => {
      const items = checks.filter((item) => item.category === category);
      return [
        category,
        {
          total: items.length,
          passed: items.filter((item) => item.passed).length,
          failed: items.filter((item) => !item.passed).length,
        },
      ];
    }),
  ),
  failures: checks.filter((item) => !item.passed),
  checks,
};

await fs.writeFile(
  path.join(REVIEW_DIR, "verification-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
  "utf8",
);

console.log(
  JSON.stringify(
    {
      status: report.status,
      total: report.summary.total,
      passed: report.summary.passed,
      failed: report.summary.failed,
      report: path.join(REVIEW_DIR, "verification-report.json"),
      failures: report.failures,
    },
    null,
    2,
  ),
);

if (report.status !== "PASS") {
  process.exitCode = 1;
}
