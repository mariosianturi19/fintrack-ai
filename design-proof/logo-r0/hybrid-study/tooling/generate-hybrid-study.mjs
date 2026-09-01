import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const TOOLING_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(TOOLING_DIR, "..");
const LOGO_R0_ROOT = path.resolve(ROOT, "..");
const CONCEPTS_DIR = path.join(ROOT, "concepts");
const SMALL_DIR = path.join(ROOT, "small-size");
const FONT_PATH = path.join(
  LOGO_R0_ROOT,
  "assets",
  "fonts",
  "SpaceGrotesk-Variable.ttf",
);

const INK = "#0B1220";
const PAPER = "#F6F2E8";
const WHITE = "#FFFFFF";
const MUTED = "#5C6470";
const BORDER = "#D8D3C8";
const SOFT = "#ECE7DB";

await Promise.all([
  fs.mkdir(CONCEPTS_DIR, { recursive: true }),
  fs.mkdir(SMALL_DIR, { recursive: true }),
]);

const fontBase64 = (await fs.readFile(FONT_PATH)).toString("base64");
const embeddedFont = `
  @font-face {
    font-family: "Space Grotesk";
    src: url(data:font/ttf;base64,${fontBase64}) format("truetype");
    font-style: normal;
    font-weight: 300 700;
  }
`;

function xmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function svgDocument({ width, height, body, background }) {
  const backgroundNode = background
    ? `<rect width="${width}" height="${height}" fill="${background}"/>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <style>
    ${embeddedFont}
    .display { font-family: "Space Grotesk", sans-serif; font-weight: 600; letter-spacing: -0.035em; }
    .title { font-family: "Space Grotesk", sans-serif; font-weight: 600; letter-spacing: -0.025em; }
    .body { font-family: "Space Grotesk", sans-serif; font-weight: 450; }
    .label { font-family: "Space Grotesk", sans-serif; font-weight: 600; letter-spacing: 0.12em; }
  </style>
  ${backgroundNode}
  ${body}
</svg>`;
}

function baselineA(x, y, size, color = INK) {
  const scale = size / 160;
  return `
  <g transform="translate(${x} ${y}) scale(${scale})" color="${color}" fill="none"
     stroke="currentColor" stroke-width="18" stroke-linecap="round" stroke-linejoin="round">
    <path d="M42 126V34H106"/>
    <path d="M42 78H96"/>
    <path d="M118 34H130V54"/>
    <path d="M130 106V126H110"/>
    <circle cx="101" cy="78" r="4.5" fill="currentColor" stroke="none"/>
  </g>`;
}

function markD1(x, y, size, color = INK) {
  const scale = size / 160;
  return `
  <g transform="translate(${x} ${y}) scale(${scale})" color="${color}" fill="none"
     stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <path d="M43 127V34H104" stroke-width="17"/>
    <path d="M43 78H95" stroke-width="17"/>
    <path d="M117 34H129V55" stroke-width="12.5"/>
    <path d="M129 105V126H110" stroke-width="12.5"/>
  </g>`;
}

function markD2(x, y, size, color = INK) {
  const scale = size / 160;
  return `
  <g transform="translate(${x} ${y}) scale(${scale})" color="${color}" fill="none"
     stroke="currentColor" stroke-linecap="square" stroke-linejoin="round">
    <path d="M42 126V34H104" stroke-width="17"/>
    <path d="M42 78H96" stroke-width="17"/>
    <path d="M117 34H130V55" stroke-width="13"/>
    <path d="M130 105V126H109" stroke-width="13"/>
  </g>`;
}

function markD3(x, y, size, color = INK) {
  const scale = size / 160;
  return `
  <g transform="translate(${x} ${y}) scale(${scale})" color="${color}">
    <path fill="currentColor" d="M38 28H118L110 48H62V70H102L94 90H62V132H38V28Z"/>
    <circle cx="105" cy="80" r="4.5" fill="currentColor"/>
  </g>`;
}

