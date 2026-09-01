import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require("sharp");
const TOOLING_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(TOOLING_DIR, "..");
const PROJECT_ROOT = path.resolve(ROOT, "..", "..");
const LOGO_R0_ROOT = path.join(PROJECT_ROOT, "design-proof", "logo-r0");
const FONT_PATH = path.join(
  LOGO_R0_ROOT,
  "assets",
  "fonts",
  "SpaceGrotesk-Variable.ttf",
);
const OPENTYPE_PATH = path.join(
  ROOT,
  "tooling-runtime",
  "node_modules",
  "opentype.js",
  "dist",
  "opentype.js",
);
const opentype = require(OPENTYPE_PATH);

const MARKS_DIR = path.join(ROOT, "assets", "marks");
const LOCKUPS_DIR = path.join(ROOT, "assets", "lockups");
const APP_ICONS_DIR = path.join(ROOT, "assets", "app-icons");
const TESTS_DIR = path.join(ROOT, "tests");

const INK = "#0B1220";
const PAPER = "#F6F2E8";
const WHITE = "#FFFFFF";
const PRIMARY = "#285A73";
const MUTED = "#53606C";
const BORDER = "#D8D3C8";
const GUIDE = "#9AA4B2";
const PASS = "#285A73";
const FAIL = "#A55C35";
const SOFT = "#FCFBF7";
const LOCKUP_WIDTH = 492;
const LOCKUP_HEIGHT = 72;

await Promise.all([
  fs.mkdir(MARKS_DIR, { recursive: true }),
  fs.mkdir(LOCKUPS_DIR, { recursive: true }),
  fs.mkdir(APP_ICONS_DIR, { recursive: true }),
  fs.mkdir(TESTS_DIR, { recursive: true }),
]);

const fontBuffer = await fs.readFile(FONT_PATH);
const fontArrayBuffer = fontBuffer.buffer.slice(
  fontBuffer.byteOffset,
  fontBuffer.byteOffset + fontBuffer.byteLength,
);
const font = opentype.parse(fontArrayBuffer);
font.variation.set({ wght: 600 });
const fontBase64 = fontBuffer.toString("base64");

const embeddedFont = `
  @font-face {
    font-family: "Space Grotesk";
    src: url(data:font/ttf;base64,${fontBase64}) format("truetype");
    font-style: normal;
    font-weight: 300 700;
  }
`;

function svgDocument({ width, height, body, background, includeFont = false }) {
  const backgroundNode = background
    ? `<rect width="${width}" height="${height}" fill="${background}"/>`
    : "";
  const style = includeFont
    ? `<style>
      ${embeddedFont}
      .display { font-family: "Space Grotesk", sans-serif; font-weight: 600; letter-spacing: -0.035em; }
      .title { font-family: "Space Grotesk", sans-serif; font-weight: 600; letter-spacing: -0.025em; }
      .body { font-family: "Space Grotesk", sans-serif; font-weight: 450; }
      .label { font-family: "Space Grotesk", sans-serif; font-weight: 600; letter-spacing: 0.12em; }
    </style>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${style}
  ${backgroundNode}
  ${body}
</svg>`;
}

function outlinedText(text, x, baseline, size, color = INK) {
  const textPath = font.getPath(text, x, baseline, size, {
    kerning: true,
    hinting: false,
  });
  const bounds = textPath.getBoundingBox();
  const flipAxis = Number((bounds.y1 + bounds.y2).toFixed(2));
  return `<path d="${textPath.toPathData({ decimalPlaces: 2 })}" fill="${color}"
    transform="translate(0 ${flipAxis}) scale(1 -1)"/>`;
}

function masterMark(x, y, size, color = INK) {
  const scale = size / 160;
  return `
  <g transform="translate(${x} ${y}) scale(${scale})" color="${color}" fill="none"
     stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <path d="M43 126V34H104" stroke-width="17"/>
    <path d="M43 78H94" stroke-width="17"/>
    <path d="M117 34H130V55" stroke-width="12.5"/>
    <path d="M130 105V126H109" stroke-width="12.5"/>
  </g>`;
}

function microMark(x, y, size, color = INK) {
  const scale = size / 160;
  return `
  <g transform="translate(${x} ${y}) scale(${scale})" color="${color}" fill="none"
     stroke="currentColor" stroke-linecap="square" stroke-linejoin="round">
    <path d="M40 126V34H105" stroke-width="20"/>
    <path d="M40 78H96" stroke-width="20"/>
    <path d="M117 34H130V57" stroke-width="14"/>
    <path d="M130 103V126H107" stroke-width="14"/>
  </g>`;
}

