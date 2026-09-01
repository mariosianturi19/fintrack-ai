import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const TOOLING_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(TOOLING_DIR, "..");
const CONCEPTS_DIR = path.join(ROOT, "concepts");
const SMALL_DIR = path.join(ROOT, "small-size");
const FONT_PATH = path.join(ROOT, "assets", "fonts", "SpaceGrotesk-Variable.ttf");

const INK = "#0B1220";
const PAPER = "#F6F2E8";
const WHITE = "#FFFFFF";
const MUTED = "#5C6470";
const BORDER = "#D8D3C8";

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

function svgDocument({ width, height, body, background, extraStyle = "" }) {
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
    ${extraStyle}
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
    <circle cx="101" cy="78" r="4.5" fill="currentColor" stroke="none"/>
  </g>`;
}

function markB(x, y, size, color = INK) {
  const scale = size / 160;
  return `
  <g transform="translate(${x} ${y}) scale(${scale})" color="${color}">
    <path fill="currentColor" d="M38 28H124L114 50H62V70H110L100 92H62V132H38V28Z"/>
  </g>`;
}

function markC(x, y, size, color = INK) {
  const scale = size / 160;
  return `
  <g transform="translate(${x} ${y}) scale(${scale})" color="${color}">
    <path fill="currentColor"
      d="M38 28H120V50H62V70H104V92H62V106H86V118L78 130L70 118L62 130L54 118L46 130L38 118V28Z"/>
  </g>`;
}

const concepts = [
  {
    id: "a",
    slug: "signal-frame",
    title: "Signal Frame F",
    descriptor: "Scan precision",
    mark: markA,
    strength: "Paling khas untuk ikon aplikasi.",
    risk: "Harus dijaga agar tidak terasa seperti QR scanner.",
    verdict: "Kandidat utama",
  },
  {
    id: "b",
    slug: "refined-ledger",
    title: "Refined Ledger",
    descriptor: "Editorial precision",
    mark: markB,
    strength: "Wordmark paling matang dan profesional.",
    risk: "Simbol mandiri lebih dekat ke monogram korporat.",
    verdict: "Kandidat penguat",
  },
  {
    id: "c",
    slug: "receipt-trace",
    title: "Receipt Trace",
    descriptor: "Human utility",
    mark: markC,
    strength: "Hubungan dengan struk paling langsung.",
    risk: "Gerigi struk lebih mudah terasa ilustratif.",
    verdict: "Kandidat naratif",
  },
];

function wordmarkText(x, y, color = INK, size = 70) {
  return `<text x="${x}" y="${y}" fill="${color}" class="display" font-size="${size}">Fintrack AI</text>`;
}

function lockup(concept, x, y, width, color = INK) {
  if (concept.id === "b") {
    const markSize = Math.round(width * 0.215);
    const fontSize = Math.round(width * 0.145);
    const markX = x;
    const markY = y + Math.round(width * 0.006);
    const baseline = y + Math.round(width * 0.158);
    return `
      ${concept.mark(markX, markY, markSize, color)}
      <text x="${x + Math.round(width * 0.180)}" y="${baseline}" fill="${color}" class="display" font-size="${fontSize}">intrack</text>
      <text x="${x + Math.round(width * 0.660)}" y="${baseline}" fill="${color}" class="title"
        font-size="${Math.round(fontSize * 0.74)}" letter-spacing="0.02em">AI</text>`;
  }

  const markSize = Math.round(width * 0.205);
  const fontSize = Math.round(width * 0.128);
  return `
    ${concept.mark(x, y, markSize, color)}
    ${wordmarkText(
      x + Math.round(width * 0.235),
      y + Math.round(width * 0.153),
      color,
      fontSize,
    )}`;
}

function standaloneMarkSvg(concept, color = INK) {
  return svgDocument({
    width: 160,
    height: 160,
    body: concept.mark(0, 0, 160, color),
  });
}

function standaloneLockupSvg(concept, color = INK) {
  return svgDocument({
    width: 680,
    height: 180,
    body: lockup(concept, 20, 12, 630, color),
  });
}

function multilineText(lines, x, y, { size = 24, fill = MUTED, lineHeight = 34, klass = "body" } = {}) {
  const tspans = lines
    .map(
      (line, index) =>
        `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${xmlEscape(line)}</tspan>`,
    )
    .join("");
  return `<text x="${x}" y="${y}" fill="${fill}" class="${klass}" font-size="${size}">${tspans}</text>`;
}

function conceptCard(concept, x, y) {
  const cardWidth = 520;
  const centerX = x + cardWidth / 2;
  const markSize = 236;
  const markX = centerX - markSize / 2;
  const lightTileX = x + 44;
  const reverseTileX = x + 276;
  const tileY = y + 612;

  const sampleSizes = [16, 24, 32, 48];
  let cursor = x + 58;
  const smallSamples = sampleSizes
    .map((size) => {
      const node = concept.mark(cursor, y + 865 - size, size, INK);
      const label = `<text x="${cursor + size / 2}" y="${y + 895}" text-anchor="middle"
        fill="${MUTED}" class="body" font-size="16">${size}</text>`;
      cursor += size + 44;
      return `${node}${label}`;
    })
    .join("");

  return `
    <rect x="${x}" y="${y}" width="${cardWidth}" height="1120" rx="28" fill="${WHITE}" stroke="${BORDER}"/>
    <text x="${x + 44}" y="${y + 58}" fill="${MUTED}" class="label" font-size="16">DIRECTION ${concept.id.toUpperCase()}</text>
    <text x="${x + 44}" y="${y + 108}" fill="${INK}" class="title" font-size="34">${xmlEscape(concept.title)}</text>
    <text x="${x + 44}" y="${y + 142}" fill="${MUTED}" class="body" font-size="20">${xmlEscape(concept.descriptor)}</text>

    ${concept.mark(markX, y + 188, markSize, INK)}

    <line x1="${x + 44}" y1="${y + 468}" x2="${x + 476}" y2="${y + 468}" stroke="${BORDER}"/>
    ${lockup(concept, x + 44, y + 505, 430, INK)}

    <rect x="${lightTileX}" y="${tileY}" width="200" height="142" rx="18" fill="${PAPER}"/>
    ${concept.mark(lightTileX + 62, tileY + 22, 78, INK)}
    <text x="${lightTileX + 100}" y="${tileY + 127}" text-anchor="middle" fill="${MUTED}" class="body" font-size="15">MONO</text>

    <rect x="${reverseTileX}" y="${tileY}" width="200" height="142" rx="18" fill="${INK}"/>
    ${concept.mark(reverseTileX + 62, tileY + 22, 78, WHITE)}
    <text x="${reverseTileX + 100}" y="${tileY + 127}" text-anchor="middle" fill="${WHITE}" class="body" font-size="15">REVERSE</text>

    <text x="${x + 44}" y="${y + 825}" fill="${MUTED}" class="label" font-size="15">ACTUAL-SIZE CHECK · PX</text>
    ${smallSamples}

    <line x1="${x + 44}" y1="${y + 928}" x2="${x + 476}" y2="${y + 928}" stroke="${BORDER}"/>
    <text x="${x + 44}" y="${y + 970}" fill="${INK}" class="title" font-size="19">Kekuatan</text>
    ${multilineText([concept.strength], x + 44, y + 1004, { size: 18, lineHeight: 28 })}
    <text x="${x + 44}" y="${y + 1050}" fill="${INK}" class="title" font-size="19">Risiko</text>
    ${multilineText([concept.risk], x + 44, y + 1084, { size: 16, lineHeight: 25 })}
  `;
}

function conceptSheetSvg() {
  const cards = concepts
    .map((concept, index) => conceptCard(concept, 80 + index * 560, 188))
    .join("");

  return svgDocument({
    width: 1800,
    height: 1400,
    background: PAPER,
    body: `
      <text x="80" y="80" fill="${MUTED}" class="label" font-size="18">FINTRACK AI · LOGO-R0</text>
      <text x="80" y="137" fill="${INK}" class="display" font-size="52">Three monochrome directions</text>
      <text x="1720" y="125" text-anchor="end" fill="${MUTED}" class="body" font-size="20">Quiet Signal — Refined</text>
      ${cards}
      <text x="80" y="1360" fill="${MUTED}" class="body" font-size="18">
        Eksplorasi bentuk, bukan logo produksi final. Warna brand diterapkan setelah arah dipilih.
      </text>
    `,
  });
}

function smallSizeSheetSvg(concept) {
  const sizes = [16, 20, 24, 32, 48, 64];
  let cursor = 70;
  const marks = sizes
    .map((size) => {
      const node = concept.mark(cursor, 160 - size, size, INK);
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
      <text x="56" y="58" fill="${MUTED}" class="label" font-size="16">SMALL-SIZE TEST · DIRECTION ${concept.id.toUpperCase()}</text>
      <text x="56" y="105" fill="${INK}" class="title" font-size="34">${xmlEscape(concept.title)}</text>
      ${marks}
      <rect x="56" y="238" width="888" height="126" rx="20" fill="${INK}"/>
      ${concept.mark(90, 270, 48, WHITE)}
      ${lockup(concept, 180, 257, 430, WHITE)}
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

for (const concept of concepts) {
  const base = `concept-${concept.id}-${concept.slug}`;
  const markSvg = path.join(CONCEPTS_DIR, `${base}-mark.svg`);
  const markPng = path.join(CONCEPTS_DIR, `${base}-mark.png`);
  const reverseSvg = path.join(CONCEPTS_DIR, `${base}-mark-reverse.svg`);
  const reversePng = path.join(CONCEPTS_DIR, `${base}-mark-reverse.png`);
  const lockupSvg = path.join(CONCEPTS_DIR, `${base}-lockup.svg`);
  const lockupPng = path.join(CONCEPTS_DIR, `${base}-lockup.png`);
  const smallSvg = path.join(SMALL_DIR, `${base}-small-size.svg`);
  const smallPng = path.join(SMALL_DIR, `${base}-small-size.png`);

  await writeSvgAndPng(markSvg, markPng, standaloneMarkSvg(concept), { width: 512 });
  await writeSvgAndPng(reverseSvg, reversePng, standaloneMarkSvg(concept, WHITE), { width: 512 });
  await writeSvgAndPng(lockupSvg, lockupPng, standaloneLockupSvg(concept), { width: 1360 });
  await writeSvgAndPng(smallSvg, smallPng, smallSizeSheetSvg(concept));

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
    const exactSvg = standaloneMarkSvg(concept);
    const exactBuffer = await sharp(Buffer.from(exactSvg))
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

const sheetSvgPath = path.join(ROOT, "LOGO_R0_CONCEPT_SHEET.svg");
const sheetPngPath = path.join(ROOT, "LOGO_R0_CONCEPT_SHEET.png");
await writeSvgAndPng(sheetSvgPath, sheetPngPath, conceptSheetSvg());
generatedFiles.push(sheetSvgPath, sheetPngPath);

const manifest = {
  track: "Fintrack AI Logo",
  revision: "LOGO-R0",
  status: "R0 direction selected — Baseline A — Refined Lockup",
  designDirection: "Quiet Signal — Refined",
  productionStatus: "Concept exploration only; production lock is reserved for CP5",
  concepts: concepts.map(({ id, slug, title, descriptor, strength, risk, verdict }) => ({
    id: id.toUpperCase(),
    slug,
    title,
    descriptor,
    strength,
    risk,
    verdict,
  })),
  tests: {
    monochrome: true,
    reverse: true,
    exactRasterSizes: [16, 24, 32, 48],
    vectorSource: "SVG",
    preview: "PNG",
  },
  font: {
    family: "Space Grotesk",
    source: "Google Fonts repository",
    license: "SIL Open Font License 1.1",
    localAsset: "assets/fonts/SpaceGrotesk-Variable.ttf",
  },
  files: generatedFiles.map((file) => path.relative(ROOT, file).replaceAll("\\", "/")),
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