const hybrids = [
  {
    id: "d1",
    slug: "soft-precision",
    title: "Soft Precision",
    descriptor: "A 80% · B 20%",
    short: "Human scan cue",
    mark: markD1,
    strength: "Paling tenang dan approachable.",
    risk: "Masih paling dekat dengan kategori ikon scanner.",
    verdict: "Human-first",
  },
  {
    id: "d2",
    slug: "balanced-refined",
    title: "Balanced Refined",
    descriptor: "A 65% · B 35%",
    short: "Controlled scan + ledger",
    mark: markD2,
    strength: "Keseimbangan identitas produk dan elegansi terbaik.",
    risk: "Perlu optical simplification untuk 16 px.",
    verdict: "Recommended",
  },
  {
    id: "d3",
    slug: "editorial-precision",
    title: "Editorial Precision",
    descriptor: "A 35% · B 65%",
    short: "Wordmark-led abstraction",
    mark: markD3,
    strength: "Paling editorial dan premium.",
    risk: "Makna scanning menjadi paling abstrak.",
    verdict: "Editorial-first",
  },
];

function wordmarkText(x, y, color = INK, size = 70) {
  return `<text x="${x}" y="${y}" fill="${color}" class="display" font-size="${size}">Fintrack AI</text>`;
}

function lockup(hybrid, x, y, width, color = INK) {
  if (hybrid.id === "d3") {
    const markSize = Math.round(width * 0.205);
    const fontSize = Math.round(width * 0.128);
    const baseline = y + Math.round(width * 0.153);
    return `
      ${hybrid.mark(x, y, markSize, color)}
      <text x="${x + Math.round(width * 0.235)}" y="${baseline}" fill="${color}"
        class="display" font-size="${fontSize}">Fintrack</text>
      <text x="${x + Math.round(width * 0.765)}" y="${baseline}" fill="${color}"
        class="title" font-size="${Math.round(fontSize * 0.74)}" letter-spacing="0.02em">AI</text>`;
  }

  const markSize = Math.round(width * 0.205);
  const fontSize = Math.round(width * 0.128);
  const aiSplit = hybrid.id === "d2";

  if (aiSplit) {
    return `
      ${hybrid.mark(x, y, markSize, color)}
      <text x="${x + Math.round(width * 0.235)}" y="${y + Math.round(width * 0.153)}"
        fill="${color}" class="display" font-size="${fontSize}">Fintrack</text>
      <text x="${x + Math.round(width * 0.765)}" y="${y + Math.round(width * 0.153)}"
        fill="${color}" class="title" font-size="${Math.round(fontSize * 0.78)}"
        letter-spacing="0.015em">AI</text>`;
  }

  return `
    ${hybrid.mark(x, y, markSize, color)}
    ${wordmarkText(
      x + Math.round(width * 0.235),
      y + Math.round(width * 0.153),
      color,
      fontSize,
    )}`;
}

function standaloneMarkSvg(hybrid, color = INK) {
  return svgDocument({
    width: 160,
    height: 160,
    body: hybrid.mark(0, 0, 160, color),
  });
}

function standaloneLockupSvg(hybrid, color = INK) {
  return svgDocument({
    width: 680,
    height: 180,
    body: lockup(hybrid, 20, 12, 630, color),
  });
}

function multilineText(
  lines,
  x,
  y,
  { size = 24, fill = MUTED, lineHeight = 34, klass = "body" } = {},
) {
  const tspans = lines
    .map(
      (line, index) =>
        `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${xmlEscape(line)}</tspan>`,
    )
    .join("");
  return `<text x="${x}" y="${y}" fill="${fill}" class="${klass}" font-size="${size}">${tspans}</text>`;
}