function originalMark(x, y, size, color = INK) {
  const scale = size / 160;
  return `
  <g transform="translate(${x} ${y}) scale(${scale})" color="${color}" fill="none"
     stroke="currentColor" stroke-width="18" stroke-linecap="round" stroke-linejoin="round">
    <path d="M42 126V34H106"/>
    <path d="M42 78H96"/>
    <path d="M118 34H130V54"/>
    <path d="M130 106V126H110"/>
  </g>`;
}

function precisionMark(x, y, size, color = INK) {
  const scale = size / 160;
  return `
  <g transform="translate(${x} ${y}) scale(${scale})" color="${color}" fill="none"
     stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <path d="M43 126V34H104" stroke-width="16"/>
    <path d="M43 78H93" stroke-width="16"/>
    <path d="M118 34H130V55" stroke-width="10.5"/>
    <path d="M130 105V126H110" stroke-width="10.5"/>
  </g>`;
}

function lockup(
  x,
  y,
  width,
  { markColor = PRIMARY, wordColor = INK, useMicro = false } = {},
) {
  const scale = width / LOCKUP_WIDTH;
  const mark = useMicro ? microMark : masterMark;
  return `
  <g transform="translate(${x} ${y}) scale(${scale})">
    ${mark(-20, -14, 96, markColor)}
    ${outlinedText("Fintrack AI", 76, 65, 82, wordColor)}
  </g>`;
}

function markAssetSvg(markFn, color) {
  return svgDocument({
    width: 160,
    height: 160,
    body: markFn(0, 0, 160, color),
  });
}

function lockupAssetSvg(options) {
  return svgDocument({
    width: LOCKUP_WIDTH,
    height: LOCKUP_HEIGHT,
    body: lockup(0, 0, LOCKUP_WIDTH, options),
  });
}

function appIconSvg(size, { maskable = false } = {}) {
  const markSize = maskable ? size * 0.7 : size * 0.66;
  const markX = (size - markSize) / 2;
  const markY = (size - markSize) / 2;
  return svgDocument({
    width: size,
    height: size,
    background: PAPER,
    body: masterMark(markX, markY, markSize, PRIMARY),
  });
}

function multilineText(
  lines,
  x,
  y,
  { size = 20, fill = MUTED, lineHeight = 28, klass = "body" } = {},
) {
  const tspans = lines
    .map(
      (line, index) =>
        `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${line}</tspan>`,
    )
    .join("");
  return `<text x="${x}" y="${y}" fill="${fill}" class="${klass}" font-size="${size}">${tspans}</text>`;
}

function opticalVariantCard({
  x,
  label,
  title,
  markFn,
  note,
  selected = false,
}) {
  const badge = selected
    ? `<rect x="${x + 314}" y="650" width="142" height="32" rx="16" fill="${PASS}"/>
       <text x="${x + 385}" y="672" text-anchor="middle" fill="${WHITE}" class="label" font-size="10">SELECTED MASTER</text>`
    : "";
  return `
    <rect x="${x}" y="624" width="480" height="438" rx="26" fill="${WHITE}" stroke="${BORDER}"/>
    ${badge}
    <text x="${x + 38}" y="674" fill="${MUTED}" class="label" font-size="14">${label}</text>
    <text x="${x + 38}" y="716" fill="${INK}" class="title" font-size="28">${title}</text>
    ${markFn(x + 156, 748, 168, INK)}
    <text x="${x + 38}" y="982" fill="${INK}" class="title" font-size="18">${note}</text>
    <text x="${x + 38}" y="1022" fill="${MUTED}" class="body" font-size="16">
      Main / corner stroke diuji dalam monochrome.
    </text>
  `;
}

