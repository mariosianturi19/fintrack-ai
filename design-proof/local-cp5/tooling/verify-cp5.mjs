import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const TOOLING_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(TOOLING_DIR, "..");
const DESIGN_PROOF = path.resolve(ROOT, "..");
const PROJECT_ROOT = path.resolve(DESIGN_PROOF, "..");
const REVIEW_DIR = path.join(ROOT, "review-notes");
const CP2_RUNTIME = path.join(DESIGN_PROOF, "local-cp2", "tooling-runtime");
const runtimeRequire = createRequire(path.join(CP2_RUNTIME, "package.json"));
const sharp = runtimeRequire("sharp");

const readJson = async (filePath) =>
  JSON.parse(await fs.readFile(filePath, "utf8"));
const readRootJson = async (relativePath) =>
  readJson(path.join(ROOT, relativePath));
const readRootText = async (relativePath) =>
  fs.readFile(path.join(ROOT, relativePath), "utf8");

const manifest = await readRootJson("manifest.json");
const tokens = await readRootJson("final-design-tokens.json");
const responsive = await readRootJson("responsive-contract.json");
const componentMatrix = await readRootJson("component-state-matrix.json");
const findings = await readRootJson("precision-findings.json");
const inventory = await readRootJson("asset-inventory.json");

const checks = [];
function check(name, passed, evidence, category = "general") {
  checks.push({
    name,
    category,
    passed: Boolean(passed),
    evidence: String(evidence),
  });
}