function hybridCard(hybrid, x, y) {
  const width = 520;
  const centerX = x + width / 2;
  const markSize = 236;
  const markX = centerX - markSize / 2;
  const tileY = y + 612;
  const sampleSizes = [16, 24, 32, 48];
  let cursor = x + 58;
  const smallSamples = sampleSizes
    .map((size) => {
      const node = hybrid.mark(cursor, y + 865 - size, size, INK);
      const label = `<text x="${cursor + size / 2}" y="${y + 895}" text-anchor="middle"
        fill="${MUTED}" class="body" font-size="16">${size}</text>`;
      cursor += size + 44;
      return `${node}${label}`;
    })
    .join("");

  const recommendation =
    hybrid.id === "d2"
      ? `<rect x="${x + 350}" y="${y + 36}" width="126" height="32" rx="16" fill="${INK}"/>
         <text x="${x + 413}" y="${y + 58}" text-anchor="middle" fill="${WHITE}"
           class="label" font-size="11">RECOMMENDED</text>`
      : "";

  return `
    <rect x="${x}" y="${y}" width="${width}" height="1120" rx="28" fill="${WHITE}" stroke="${BORDER}"/>
    ${recommendation}
    <text x="${x + 44}" y="${y + 58}" fill="${MUTED}" class="label" font-size="16">${hybrid.id.toUpperCase()}</text>
    <text x="${x + 44}" y="${y + 108}" fill="${INK}" class="title" font-size="34">${xmlEscape(hybrid.title)}</text>
    <text x="${x + 44}" y="${y + 142}" fill="${MUTED}" class="body" font-size="20">${xmlEscape(hybrid.descriptor)}</text>
    <text x="${x + 44}" y="${y + 174}" fill="${MUTED}" class="body" font-size="17">${xmlEscape(hybrid.short)}</text>

    ${hybrid.mark(markX, y + 204, markSize, INK)}

    <line x1="${x + 44}" y1="${y + 468}" x2="${x + 476}" y2="${y + 468}" stroke="${BORDER}"/>
    ${lockup(hybrid, x + 44, y + 505, 430, INK)}

    <rect x="${x + 44}" y="${tileY}" width="200" height="142" rx="18" fill="${PAPER}"/>
    ${hybrid.mark(x + 106, tileY + 22, 78, INK)}
    <text x="${x + 144}" y="${tileY + 127}" text-anchor="middle" fill="${MUTED}" class="body" font-size="15">MONO</text>

    <rect x="${x + 276}" y="${tileY}" width="200" height="142" rx="18" fill="${INK}"/>
    ${hybrid.mark(x + 338, tileY + 22, 78, WHITE)}
    <text x="${x + 376}" y="${tileY + 127}" text-anchor="middle" fill="${WHITE}" class="body" font-size="15">REVERSE</text>

    <text x="${x + 44}" y="${y + 825}" fill="${MUTED}" class="label" font-size="15">ACTUAL-SIZE CHECK · PX</text>
    ${smallSamples}

    <line x1="${x + 44}" y1="${y + 928}" x2="${x + 476}" y2="${y + 928}" stroke="${BORDER}"/>
    <text x="${x + 44}" y="${y + 970}" fill="${INK}" class="title" font-size="19">Kekuatan</text>
    ${multilineText([hybrid.strength], x + 44, y + 1004, { size: 16 })}
    <text x="${x + 44}" y="${y + 1050}" fill="${INK}" class="title" font-size="19">Risiko</text>
    ${multilineText([hybrid.risk], x + 44, y + 1084, { size: 16 })}
  `;
}

function hybridSheetSvg() {
  const cards = hybrids
    .map((hybrid, index) => hybridCard(hybrid, 80 + index * 560, 188))
    .join("");

  return svgDocument({
    width: 1800,
    height: 1400,
    background: PAPER,
    body: `
      <text x="80" y="80" fill="${MUTED}" class="label" font-size="18">FINTRACK AI · LOGO-R0 HYBRID STUDY</text>
      <text x="80" y="137" fill="${INK}" class="display" font-size="52">Refining signal into restraint</text>
      <text x="1720" y="125" text-anchor="end" fill="${MUTED}" class="body" font-size="20">Quiet Signal — Refined</text>
      ${cards}
      <text x="80" y="1360" fill="${MUTED}" class="body" font-size="18">
        Sintesis A + B. Motif receipt tetap menjadi supporting language, bukan detail simbol utama.
      </text>
    `,
  });
}