function masterSheetSvg() {
  return svgDocument({
    width: 1800,
    height: 1160,
    background: PAPER,
    includeFont: true,
    body: `
      <text x="80" y="76" fill="${MUTED}" class="label" font-size="17">FINTRACK AI · LOGO-R1</text>
      <text x="80" y="138" fill="${INK}" class="display" font-size="54">Baseline A — Refined Lockup</text>
      <text x="1720" y="124" text-anchor="end" fill="${MUTED}" class="body" font-size="20">Provisional system for CP2–CP4</text>

      <rect x="80" y="194" width="520" height="370" rx="28" fill="${WHITE}" stroke="${BORDER}"/>
      <text x="120" y="244" fill="${MUTED}" class="label" font-size="14">MASTER MARK</text>
      ${masterMark(220, 286, 240, PRIMARY)}

      <rect x="640" y="194" width="1080" height="370" rx="28" fill="${WHITE}" stroke="${BORDER}"/>
      <text x="686" y="244" fill="${MUTED}" class="label" font-size="14">PRIMARY LOCKUP</text>
      ${lockup(710, 304, 820, { markColor: PRIMARY, wordColor: INK })}
      <text x="686" y="510" fill="${MUTED}" class="body" font-size="17">
        Mineral Blue mark · Midnight outlined wordmark · Space Grotesk 600
      </text>

      ${opticalVariantCard({
        x: 80,
        label: "O1 · BASELINE",
        title: "Original weight",
        markFn: originalMark,
        note: "18 / 18 — scan frame terlalu dominan",
      })}
      ${opticalVariantCard({
        x: 660,
        label: "O2 · REFINED",
        title: "Balanced hierarchy",
        markFn: masterMark,
        note: "17 / 12.5 — product cue tetap terbaca",
        selected: true,
      })}
      ${opticalVariantCard({
        x: 1240,
        label: "O3 · PRECISION",
        title: "Lighter corners",
        markFn: precisionMark,
        note: "16 / 10.5 — terlalu tipis pada 20–24 px",
      })}
    `,
  });
}

function colorPanel(x, y, width, height, background, markColor, wordColor, label) {
  return `
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="24" fill="${background}" stroke="${background === WHITE ? BORDER : background}"/>
    <text x="${x + 34}" y="${y + 46}" fill="${wordColor}" class="label" font-size="13">${label}</text>
    ${lockup(x + 30, y + 76, width - 60, { markColor, wordColor })}
  `;
}

function usageSheetSvg() {
  const clearX = 17;
  const boxX = 170;
  const boxY = 230;
  const markSize = 220;
  const clearScale = markSize / 160;
  const margin = clearX * clearScale;
  return svgDocument({
    width: 1800,
    height: 1260,
    background: PAPER,
    includeFont: true,
    body: `
      <text x="80" y="76" fill="${MUTED}" class="label" font-size="17">LOGO-R1 · USAGE RULES</text>
      <text x="80" y="136" fill="${INK}" class="display" font-size="52">Color, clear space, and minimum size</text>

      ${colorPanel(80, 190, 520, 250, PAPER, PRIMARY, INK, "PRIMARY · RICE PAPER")}
      ${colorPanel(640, 190, 520, 250, INK, PAPER, PAPER, "REVERSE · MIDNIGHT")}
      ${colorPanel(1200, 190, 520, 250, WHITE, INK, INK, "MONOCHROME · WHITE")}

      <rect x="80" y="490" width="760" height="680" rx="28" fill="${WHITE}" stroke="${BORDER}"/>
      <text x="124" y="544" fill="${MUTED}" class="label" font-size="14">CLEAR SPACE</text>
      <rect x="${boxX - margin}" y="${boxY + 360 - margin}" width="${markSize + margin * 2}" height="${markSize + margin * 2}"
        fill="none" stroke="${PRIMARY}" stroke-width="2" stroke-dasharray="8 8"/>
      ${masterMark(boxX, boxY + 360, markSize, INK)}
      <line x1="${boxX - margin}" y1="${boxY + 625}" x2="${boxX}" y2="${boxY + 625}" stroke="${PRIMARY}" stroke-width="2"/>
      <text x="${boxX - margin / 2}" y="${boxY + 652}" text-anchor="middle" fill="${PRIMARY}" class="title" font-size="18">x</text>
      ${multilineText(
        [
          "x = ketebalan vertical stem master mark.",
          "Minimum clear space: 1x pada setiap sisi.",
          "Jangan memasukkan text, icon, atau edge ke area ini.",
        ],
        124,
        940,
        { size: 18, lineHeight: 30 },
      )}

      <rect x="880" y="490" width="840" height="680" rx="28" fill="${WHITE}" stroke="${BORDER}"/>
      <text x="924" y="544" fill="${MUTED}" class="label" font-size="14">MINIMUM DIGITAL SIZE</text>
      <text x="924" y="610" fill="${INK}" class="title" font-size="24">Standalone mark</text>
      ${microMark(930, 644, 16, INK)}
      ${microMark(1000, 640, 20, INK)}
      ${masterMark(1080, 636, 24, INK)}
      <text x="930" y="704" fill="${MUTED}" class="body" font-size="15">16 micro</text>
      <text x="1000" y="704" fill="${MUTED}" class="body" font-size="15">20 micro</text>
      <text x="1080" y="704" fill="${MUTED}" class="body" font-size="15">24 master</text>

      <text x="924" y="774" fill="${INK}" class="title" font-size="24">Horizontal lockup</text>
      ${lockup(924, 812, 510, { markColor: PRIMARY, wordColor: INK })}
      <text x="924" y="960" fill="${MUTED}" class="body" font-size="17">Minimum: 24 px high / approximately 164 px wide.</text>
      <text x="924" y="996" fill="${MUTED}" class="body" font-size="17">Recommended interface use: 28–32 px high.</text>

      <text x="924" y="1064" fill="${INK}" class="title" font-size="20">Do not</text>
      ${multilineText(
        [
          "Stretch, rotate, add shadow, or recolor with Signal Leaf.",
          "Use the master mark below 24 px.",
          "Place the primary lockup on low-contrast imagery.",
        ],
        924,
        1100,
        { size: 16, lineHeight: 27 },
      )}
    `,
  });
}