async function fileInfo(base, relativePath) {
  const absolutePath = path.resolve(base, relativePath);
  const relativeResolved = path.relative(base, absolutePath);
  const contained =
    relativeResolved !== "" &&
    !relativeResolved.startsWith(`..${path.sep}`) &&
    relativeResolved !== ".." &&
    !path.isAbsolute(relativeResolved);
  try {
    const stat = await fs.stat(absolutePath);
    return {
      absolutePath,
      contained,
      exists: stat.isFile(),
      bytes: stat.size,
    };
  } catch {
    return { absolutePath, contained, exists: false, bytes: 0 };
  }
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

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

check(
  "Checkpoint identity",
  manifest.checkpoint === "CP5" &&
    manifest.revision === "R0" &&
    manifest.status === "Final / Locked",
  `${manifest.checkpoint}-${manifest.revision}; ${manifest.status}`,
  "identity",
);
check(
  "Direction remains Quiet Signal Refined",
  /Quiet Signal/u.test(manifest.direction) && /Refined/u.test(manifest.direction),
  manifest.direction,
  "identity",
);
check(
  "Token identity matches checkpoint",
  tokens.meta?.project === "Fintrack AI" &&
    tokens.meta?.checkpoint === "CP5-R0" &&
    tokens.meta?.status === "Final / Locked",
  JSON.stringify(tokens.meta),
  "identity",
);
const cp5FinalLock = await readRootText("CP5_R0_FINAL_LOCK.md");
check(
  "CP5 final lock records owner confirmation",
  manifest.finalLock === "CP5_R0_FINAL_LOCK.md" &&
    /FINAL\s*\/\s*LOCKED/iu.test(cp5FinalLock) &&
    /Owner confirmation:\s*\*\*2026-07-29\*\*/iu.test(cp5FinalLock),
  `${manifest.finalLock}; owner confirmed 2026-07-29`,
  "identity",
);

const sourceReports = {
  cp2: {
    path: path.join(
      DESIGN_PROOF,
      "local-cp2",
      "review-notes",
      "verification-report.json",
    ),
    expected: 98,
  },
  cp3: {
    path: path.join(
      DESIGN_PROOF,
      "local-cp3",
      "review-notes",
      "verification-report.json",
    ),
    expected: 106,
  },
  cp4: {
    path: path.join(
      DESIGN_PROOF,
      "local-cp4",
      "review-notes",
      "verification-report.json",
    ),
    expected: 221,
  },
  logo: {
    path: path.join(
      DESIGN_PROOF,
      "logo-r1",
      "review-notes",
      "verification-report.json",
    ),
    expected: 236,
  },
};

let upstreamTotal = 0;
for (const [label, source] of Object.entries(sourceReports)) {
  const report = await readJson(source.path);
  const passed =
    report.status === "PASS" &&
    report.summary?.total === source.expected &&
    report.summary?.passed === source.expected &&
    report.summary?.failed === 0;
  check(
    `Upstream ${label.toUpperCase()} verification`,
    passed,
    `${report.summary?.passed}/${report.summary?.total}; ${report.status}`,
    "upstream",
  );
  upstreamTotal += report.summary?.passed ?? 0;
}
check(
  "Combined upstream verification is 661/661",
  upstreamTotal === 661 && manifest.upstreamVerification?.combined === "661/661",
  `${upstreamTotal}/661`,
  "upstream",
);

for (const [authority, relativePath] of Object.entries(
  manifest.sourceLocks ?? {},
)) {
  const normalizedPath = relativePath.replace(/^\.\.[/\\]/u, "");
  const info = await fileInfo(DESIGN_PROOF, normalizedPath);
  check(
    `Source lock contained and present: ${authority}`,
    info.contained && info.exists && info.bytes > 0,
    `${relativePath}; contained=${info.contained}; bytes=${info.bytes}`,
    "authority",
  );
  if (info.exists) {
    const content = await fs.readFile(info.absolutePath, "utf8");
    check(
      `Source lock is final: ${authority}`,
      /FINAL|Final/iu.test(content) && /LOCK|Locked/iu.test(content),
      relativePath,
      "authority",
    );
  }
}

check(
  "Four board pairs declared",
  manifest.boards?.length === 8,
  `${manifest.boards?.length ?? 0} files`,
  "inventory",
);
check(
  "One responsive proof pair declared",
  manifest.proofs?.length === 2,
  `${manifest.proofs?.length ?? 0} files`,
  "inventory",
);
check(
  "Six machine handoff files declared",
  manifest.machineHandoff?.length === 6,
  `${manifest.machineHandoff?.length ?? 0} files`,
  "inventory",
);
check(
  "Ten documentation files declared",
  manifest.documentation?.length === 10,
  `${manifest.documentation?.length ?? 0} files`,
  "inventory",
);
check(
  "Three preview files declared",
  manifest.preview?.length === 3,
  `${manifest.preview?.length ?? 0} files`,
  "inventory",
);

const requiredLocalFiles = [
  ...manifest.boards,
  ...manifest.proofs,
  ...manifest.machineHandoff,
  ...manifest.documentation,
  ...manifest.preview,
  "manifest.json",
  "tooling/generate-cp5.mjs",
  "tooling/verify-cp5.mjs",
];
for (const relativePath of requiredLocalFiles) {
  const info = await fileInfo(ROOT, relativePath);
  check(
    `Artifact present: ${relativePath}`,
    info.contained && info.exists && info.bytes > 0,
    `contained=${info.contained}; bytes=${info.bytes}`,
    "files",
  );
}

const expectedDimensions = {
  CP5_R0_QA_OVERVIEW: [1800, 1080],
  CP5_R0_PRECISION_CORRECTIONS: [1800, 1220],
  CP5_R0_ACCESSIBILITY_RESPONSIVE: [1800, 1160],
  CP5_R0_HANDOFF_MAP: [1800, 1080],
  "proof/compact-dashboard-1024-cp5-r0": [1024, 1024],
};
for (const [baseName, [expectedWidth, expectedHeight]] of Object.entries(
  expectedDimensions,
)) {
  for (const extension of ["svg", "png"]) {
    const metadata = await sharp(
      path.join(ROOT, `${baseName}.${extension}`),
    ).metadata();
    check(
      `${baseName} ${extension.toUpperCase()} dimensions`,
      metadata.width === expectedWidth && metadata.height === expectedHeight,
      `${metadata.width}x${metadata.height}`,
      "dimensions",
    );
  }
}

const svgFiles = [
  ...manifest.boards.filter((file) => file.endsWith(".svg")),
  ...manifest.proofs.filter((file) => file.endsWith(".svg")),
];
const forbiddenVisualPatterns = [
  ["gradient", /<(?:linear|radial)Gradient\b/iu],
  ["SVG filter", /<filter\b/iu],
  ["foreignObject", /<foreignObject\b/iu],
  ["glass blur", /backdrop-filter|feGaussianBlur/iu],
];
for (const relativePath of svgFiles) {
  const svg = await readRootText(relativePath);
  for (const [label, pattern] of forbiddenVisualPatterns) {
    check(
      `${relativePath} avoids ${label}`,
      !pattern.test(svg),
      pattern.test(svg) ? `Found ${label}` : "Not found",
      "visual-guardrails",
    );
  }
  check(
    `${relativePath} embeds approved type families`,
    /Space Grotesk/u.test(svg) && /IBM Plex Sans/u.test(svg),
    "Space Grotesk + IBM Plex Sans",
    "visual-guardrails",
  );
}

const expectedColors = {
  canvas: "#F6F2E8",
  surface: "#FFFFFF",
  ink: "#0B1220",
  primary: "#285A73",
  signal: "#B9D86E",
  expense: "#D96C52",
  error: "#B42318",
};
for (const [name, value] of Object.entries(expectedColors)) {
  check(
    `Core color token: ${name}`,
    tokens.color?.[name] === value,
    tokens.color?.[name],
    "tokens",
  );
}
check(
  "Typography families remain locked",
  tokens.typography?.displayFamily === "Space Grotesk" &&
    tokens.typography?.bodyFamily === "IBM Plex Sans",
  `${tokens.typography?.displayFamily}; ${tokens.typography?.bodyFamily}`,
  "tokens",
);
check(
  "Runtime critical metadata floor is 12px",
  tokens.typography?.runtimeFloor?.criticalMetadata === 12,
  `${tokens.typography?.runtimeFloor?.criticalMetadata}px`,
  "tokens",
);
check(
  "Runtime navigation label floor is 11px",
  tokens.typography?.runtimeFloor?.navigationLabel === 11,
  `${tokens.typography?.runtimeFloor?.navigationLabel}px`,
  "tokens",
);
check(
  "Desktop sidebar authority is 240px",
  tokens.layout?.sidebar?.desktop === 240 &&
    tokens.logo?.sidebarWidthAuthority === 240,
  `${tokens.layout?.sidebar?.desktop}px`,
  "tokens",
);
check(
  "Compact rail authority is 72px",
  tokens.layout?.sidebar?.compact === 72,
  `${tokens.layout?.sidebar?.compact}px`,
  "tokens",
);
check(
  "Minimum touch target is 44px",
  tokens.component?.minimumTouchTarget === 44,
  `${tokens.component?.minimumTouchTarget}px`,
  "tokens",
);
check(
  "Offline badge minimum is 128px",
  tokens.component?.offlineCachedBadgeMinimumWidth === 128,
  `${tokens.component?.offlineCachedBadgeMinimumWidth}px`,
  "tokens",
);
check(
  "Weekly column minimum is 176px",
  tokens.component?.dashboardWeeklyColumnMinimum === 176,
  `${tokens.component?.dashboardWeeklyColumnMinimum}px`,
  "tokens",
);
check(
  "Installed PWA logo validation remains pending",
  /pending/iu.test(tokens.logo?.productionStatus ?? ""),
  tokens.logo?.productionStatus,
  "honesty",
);

const cssTokens = await readRootText("final-design-tokens.css");
for (const [label, pattern] of [
  ["global border-box", /box-sizing:\s*border-box/iu],
  ["flex/grid min-width helper", /min-width:\s*0/iu],
  ["intrinsic offline badge", /\.ft-status-badge--offline/iu],
  ["128px offline badge", /min-inline-size:\s*var\(--ft-badge-offline-min,\s*128px\)/iu],
  ["reduced motion", /prefers-reduced-motion:\s*reduce/iu],
  ["visible focus ring", /focus-visible/iu],
]) {
  check(
    `CSS contract: ${label}`,
    pattern.test(cssTokens),
    pattern.test(cssTokens) ? "Present" : "Missing",
    "tokens",
  );
}

const expectedWidths = [360, 390, 768, 1024, 1280, 1440];
const actualWidths = responsive.modes?.map((mode) => mode.width) ?? [];
check(
  "Responsive proof widths are exact",
  JSON.stringify(actualWidths) === JSON.stringify(expectedWidths),
  actualWidths.join(", "),
  "responsive",
);
check(
  "Navigation mode never combines bottom bar and side navigation",
  responsive.modes?.every(
    (mode) => !String(mode.navigation).includes("+"),
  ),
  responsive.modes?.map((mode) => `${mode.width}:${mode.navigation}`).join("; "),
  "responsive",
);
const compactMode = responsive.modes?.find((mode) => mode.width === 1024);
check(
  "1024 mode uses compact 72px rail and 24px padding",
  compactMode?.navigation === "compact-rail" &&
    compactMode?.navigationWidth === 72 &&
    compactMode?.padding === 24,
  JSON.stringify(compactMode),
  "responsive",
);
check(
  "1280 and 1440 use 240px sidebar",
  [1280, 1440].every(
    (width) =>
      responsive.modes?.find((mode) => mode.width === width)
        ?.navigationWidth === 240,
  ),
  responsive.modes
    ?.filter((mode) => [1280, 1440].includes(mode.width))
    .map((mode) => `${mode.width}:${mode.navigationWidth}`)
    .join("; "),
  "responsive",
);
check(
  "Overflow contract stacks before shrinking text",
  responsive.overflowContract?.criticalLabelEllipsis === false &&
    responsive.overflowContract?.stackWhenMinimumUnavailable === true &&
    responsive.overflowContract?.flexGridChildMinWidth === 0,
  JSON.stringify(responsive.overflowContract),
  "responsive",
);

const expectedSummary = { P0: 0, P1: 0, P2: 2, P3: 5, pending: 2 };
check(
  "Finding counts match the audited inventory",
  JSON.stringify(findings.summary) === JSON.stringify(expectedSummary) &&
    JSON.stringify(manifest.findings) === JSON.stringify(expectedSummary),
  JSON.stringify(findings.summary),
  "findings",
);
const findingIds = findings.findings?.map((finding) => finding.id) ?? [];
for (const id of [
  "FT-PREC-001",
  "FT-PREC-002",
  "FT-PREC-003",
  "FT-PREC-004",
  "FT-PREC-005",
  "FT-PREC-006",
  "FT-PREC-007",
  "FT-VAL-001",
  "FT-VAL-002",
]) {
  check(
    `Finding recorded: ${id}`,
    findingIds.includes(id),
    findingIds.join(", "),
    "findings",
  );
}
check(
  "Both P2 corrections remain explicit implementation obligations",
  findings.findings
    ?.filter((finding) => finding.severity === "P2")
    .every(
      (finding) =>
        finding.status === "specified" &&
        finding.implementationPending === true,
    ),
  JSON.stringify(
    findings.findings?.filter((finding) => finding.severity === "P2"),
  ),
  "findings",
);
check(
  "Both external validations remain not verified",
  findings.findings
    ?.filter((finding) => finding.severity === "pending")
    .every((finding) => finding.status === "not-verified"),
  JSON.stringify(
    findings.findings?.filter((finding) => finding.severity === "pending"),
  ),
  "honesty",
);
check(
  "Manifest states all external validation limits",
  manifest.externalValidation?.installedPwaPhysicalDevice === "not verified" &&
    manifest.externalValidation?.betaUsers === "not performed" &&
    manifest.externalValidation?.runtimeAccessibility ===
      "implementation required",
  JSON.stringify(manifest.externalValidation),
  "honesty",
);

const requiredComponents = [
  "button",
  "field",
  "badge",
  "transactionRow",
  "dialog",
  "asyncRegion",
];
for (const component of requiredComponents) {
  check(
    `Component contract present: ${component}`,
    Boolean(componentMatrix.components?.[component]),
    component,
    "components",
  );
}
check(
  "Async region covers required states",
  ["loading", "empty", "offline", "error", "quota", "review", "success"].every(
    (state) => componentMatrix.components?.asyncRegion?.states?.includes(state),
  ),
  componentMatrix.components?.asyncRegion?.states?.join(", "),
  "components",
);
check(
  "Async region prohibits timer-driven fake progress",
  componentMatrix.components?.asyncRegion?.timerDrivenFakeProgress === false,
  componentMatrix.components?.asyncRegion?.timerDrivenFakeProgress,
  "components",
);
check(
  "Dialog contract includes keyboard safety",
  [
    "initial-focus-safe-action",
    "focus-trap",
    "escape",
    "focus-return",
  ].every((item) =>
    componentMatrix.components?.dialog?.keyboard?.includes(item),
  ),
  componentMatrix.components?.dialog?.keyboard?.join(", "),
  "components",
);
check(
  "Status badge is not color-only",
  componentMatrix.components?.badge?.colorOnly === false,
  componentMatrix.components?.badge?.colorOnly,
  "components",
);

for (const [label, foreground, background, threshold] of [
  ["Ink on canvas", tokens.color.ink, tokens.color.canvas, 4.5],
  ["Secondary ink on canvas", tokens.color.inkSecondary, tokens.color.canvas, 4.5],
  ["Primary on surface", tokens.color.primary, tokens.color.surface, 4.5],
  ["Expense ink on surface", tokens.color.expenseInk, tokens.color.surface, 4.5],
  ["Error on error soft", tokens.color.error, tokens.color.errorSoft, 4.5],
  ["Warning ink on warning soft", tokens.color.warningInk, tokens.color.warningSoft, 4.5],
  ["Signal ink on signal soft", tokens.color.signalInk, tokens.color.signalSoft, 4.5],
  ["Surface on ink", tokens.color.surface, tokens.color.ink, 4.5],
]) {
  const ratio = contrast(foreground, background);
  check(
    `WCAG AA: ${label}`,
    ratio >= threshold,
    `${ratio.toFixed(2)}:1`,
    "contrast",
  );
}

check(
  "Authority inventory count matches array",
  inventory.authorityFileCount === 123 &&
    inventory.files?.length === inventory.authorityFileCount,
  `${inventory.files?.length}/${inventory.authorityFileCount}`,
  "integrity",
);
const inventoryPaths = inventory.files?.map((entry) => entry.path) ?? [];
check(
  "Authority inventory has no duplicate paths",
  new Set(inventoryPaths).size === inventoryPaths.length,
  `${inventoryPaths.length} paths; ${new Set(inventoryPaths).size} unique`,
  "integrity",
);
for (const entry of inventory.files ?? []) {
  const info = await fileInfo(PROJECT_ROOT, entry.path);
  let actualHash = "";
  if (info.exists) {
    actualHash = sha256(await fs.readFile(info.absolutePath));
  }
  check(
    `Authority hash: ${entry.path}`,
    info.contained &&
      info.exists &&
      info.bytes === entry.bytes &&
      actualHash === entry.sha256,
    `contained=${info.contained}; bytes=${info.bytes}/${entry.bytes}; hash=${actualHash === entry.sha256}`,
    "integrity",
  );
}

const docs = Object.fromEntries(
  await Promise.all(
    manifest.documentation.map(async (relativePath) => [
      relativePath,
      await readRootText(relativePath),
    ]),
  ),
);
const allDocumentation = Object.values(docs).join("\n");
for (const id of findingIds) {
  check(
    `Finding is traceable in documentation: ${id}`,
    allDocumentation.includes(id),
    id,
    "traceability",
  );
}
for (const phrase of [
  "minmax(176px, 0.36fr)",
  "128px",
  "16px",
  "240px",
  "1024",
  "runtime",
]) {
  check(
    `Implementation contract documented: ${phrase}`,
    allDocumentation.includes(phrase),
    phrase,
    "traceability",
  );
}
check(
  "Design-system delta is approved and applied",
  /APPLIED|diterapkan/iu.test(docs["CP5_R0_DESIGN_SYSTEM_DELTA.md"]) &&
    /DESIGN_SYSTEM\.md.*1\.2/isu.test(
      docs["CP5_R0_DESIGN_SYSTEM_DELTA.md"],
    ),
  "Delta applied to DESIGN_SYSTEM.md v1.2",
  "authority",
);
const designSystem = await fs.readFile(
  path.join(PROJECT_ROOT, "DESIGN_SYSTEM.md"),
  "utf8",
);
check(
  "Design system records CP5 final and version 1.2",
  /CP5-R0 final\s*\/\s*locked/iu.test(designSystem) &&
    /Versi dokumen:\*\*\s*1\.2/iu.test(designSystem) &&
    /CP5-Validated Implementation Contracts/iu.test(designSystem),
  "CP5 final; v1.2; contracts present",
  "authority",
);
check(
  "Handoff documentation does not claim production completion",
  /implementation pending|wajib.*implementasi|belum diimplementasikan|bukan bukti bahwa\s+aplikasi sudah diimplementasikan/iu.test(
    docs["CP5_R0_IMPLEMENTATION_HANDOFF.md"],
  ),
  "Implementation remains a future stage",
  "honesty",
);

const previewHtml = await readRootText("preview/index.html");
const previewCss = await readRootText("preview/styles.css");
check(
  "Preview displays final status",
  /FINAL\s*\/\s*LOCKED/iu.test(previewHtml),
  "FINAL / LOCKED",
  "preview",
);
const localReferences = [
  ...previewHtml.matchAll(/(?:src|href)="([^"]+)"/gu),
]
  .map((match) => match[1])
  .filter(
    (reference) =>
      !reference.startsWith("#") &&
      !reference.startsWith("http://") &&
      !reference.startsWith("https://"),
  );