function comparisonItem({ label, title, mark, x, recommended = false }) {
  const badge = recommended
    ? `<rect x="${x + 168}" y="126" width="124" height="30" rx="15" fill="${INK}"/>
       <text x="${x + 230}" y="147" text-anchor="middle" fill="${WHITE}" class="label" font-size="10">RECOMMENDED</text>`
    : "";

  return `
    <rect x="${x}" y="110" width="380" height="500" rx="26" fill="${WHITE}" stroke="${BORDER}"/>
    ${badge}
    <text x="${x + 34}" y="150" fill="${MUTED}" class="label" font-size="14">${label}</text>
    <text x="${x + 34}" y="194" fill="${INK}" class="title" font-size="28">${xmlEscape(title)}</text>
    ${mark(x + 110, 238, 160, INK)}
    <rect x="${x + 34}" y="432" width="140" height="110" rx="16" fill="${PAPER}"/>
    ${mark(x + 78, 452, 52, INK)}
    <rect x="${x + 206}" y="432" width="140" height="110" rx="16" fill="${INK}"/>
    ${mark(x + 250, 452, 52, WHITE)}
  `;
}

function comparisonSheetSvg() {
  const items = [
    { label: "BASELINE A", title: "Signal Frame F", mark: baselineA },
    { label: "HYBRID D1", title: "Soft Precision", mark: markD1 },
    {
      label: "HYBRID D2",
      title: "Balanced Refined",
      mark: markD2,
      recommended: true,
    },
    { label: "HYBRID D3", title: "Editorial Precision", mark: markD3 },
  ];

  return svgDocument({
    width: 1800,
    height: 760,
    background: PAPER,
    body: `
      <text x="80" y="62" fill="${MUTED}" class="label" font-size="17">BASELINE COMPARISON</text>
      ${items.map((item, index) => comparisonItem({ ...item, x: 80 + index * 420 })).join("")}
      <text x="80" y="704" fill="${INK}" class="title" font-size="22">Decision lens</text>
      <text x="242" y="704" fill="${MUTED}" class="body" font-size="19">
        distinctiveness · professional restraint · product meaning · 16–24 px survival
      </text>
    `,
  });
}

function smallSizeSheetSvg(hybrid) {
  const sizes = [16, 20, 24, 32, 48, 64];
  let cursor = 70;
  const marks = sizes
    .map((size) => {
      const node = hybrid.mark(cursor, 160 - size, size, INK);
      const label = `<text x="${cursor + size / 2}" y="195" text-anchor="middle"
        fill="${MUTED}" class="body" font-size="16">${size}px</text>`;
      cursor += size + 58;
      return `${node}${label}`;
    })
    .join("");

  return svgDocument({
    width: 1000,
    height: 420,
    background: PAPER,
    body: `
      <text x="56" y="58" fill="${MUTED}" class="label" font-size="16">HYBRID SMALL-SIZE TEST · ${hybrid.id.toUpperCase()}</text>
      <text x="56" y="105" fill="${INK}" class="title" font-size="34">${xmlEscape(hybrid.title)}</text>
      ${marks}
      <rect x="56" y="238" width="888" height="126" rx="20" fill="${INK}"/>
      ${hybrid.mark(90, 270, 48, WHITE)}
      ${lockup(hybrid, 180, 257, 430, WHITE)}
      <text x="904" y="315" text-anchor="end" fill="${WHITE}" class="body" font-size="16">REVERSE LOCKUP</text>
    `,
  });
}

async function writeSvgAndPng(svgPath, pngPath, svg, options = {}) {
  await fs.writeFile(svgPath, svg, "utf8");
  let pipeline = sharp(Buffer.from(svg));
  if (options.width) {
    pipeline = pipeline.resize({ width: options.width });
  }
  await pipeline.png({ compressionLevel: 9 }).toFile(pngPath);
}

const generatedFiles = [];