function sizeSample(markFn, size, x, y, label) {
  return `
    ${markFn(x, y - size, size, INK)}
    <text x="${x + size / 2}" y="${y + 26}" text-anchor="middle" fill="${MUTED}" class="body" font-size="15">${label}</text>`;
}

function smallSizeSheetSvg() {
  const sizes = [16, 20, 24, 32, 48, 64];
  let cursorMaster = 100;
  let cursorMicro = 100;
  const masterSamples = sizes
    .map((size) => {
      const node = sizeSample(masterMark, size, cursorMaster, 300, `${size}px`);
      cursorMaster += size + 76;
      return node;
    })
    .join("");
  const microSamples = sizes
    .map((size) => {
      const node = sizeSample(microMark, size, cursorMicro, 510, `${size}px`);
      cursorMicro += size + 76;
      return node;
    })
    .join("");

  return svgDocument({
    width: 1500,
    height: 900,
    background: PAPER,
    includeFont: true,
    body: `
      <text x="80" y="72" fill="${MUTED}" class="label" font-size="17">LOGO-R1 · OPTICAL SIZE TEST</text>
      <text x="80" y="130" fill="${INK}" class="display" font-size="48">Master versus micro mark</text>

      <rect x="80" y="184" width="1340" height="190" rx="24" fill="${WHITE}" stroke="${BORDER}"/>
      <text x="100" y="226" fill="${INK}" class="title" font-size="22">Master mark · default from 24 px</text>
      ${masterSamples}

      <rect x="80" y="402" width="1340" height="190" rx="24" fill="${WHITE}" stroke="${BORDER}"/>
      <text x="100" y="444" fill="${INK}" class="title" font-size="22">Micro mark · optimized for 16–23 px</text>
      ${microSamples}

      <rect x="80" y="632" width="1340" height="190" rx="24" fill="${INK}"/>
      <text x="110" y="676" fill="${PAPER}" class="label" font-size="14">REVERSE LOCKUP · ACTUAL HEIGHTS</text>
      ${lockup(110, 704, 164, { markColor: PAPER, wordColor: PAPER, useMicro: true })}
      ${lockup(360, 696, 219, { markColor: PAPER, wordColor: PAPER })}
      ${lockup(690, 680, 328, { markColor: PAPER, wordColor: PAPER })}
      <text x="110" y="794" fill="${PAPER}" class="body" font-size="15">24 px high</text>
      <text x="360" y="794" fill="${PAPER}" class="body" font-size="15">32 px high</text>
      <text x="690" y="794" fill="${PAPER}" class="body" font-size="15">48 px high</text>
    `,
  });
}

