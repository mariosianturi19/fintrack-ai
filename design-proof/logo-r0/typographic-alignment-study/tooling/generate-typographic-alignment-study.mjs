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
const TESTS_DIR = path.join(ROOT, "tests");
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
const GUIDE = "#9AA4B2";
const PASS = "#285A73";
const WARN = "#A55C35";

await Promise.all([
  fs.mkdir(CONCEPTS_DIR, { recursive: true }),
  fs.mkdir(TESTS_DIR, { recursive: true }),
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

function markA(x, y, size, color = INK) {
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

function markT1(x, y, size, color = INK) {
  const scale = size / 160;
  return `
  <g transform="translate(${x} ${y}) scale(${scale})" color="${color}">
    <text x="31" y="128" fill="currentColor" class="display" font-size="136">F</text>
    <g fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="square" stroke-linejoin="miter">
      <path d="M111 32H130V55"/>
      <path d="M130 106V130H108"/>
    </g>
  </g>`;
}

const candidates = [
  {
    id: "a",
    slug: "baseline-a",
    title: "Baseline A",
    subtitle: "Reference",
    mark: markA,
    verdict: "PASS — symbol reference",
    note: "Simbol kuat, tetapi lockup awal sedikit terlalu dominan.",
    badge: "PASS",
    badgeColor: PASS,
  },
  {
    id: "t1",
    slug: "integrated-f",
    title: "T1 — Integrated F",
    subtitle: "One typographic family",
    mark: markT1,
    verdict: "FAIL — word readability",
    note: "Frame berubah menjadi tanda baca di antara F dan ‘intrack’.",
    badge: "FAIL · READABILITY",
    badgeColor: WARN,
  },
  {
    id: "t2",
    slug: "separate-icon",
    title: "T2 — Separate Icon",
    subtitle: "Intentional contrast",
    mark: markA,
    verdict: "BEST TESTED LOCKUP",
    note: "Simbol A dipertahankan dan disetarakan ke cap-height wordmark.",
    badge: "BEST RESULT",
    badgeColor: INK,
  },
];

function baselineLockup(x, y, width, color = INK) {
  const scale = width / 680;
  return `
  <g transform="translate(${x} ${y}) scale(${scale})">
    ${markA(20, 18, 126, color)}
    <text x="170" y="116" fill="${color}" class="display" font-size="82">Fintrack AI</text>
  </g>`;
}

function t1Lockup(x, y, width, color = INK) {
  const scale = width / 680;
  return `
  <g transform="translate(${x} ${y}) scale(${scale})" color="${color}">
    <text x="34" y="116" fill="currentColor" class="display" font-size="82">F</text>
    <g fill="none" stroke="currentColor" stroke-width="6.5" stroke-linecap="square">
      <path d="M78 51H91V68"/>
      <path d="M91 99V116H76"/>
    </g>
    <text x="101" y="116" fill="currentColor" class="display" font-size="82">intrack</text>
    <text x="383" y="116" fill="currentColor" class="title" font-size="62" letter-spacing="0.015em">AI</text>
  </g>`;
}

function t2Lockup(x, y, width, color = INK) {
  const scale = width / 680;
  return `
  <g transform="translate(${x} ${y}) scale(${scale})">
    ${markA(23, 28, 104, color)}
    <text x="150" y="116" fill="${color}" class="display" font-size="82">Fintrack AI</text>
  </g>`;
}

function candidateLockup(candidate, x, y, width, color = INK) {
  if (candidate.id === "t1") return t1Lockup(x, y, width, color);
  if (candidate.id === "t2") return t2Lockup(x, y, width, color);
  return baselineLockup(x, y, width, color);
}

function standaloneMarkSvg(candidate, color = INK) {
  return svgDocument({
    width: 160,
    height: 160,
    body: candidate.mark(0, 0, 160, color),
  });
}

function standaloneLockupSvg(candidate, color = INK) {
  return svgDocument({
    width: 680,
    height: 160,
    body: candidateLockup(candidate, 0, 0, 680, color),
  });
}

function multilineText(
  lines,
  x,
  y,
  { size = 22, fill = MUTED, lineHeight = 30, klass = "body" } = {},
) {
  const tspans = lines
    .map(
      (line, index) =>
        `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${xmlEscape(line)}</tspan>`,
    )
    .join("");
  return `<text x="${x}" y="${y}" fill="${fill}" class="${klass}" font-size="${size}">${tspans}</text>`;
}

function studyCard(candidate, x, y) {
  const width = 520;
  const badgeWidth = candidate.id === "t1" ? 156 : 126;
  const status = `
    <rect x="${x + 476 - badgeWidth}" y="${y + 36}" width="${badgeWidth}" height="32" rx="16" fill="${candidate.badgeColor}"/>
    <text x="${x + 476 - badgeWidth / 2}" y="${y + 58}" text-anchor="middle" fill="${WHITE}" class="label" font-size="10">${candidate.badge}</text>`;

  return `
    <rect x="${x}" y="${y}" width="${width}" height="960" rx="28" fill="${WHITE}" stroke="${BORDER}"/>
    ${status}
    <text x="${x + 44}" y="${y + 58}" fill="${MUTED}" class="label" font-size="15">${candidate.id.toUpperCase()}</text>
    <text x="${x + 44}" y="${y + 108}" fill="${INK}" class="title" font-size="34">${xmlEscape(candidate.title)}</text>
    <text x="${x + 44}" y="${y + 142}" fill="${MUTED}" class="body" font-size="19">${xmlEscape(candidate.subtitle)}</text>

    ${candidate.mark(x + 156, y + 190, 208, INK)}

    <line x1="${x + 44}" y1="${y + 420}" x2="${x + 476}" y2="${y + 420}" stroke="${BORDER}"/>
    ${candidateLockup(candidate, x + 34, y + 458, 452, INK)}

    <rect x="${x + 44}" y="${y + 640}" width="200" height="130" rx="18" fill="${PAPER}"/>
    ${candidate.mark(x + 108, y + 660, 72, INK)}
    <text x="${x + 144}" y="${y + 753}" text-anchor="middle" fill="${MUTED}" class="body" font-size="14">MONO</text>

    <rect x="${x + 276}" y="${y + 640}" width="200" height="130" rx="18" fill="${INK}"/>
    ${candidate.mark(x + 340, y + 660, 72, WHITE)}
    <text x="${x + 376}" y="${y + 753}" text-anchor="middle" fill="${WHITE}" class="body" font-size="14">REVERSE</text>

    <text x="${x + 44}" y="${y + 824}" fill="${INK}" class="title" font-size="19">${xmlEscape(candidate.verdict)}</text>
    ${multilineText([candidate.note], x + 44, y + 860, { size: 17, lineHeight: 26 })}
  `;
}

function mainStudySvg() {
  return svgDocument({
    width: 1800,
    height: 1240,
    background: PAPER,
    body: `
      <text x="80" y="76" fill="${MUTED}" class="label" font-size="17">FINTRACK AI · LOGO-R0 TYPOGRAPHIC ALIGNMENT STUDY</text>
      <text x="80" y="134" fill="${INK}" class="display" font-size="52">Does the symbol belong with the wordmark?</text>
      <text x="1720" y="123" text-anchor="end" fill="${MUTED}" class="body" font-size="20">Quiet Signal — Refined</text>
      ${candidates.map((candidate, index) => studyCard(candidate, 80 + index * 560, 194)).join("")}
      <text x="80" y="1204" fill="${MUTED}" class="body" font-size="18">
        T1 menguji satu glyph family. T2 menguji pemisahan hierarchy. Baseline A tetap menjadi reference.
      </text>
    `,
  });
}

function alignmentRow(candidate, y) {
  const top = y + 58;
  const baseline = y + 122;
  return `
    <rect x="290" y="${y}" width="1410" height="178" rx="22" fill="${WHITE}" stroke="${BORDER}"/>
    <text x="80" y="${y + 54}" fill="${INK}" class="title" font-size="26">${xmlEscape(candidate.title)}</text>
    <text x="80" y="${y + 86}" fill="${MUTED}" class="body" font-size="17">${xmlEscape(candidate.subtitle)}</text>
    <line x1="320" y1="${top}" x2="1660" y2="${top}" stroke="${GUIDE}" stroke-dasharray="7 7"/>
    <line x1="320" y1="${baseline}" x2="1660" y2="${baseline}" stroke="${PASS}" stroke-dasharray="7 7"/>
    <text x="1648" y="${top - 8}" text-anchor="end" fill="${GUIDE}" class="body" font-size="13">CAP REFERENCE</text>
    <text x="1648" y="${baseline - 8}" text-anchor="end" fill="${PASS}" class="body" font-size="13">BASELINE</text>
    ${candidateLockup(candidate, 340, y + 6, 680, INK)}
  `;
}

function alignmentOverlaySvg() {
  return svgDocument({
    width: 1800,
    height: 780,
    background: PAPER,
    body: `
      <text x="80" y="70" fill="${MUTED}" class="label" font-size="17">VISIBLE TEST · CAP HEIGHT AND BASELINE</text>
      ${candidates.map((candidate, index) => alignmentRow(candidate, 112 + index * 204)).join("")}
      <text x="80" y="748" fill="${MUTED}" class="body" font-size="17">
        Garis menunjukkan apakah perbedaan bentuk terasa sebagai satu glyph family atau sebagai contrast icon–type yang disengaja.
      </text>
    `,
  });
}

function sizeTestRow(candidate, y) {
  const sizes = [24, 32, 48];
  let x = 330;
  const examples = sizes
    .map((height) => {
      const width = (680 / 160) * height;
      const node = candidateLockup(candidate, x, y + 58 - height, width, INK);
      const label = `<text x="${x}" y="${y + 92}" fill="${MUTED}" class="body" font-size="15">${height}px high</text>`;
      x += width + 130;
      return `${node}${label}`;
    })
    .join("");

  return `
    <text x="70" y="${y + 42}" fill="${INK}" class="title" font-size="24">${xmlEscape(candidate.title)}</text>
    <text x="70" y="${y + 72}" fill="${MUTED}" class="body" font-size="16">${xmlEscape(candidate.subtitle)}</text>
    ${examples}
    <line x1="70" y1="${y + 116}" x2="1530" y2="${y + 116}" stroke="${BORDER}"/>
  `;
}

function lockupSizeTestSvg() {
  return svgDocument({
    width: 1600,
    height: 560,
    background: PAPER,
    body: `
      <text x="70" y="64" fill="${MUTED}" class="label" font-size="17">ACTUAL LOCKUP HEIGHT TEST</text>
      ${candidates.map((candidate, index) => sizeTestRow(candidate, 112 + index * 132)).join("")}
      <text x="70" y="528" fill="${MUTED}" class="body" font-size="16">
        Ukuran aktual—bukan mockup yang dibesarkan. Raster zoom tersedia untuk inspeksi pixel.
      </text>
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

for (const candidate of candidates) {
  const base = `${candidate.id}-${candidate.slug}`;
  const markSvg = path.join(CONCEPTS_DIR, `${base}-mark.svg`);
  const markPng = path.join(CONCEPTS_DIR, `${base}-mark.png`);
  const reverseSvg = path.join(CONCEPTS_DIR, `${base}-mark-reverse.svg`);
  const reversePng = path.join(CONCEPTS_DIR, `${base}-mark-reverse.png`);
  const lockupSvg = path.join(CONCEPTS_DIR, `${base}-lockup.svg`);
  const lockupPng = path.join(CONCEPTS_DIR, `${base}-lockup.png`);

  await writeSvgAndPng(markSvg, markPng, standaloneMarkSvg(candidate), { width: 512 });
  await writeSvgAndPng(reverseSvg, reversePng, standaloneMarkSvg(candidate, WHITE), {
    width: 512,
  });
  await writeSvgAndPng(lockupSvg, lockupPng, standaloneLockupSvg(candidate), {
    width: 1360,
  });
  generatedFiles.push(markSvg, markPng, reverseSvg, reversePng, lockupSvg, lockupPng);

  for (const size of [16, 24, 32, 48]) {
    const exactPath = path.join(TESTS_DIR, `${base}-mark-${size}px.png`);
    const zoomPath = path.join(TESTS_DIR, `${base}-mark-${size}px-8x.png`);
    const exactBuffer = await sharp(Buffer.from(standaloneMarkSvg(candidate)))
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

  for (const height of [24, 32, 48]) {
    const width = Math.round((680 / 160) * height);
    const exactPath = path.join(TESTS_DIR, `${base}-lockup-${height}h.png`);
    const zoomPath = path.join(TESTS_DIR, `${base}-lockup-${height}h-4x.png`);
    const exactBuffer = await sharp(Buffer.from(standaloneLockupSvg(candidate)))
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
}

const sheets = [
  ["LOGO_R0_TYPOGRAPHIC_ALIGNMENT_STUDY", mainStudySvg()],
  ["TYPOGRAPHIC_ALIGNMENT_OVERLAY", alignmentOverlaySvg()],
  ["LOCKUP_SIZE_TEST", lockupSizeTestSvg()],
];

for (const [name, svg] of sheets) {
  const svgPath = path.join(ROOT, `${name}.svg`);
  const pngPath = path.join(ROOT, `${name}.png`);
  await writeSvgAndPng(svgPath, pngPath, svg);
  generatedFiles.push(svgPath, pngPath);
}

const manifest = {
  track: "Fintrack AI Logo",
  round: "LOGO-R0 Typographic Alignment Study",
  status: "Tested; owner confirmed / direction locked",
  purpose:
    "Test whether an integrated Space Grotesk F or a deliberately separate icon resolves symbol–wordmark mismatch",
  candidates: candidates.map(({ id, slug, title, subtitle, verdict, note }) => ({
    id: id.toUpperCase(),
    slug,
    title,
    subtitle,
    verdict,
    note,
  })),
  tests: {
    monochrome: true,
    reverse: true,
    markRasterSizes: [16, 24, 32, 48],
    lockupHeights: [24, 32, 48],
    alignmentOverlay: true,
  },
  verdict: {
    winningSymbol: "Baseline A — Signal Frame F",
    winningLockupRelationship: "T2 — Separate Icon",
    combinedRecommendation: "Baseline A symbol with T2 lockup proportions",
    rejected: "T1 — Integrated F; scan frame reads as punctuation",
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
      manifest: manifestPath,
    },
    null,
    2,
  ),
);