for (const hybrid of hybrids) {
  const base = `${hybrid.id}-${hybrid.slug}`;
  const markSvg = path.join(CONCEPTS_DIR, `${base}-mark.svg`);
  const markPng = path.join(CONCEPTS_DIR, `${base}-mark.png`);
  const reverseSvg = path.join(CONCEPTS_DIR, `${base}-mark-reverse.svg`);
  const reversePng = path.join(CONCEPTS_DIR, `${base}-mark-reverse.png`);
  const lockupSvg = path.join(CONCEPTS_DIR, `${base}-lockup.svg`);
  const lockupPng = path.join(CONCEPTS_DIR, `${base}-lockup.png`);
  const smallSvg = path.join(SMALL_DIR, `${base}-small-size.svg`);
  const smallPng = path.join(SMALL_DIR, `${base}-small-size.png`);

  await writeSvgAndPng(markSvg, markPng, standaloneMarkSvg(hybrid), { width: 512 });
  await writeSvgAndPng(reverseSvg, reversePng, standaloneMarkSvg(hybrid, WHITE), {
    width: 512,
  });
  await writeSvgAndPng(lockupSvg, lockupPng, standaloneLockupSvg(hybrid), {
    width: 1360,
  });
  await writeSvgAndPng(smallSvg, smallPng, smallSizeSheetSvg(hybrid));

  generatedFiles.push(
    markSvg,
    markPng,
    reverseSvg,
    reversePng,
    lockupSvg,
    lockupPng,
    smallSvg,
    smallPng,
  );

  for (const size of [16, 24, 32, 48]) {
    const exactPng = path.join(SMALL_DIR, `${base}-${size}px.png`);
    const zoomPng = path.join(SMALL_DIR, `${base}-${size}px-8x.png`);
    const exactBuffer = await sharp(Buffer.from(standaloneMarkSvg(hybrid)))
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toBuffer();
    await fs.writeFile(exactPng, exactBuffer);
    await sharp(exactBuffer)
      .resize(size * 8, size * 8, { kernel: "nearest" })
      .png({ compressionLevel: 9 })
      .toFile(zoomPng);
    generatedFiles.push(exactPng, zoomPng);
  }
}

const sheetSvgPath = path.join(ROOT, "LOGO_R0_HYBRID_STUDY.svg");
const sheetPngPath = path.join(ROOT, "LOGO_R0_HYBRID_STUDY.png");
await writeSvgAndPng(sheetSvgPath, sheetPngPath, hybridSheetSvg());
generatedFiles.push(sheetSvgPath, sheetPngPath);

const comparisonSvgPath = path.join(ROOT, "HYBRID_VS_A_COMPARISON.svg");
const comparisonPngPath = path.join(ROOT, "HYBRID_VS_A_COMPARISON.png");
await writeSvgAndPng(
  comparisonSvgPath,
  comparisonPngPath,
  comparisonSheetSvg(),
);
generatedFiles.push(comparisonSvgPath, comparisonPngPath);

const manifest = {
  track: "Fintrack AI Logo",
  round: "LOGO-R0 Hybrid Study",
  status: "Completed study — superseded by LOGO-R0 direction lock",
  productionStatus:
    "Exploration only; LOGO-R1 begins after owner selects A, D1, D2, or D3",
  designDirection: "Quiet Signal — Refined",
  synthesis: {
    sourceA: "Signal Frame F",
    sourceB: "Refined Ledger",
    receiptMotif:
      "Retained as supporting brand language; intentionally excluded from the primary mark",
  },
  recommendation: "D2 — Balanced Refined",
  hybrids: hybrids.map(
    ({ id, slug, title, descriptor, short, strength, risk, verdict }) => ({
      id: id.toUpperCase(),
      slug,
      title,
      descriptor,
      short,
      strength,
      risk,
      verdict,
    }),
  ),
  tests: {
    monochrome: true,
    reverse: true,
    exactRasterSizes: [16, 24, 32, 48],
    baselineComparison: "Original A — Signal Frame F",
    vectorSource: "SVG",
    preview: "PNG",
  },
  sharedFont: {
    family: "Space Grotesk",
    localAsset: "../assets/fonts/SpaceGrotesk-Variable.ttf",
    license: "SIL Open Font License 1.1",
  },
  files: generatedFiles.map((file) =>
    path.relative(ROOT, file).replaceAll("\\", "/"),
  ),
};

const manifestPath = path.join(ROOT, "manifest.json");
await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

console.log(
  JSON.stringify(
    {
      root: ROOT,
      generated: generatedFiles.length,
      recommendation: manifest.recommendation,
      manifest: manifestPath,
    },
    null,
    2,
  ),
);