function contextTestsSvg() {
  return svgDocument({
    width: 1800,
    height: 1080,
    background: PAPER,
    includeFont: true,
    body: `
      <text x="80" y="72" fill="${MUTED}" class="label" font-size="17">LOGO-R1 · INTERFACE CONTEXT TESTS</text>
      <text x="80" y="132" fill="${INK}" class="display" font-size="50">Mobile, desktop, and PWA presence</text>

      <rect x="80" y="190" width="480" height="760" rx="40" fill="${SOFT}" stroke="${BORDER}" stroke-width="3"/>
      <rect x="80" y="190" width="480" height="118" rx="40" fill="${PAPER}"/>
      <rect x="80" y="268" width="480" height="40" fill="${PAPER}"/>
      ${lockup(116, 206, 250, { markColor: PRIMARY, wordColor: INK })}
      <circle cx="508" cy="248" r="22" fill="${PRIMARY}"/>
      <text x="116" y="380" fill="${INK}" class="title" font-size="26">Ringkasan bulan ini</text>
      <rect x="116" y="420" width="408" height="180" rx="24" fill="${WHITE}" stroke="${BORDER}"/>
      <text x="144" y="468" fill="${MUTED}" class="body" font-size="17">Total pengeluaran</text>
      <text x="144" y="530" fill="${INK}" class="display" font-size="38">Rp3.482.500</text>
      <text x="116" y="912" fill="${MUTED}" class="body" font-size="16">390 px mobile app bar</text>

      <rect x="620" y="190" width="520" height="760" rx="28" fill="${WHITE}" stroke="${BORDER}"/>
      <rect x="620" y="190" width="270" height="760" rx="28" fill="${PAPER}"/>
      <rect x="864" y="190" width="26" height="760" fill="${PAPER}"/>
      ${lockup(654, 218, 202, { markColor: PRIMARY, wordColor: INK })}
      <rect x="650" y="342" width="210" height="50" rx="12" fill="#DCEAF0"/>
      <circle cx="682" cy="367" r="8" fill="${PRIMARY}"/>
      <text x="708" y="374" fill="${INK}" class="body" font-size="17">Dashboard</text>
      <text x="656" y="452" fill="${MUTED}" class="body" font-size="17">Transaksi</text>
      <text x="656" y="512" fill="${MUTED}" class="body" font-size="17">Scan struk</text>
      <text x="656" y="912" fill="${MUTED}" class="body" font-size="16">280 px desktop sidebar</text>

      <rect x="1200" y="190" width="520" height="760" rx="28" fill="${WHITE}" stroke="${BORDER}"/>
      <text x="1240" y="242" fill="${MUTED}" class="label" font-size="14">PWA ICON</text>
      <rect x="1270" y="292" width="380" height="380" rx="86" fill="${PAPER}"/>
      ${masterMark(1327, 349, 266, PRIMARY)}
      <circle cx="1460" cy="482" r="152" fill="none" stroke="${GUIDE}" stroke-width="2" stroke-dasharray="8 8"/>
      <text x="1460" y="716" text-anchor="middle" fill="${MUTED}" class="body" font-size="16">Maskable safe zone preview</text>
      <text x="1240" y="784" fill="${INK}" class="title" font-size="22">Important geometry stays inside</text>
      <text x="1240" y="820" fill="${MUTED}" class="body" font-size="17">central 80% diameter safe zone.</text>
      <text x="1240" y="912" fill="${MUTED}" class="body" font-size="16">192 / 512 px export set</text>
    `,
  });
}

function pwaSheetSvg() {
  return svgDocument({
    width: 1500,
    height: 900,
    background: PAPER,
    includeFont: true,
    body: `
      <text x="80" y="72" fill="${MUTED}" class="label" font-size="17">LOGO-R1 · PWA SAFE-ZONE TEST</text>
      <text x="80" y="132" fill="${INK}" class="display" font-size="48">Maskable and standard icon exports</text>

      <rect x="80" y="190" width="620" height="620" rx="30" fill="${WHITE}" stroke="${BORDER}"/>
      <rect x="170" y="280" width="440" height="440" fill="${PAPER}"/>
      ${masterMark(236, 346, 308, PRIMARY)}
      <circle cx="390" cy="500" r="176" fill="none" stroke="${PRIMARY}" stroke-width="3" stroke-dasharray="9 9"/>
      <text x="390" y="774" text-anchor="middle" fill="${MUTED}" class="body" font-size="17">MASKABLE · safe-zone radius 40%</text>

      <rect x="800" y="190" width="620" height="620" rx="30" fill="${WHITE}" stroke="${BORDER}"/>
      <rect x="890" y="280" width="440" height="440" rx="96" fill="${PAPER}"/>
      ${masterMark(966, 356, 288, PRIMARY)}
      <text x="1110" y="774" text-anchor="middle" fill="${MUTED}" class="body" font-size="17">STANDARD · Rice Paper tile</text>
    `,
  });
}