for (const reference of localReferences) {
  const absoluteReference = path.resolve(path.join(ROOT, "preview"), reference);
  const normalizedReference = path.relative(ROOT, absoluteReference);
  const info = await fileInfo(ROOT, normalizedReference);
  check(
    `Preview reference resolves: ${reference}`,
    info.contained && info.exists && info.bytes > 0,
    `contained=${info.contained}; bytes=${info.bytes}`,
    "preview",
  );
}
check(
  "Preview uses responsive image layout",
  /flex-wrap:\s*wrap/iu.test(previewCss) &&
    /max-width:\s*100%/iu.test(previewCss) &&
    /@media/iu.test(previewCss),
  "Wrapped navigation, fluid images, and media query",
  "preview",
);
check(
  "Preview is dependency-free",
  !/(?:src|href)="https?:\/\//iu.test(previewHtml),
  "No external runtime references",
  "preview",
);

const report = {
  project: "Fintrack AI",
  checkpoint: "CP5-R0",
  generatedAt: new Date().toISOString(),
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
  acknowledgedLimits: {
    installedPwaPhysicalDevice: "not verified",
    betaUsers: "not performed",
    runtimeAccessibility: "implementation required",
  },
  failures: checks.filter((item) => !item.passed),
  checks,
};

await fs.mkdir(REVIEW_DIR, { recursive: true });
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