async function writeSvgAndPng(svgPath, pngPath, svg, options = {}) {
  await fs.writeFile(svgPath, svg, "utf8");
  let pipeline = sharp(Buffer.from(svg));
  if (options.width || options.height) {
    pipeline = pipeline.resize({
      width: options.width,
      height: options.height,
      fit: options.fit ?? "contain",
    });
  }
  await pipeline.png({ compressionLevel: 9 }).toFile(pngPath);
}

const generatedFiles = [];

const markAssets = [
  ["fintrack-ai-mark-primary", masterMark, PRIMARY],
  ["fintrack-ai-mark-midnight", masterMark, INK],
  ["fintrack-ai-mark-reverse", masterMark, WHITE],
  ["fintrack-ai-mark-micro-primary", microMark, PRIMARY],
  ["fintrack-ai-mark-micro-midnight", microMark, INK],
  ["fintrack-ai-mark-micro-reverse", microMark, WHITE],
];

for (const [name, markFn, color] of markAssets) {
  const svgPath = path.join(MARKS_DIR, `${name}.svg`);
  const pngPath = path.join(MARKS_DIR, `${name}.png`);
  await writeSvgAndPng(svgPath, pngPath, markAssetSvg(markFn, color), {
    width: 512,
  });
  generatedFiles.push(svgPath, pngPath);
}

const lockupAssets = [
  [
    "fintrack-ai-lockup-primary",
    { markColor: PRIMARY, wordColor: INK },
  ],
  [
    "fintrack-ai-lockup-reverse",
    { markColor: PAPER, wordColor: PAPER },
  ],
  [
    "fintrack-ai-lockup-monochrome-dark",
    { markColor: INK, wordColor: INK },
  ],
  [
    "fintrack-ai-lockup-monochrome-light",
    { markColor: WHITE, wordColor: WHITE },
  ],
  [
    "fintrack-ai-lockup-compact-primary",
    { markColor: PRIMARY, wordColor: INK, useMicro: true },
  ],
  [
    "fintrack-ai-lockup-compact-reverse",
    { markColor: PAPER, wordColor: PAPER, useMicro: true },
  ],
  [
    "fintrack-ai-lockup-compact-monochrome-dark",
    { markColor: INK, wordColor: INK, useMicro: true },
  ],
  [
    "fintrack-ai-lockup-compact-monochrome-light",
    { markColor: WHITE, wordColor: WHITE, useMicro: true },
  ],
];

for (const [name, options] of lockupAssets) {
  const svgPath = path.join(LOCKUPS_DIR, `${name}.svg`);
  const pngPath = path.join(LOCKUPS_DIR, `${name}.png`);
  await writeSvgAndPng(svgPath, pngPath, lockupAssetSvg(options), {
    width: 1360,
  });
  generatedFiles.push(svgPath, pngPath);
}

for (const [size, maskable] of [
  [192, false],
  [512, false],
  [192, true],
  [512, true],
]) {
  const suffix = maskable ? "-maskable" : "";
  const name = `fintrack-ai-pwa-${size}${suffix}`;
  const svgPath = path.join(APP_ICONS_DIR, `${name}.svg`);
  const pngPath = path.join(APP_ICONS_DIR, `${name}.png`);
  await writeSvgAndPng(svgPath, pngPath, appIconSvg(size, { maskable }));
  generatedFiles.push(svgPath, pngPath);
}

for (const size of [16, 32]) {
  const svg = markAssetSvg(microMark, PRIMARY);
  const pngPath = path.join(APP_ICONS_DIR, `fintrack-ai-favicon-${size}.png`);
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(pngPath);
  generatedFiles.push(pngPath);
}

for (const [markName, markFn] of [
  ["master", masterMark],
  ["micro", microMark],
]) {
  for (const size of [16, 20, 24, 32, 48, 64]) {
    const exactPath = path.join(TESTS_DIR, `${markName}-${size}px.png`);
    const zoomPath = path.join(TESTS_DIR, `${markName}-${size}px-8x.png`);
    const exactBuffer = await sharp(
      Buffer.from(markAssetSvg(markFn, INK)),
    )
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toBuffer();
    await fs.writeFile(exactPath, exactBuffer);
    await sharp(exactBuffer)
      .resize(size * 8, size * 8, { kernel: "nearest" })
      .png({ compressionLevel: 9 })
      .toFile(zoomPath);
    generatedFiles.push(exactPath, zoomPath);
  }
}

for (const height of [24, 32, 48]) {
  const width = Math.round((LOCKUP_WIDTH / LOCKUP_HEIGHT) * height);
  const exactPath = path.join(TESTS_DIR, `lockup-${height}h.png`);
  const zoomPath = path.join(TESTS_DIR, `lockup-${height}h-4x.png`);
  const exactBuffer = await sharp(
    Buffer.from(
      lockupAssetSvg({
        markColor: PRIMARY,
        wordColor: INK,
        useMicro: height < 28,
      }),
    ),
  )
    .resize(width, height)
    .png({ compressionLevel: 9 })
    .toBuffer();
  await fs.writeFile(exactPath, exactBuffer);
  await sharp(exactBuffer)
    .resize(width * 4, height * 4, { kernel: "nearest" })
    .png({ compressionLevel: 9 })
    .toFile(zoomPath);
  generatedFiles.push(exactPath, zoomPath);
}

const sheets = [
  ["LOGO_R1_MASTER_SHEET", masterSheetSvg()],
  ["LOGO_R1_USAGE_RULES", usageSheetSvg()],
  ["LOGO_R1_SMALL_SIZE_TEST", smallSizeSheetSvg()],
  ["LOGO_R1_CONTEXT_TESTS", contextTestsSvg()],
  ["LOGO_R1_PWA_SAFE_ZONE", pwaSheetSvg()],
];

for (const [name, svg] of sheets) {
  const svgPath = path.join(ROOT, `${name}.svg`);
  const pngPath = path.join(ROOT, `${name}.png`);
  await writeSvgAndPng(svgPath, pngPath, svg);
  generatedFiles.push(svgPath, pngPath);
}

const tokens = {
  direction: "Baseline A — Refined Lockup",
  status:
    "LOGO-R1 final and locked for design proof; provisional production system for CP2–CP4",
  colors: {
    primaryMark: PRIMARY,
    primaryWordmark: INK,
    primaryBackground: PAPER,
    reverse: PAPER,
    reverseBackground: INK,
  },
  geometry: {
    viewBox: "0 0 160 160",
    lockupViewBox: `0 0 ${LOCKUP_WIDTH} ${LOCKUP_HEIGHT}`,
    masterMainStroke: 17,
    masterCornerStroke: 12.5,
    microMainStroke: 20,
    microCornerStroke: 14,
    clearSpace: "1x; x equals master vertical stem thickness",
  },
  sizing: {
    microMark: "16–23 px",
    masterMark: "24 px and above",
    compactLockup: "24–27 px high",
    masterLockup: "28 px high and above",
    minimumLockupHeight: 24,
    recommendedInterfaceLockupHeight: "28–32 px",
    pwaExports: [192, 512],
    maskableSafeZone: "centered circle; radius 40% of icon size",
  },
  wordmark: {
    family: "Space Grotesk",
    weight: 600,
    assetForm: "outlined SVG path",
  },
};
const tokensPath = path.join(ROOT, "logo-tokens.json");
await fs.writeFile(tokensPath, `${JSON.stringify(tokens, null, 2)}\n`, "utf8");

const manifest = {
  track: "Fintrack AI Logo",
  revision: "LOGO-R1",
  status: "Final / locked for design proof",
  direction: "Baseline A — Refined Lockup",
  productionStatus:
    "Provisional system for CP2–CP4; production lock remains at CP5",
  selectedOpticalVariant: "O2 Refined — main 17 / corners 12.5",
  microVariant: "Main 20 / corners 14 / square caps",
  font: {
    family: "Space Grotesk",
    weight: 600,
    wordmarkIsOutlined: true,
  },
  standards: {
    maskableSafeZone:
      "W3C Web App Manifest safe zone: centered circle with radius 40% of icon size",
  },
  files: generatedFiles
    .concat(tokensPath)
    .map((file) => path.relative(ROOT, file).replaceAll("\\", "/")),
};
const manifestPath = path.join(ROOT, "manifest.json");
await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

console.log(
  JSON.stringify(
    {
      root: ROOT,
      generated: generatedFiles.length,
      selectedOpticalVariant: manifest.selectedOpticalVariant,
      wordmarkIsOutlined: manifest.font.wordmarkIsOutlined,
      manifest: manifestPath,
    },
    null,
    2,
  ),
);
