import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

export const TOOLING_DIR = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(TOOLING_DIR, "..");
export const PROJECT_ROOT = path.resolve(ROOT, "..", "..");
export const DESKTOP_DIR = path.join(ROOT, "desktop");
export const TESTS_DIR = path.join(ROOT, "tests");
export const CP2_RUNTIME = path.join(
  ROOT,
  "..",
  "local-cp2",
  "tooling-runtime",
);
export const runtimeRequire = createRequire(
  path.join(CP2_RUNTIME, "package.json"),
);
export const sharp = runtimeRequire("sharp");

const RUNTIME_MODULES = path.join(CP2_RUNTIME, "node_modules");
const SPACE_FONT_PATH = path.join(
  PROJECT_ROOT,
  "design-proof",
  "logo-r0",
  "assets",
  "fonts",
  "SpaceGrotesk-Variable.ttf",
);
const PLEX_DIR = path.join(
  RUNTIME_MODULES,
  "@ibm",
  "plex",
  "IBM-Plex-Sans",
  "fonts",
  "complete",
  "woff",
);
const ICON_ROOT = path.join(
  RUNTIME_MODULES,
  "@phosphor-icons",
  "core",
  "assets",
);
const PRIMARY_LOGO_PATH = path.join(
  PROJECT_ROOT,
  "design-proof",
  "logo-r1",
  "assets",
  "lockups",
  "fintrack-ai-lockup-compact-primary.svg",
);
const REVERSE_LOGO_PATH = path.join(
  PROJECT_ROOT,
  "design-proof",
  "logo-r1",
  "assets",
  "lockups",
  "fintrack-ai-lockup-compact-reverse.svg",
);

export const C = {
  canvas: "#F6F2E8",
  canvasSubtle: "#FCFBF7",
  surface: "#FFFFFF",
  ink: "#0B1220",
  secondary: "#53606C",
  warmMuted: "#6B665E",
  primary: "#285A73",
  primaryHover: "#1F465A",
  primarySoft: "#DCEAF0",
  signal: "#B9D86E",
  signalInk: "#526827",
  signalSoft: "#EDF5D5",
  expense: "#D96C52",
  expenseInk: "#A63D2A",
  expenseSoft: "#F8E2DB",
  warning: "#8A3C00",
  warningSoft: "#FFF1D6",
  error: "#B42318",
  errorSoft: "#FDE8E7",
  border: "#D9D6CC",
  divider: "#E7E3DA",
  disabled: "#EEEAE1",
  chartPurple: "#8A6FA8",
  chartGold: "#B48A32",
  chartGreen: "#5A8F7B",
  chartSlate: "#64748B",
  darkSurface: "#121D2A",
  darkSurface2: "#172534",
  darkBorder: "#344252",
  darkMuted: "#AAB3BF",
};

export const DISPLAY = "'Space Grotesk', Arial, sans-serif";
export const BODY = "'IBM Plex Sans', Arial, sans-serif";

const iconNames = [
  "archive",
  "arrow-down",
  "arrow-left",
  "arrow-right",
  "calendar",
  "camera",
  "caret-down",
  "caret-right",
  "chart-bar",
  "check",
  "check-circle",
  "clock",
  "cloud-arrow-up",
  "cloud-check",
  "download-simple",
  "export",
  "eye",
  "file-text",
  "funnel",
  "fork-knife",
  "house",
  "info",
  "list-bullets",
  "magnifying-glass",
  "note-pencil",
  "pencil-simple",
  "plus",
  "receipt",
  "scan",
  "shield-check",
  "sparkle",
  "spinner-gap",
  "storefront",
  "tag",
  "train",
  "trash",
  "trend-up",
  "upload-simple",
  "user",
  "warning",
  "wifi-slash",
  "x",
];

await Promise.all([
  fs.mkdir(DESKTOP_DIR, { recursive: true }),
  fs.mkdir(TESTS_DIR, { recursive: true }),
]);

const [spaceFont, plexRegular, plexMedium, plexSemibold, primaryLogo, reverseLogo] =
  await Promise.all([
    fs.readFile(SPACE_FONT_PATH),
    fs.readFile(path.join(PLEX_DIR, "IBMPlexSans-Regular.woff")),
    fs.readFile(path.join(PLEX_DIR, "IBMPlexSans-Medium.woff")),
    fs.readFile(path.join(PLEX_DIR, "IBMPlexSans-SemiBold.woff")),
    fs.readFile(PRIMARY_LOGO_PATH, "utf8"),
    fs.readFile(REVERSE_LOGO_PATH, "utf8"),
  ]);

export const fontCss = `
  @font-face {
    font-family: "Space Grotesk";
    src: url(data:font/ttf;base64,${spaceFont.toString("base64")}) format("truetype");
    font-style: normal;
    font-weight: 300 700;
  }
  @font-face {
    font-family: "IBM Plex Sans";
    src: url(data:font/woff;base64,${plexRegular.toString("base64")}) format("woff");
    font-style: normal;
    font-weight: 400;
  }
  @font-face {
    font-family: "IBM Plex Sans";
    src: url(data:font/woff;base64,${plexMedium.toString("base64")}) format("woff");
    font-style: normal;
    font-weight: 500;
  }
  @font-face {
    font-family: "IBM Plex Sans";
    src: url(data:font/woff;base64,${plexSemibold.toString("base64")}) format("woff");
    font-style: normal;
    font-weight: 600;
  }
  text { text-rendering: geometricPrecision; }
`;

export const primaryLogoUri = `data:image/svg+xml;base64,${Buffer.from(primaryLogo).toString("base64")}`;
export const reverseLogoUri = `data:image/svg+xml;base64,${Buffer.from(reverseLogo).toString("base64")}`;

const iconBodies = new Map();
for (const weight of ["regular", "fill"]) {
  for (const name of iconNames) {
    try {
      const source = await fs.readFile(
        path.join(ICON_ROOT, weight, `${name}.svg`),
        "utf8",
      );
      iconBodies.set(
        `${weight}:${name}`,
        source.replace(/^<svg[^>]*>/u, "").replace(/<\/svg>\s*$/u, ""),
      );
    } catch {
      // Optional icon variants may not exist.
    }
  }
}

export function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function svgDoc(width, height, label, body, background = C.canvas) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"
  viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(label)}">
  <style>${fontCss}</style>
  <rect width="${width}" height="${height}" fill="${background}"/>
  ${body.flat(Infinity).join("\n")}
</svg>
`;
}

export function txt(x, y, value, options = {}) {
  const {
    size = 16,
    fill = C.ink,
    weight = 400,
    family = BODY,
    anchor = "start",
    letterSpacing = 0,
    opacity = 1,
    italic = false,
    numeric = false,
  } = options;
  return `<text x="${x}" y="${y}" fill="${fill}" font-family="${family}"
    font-size="${size}" font-weight="${weight}" text-anchor="${anchor}"
    letter-spacing="${letterSpacing}" opacity="${opacity}"
    font-style="${italic ? "italic" : "normal"}"
    ${numeric ? 'style="font-variant-numeric:tabular-nums"' : ""}>${esc(value)}</text>`;
}

export function textLines(x, y, lines, options = {}) {
  const { lineHeight = 22, ...textOptions } = options;
  return lines.map((lineText, index) =>
    txt(x, y + index * lineHeight, lineText, textOptions),
  );
}

export function rect(x, y, width, height, options = {}) {
  const {
    fill = C.surface,
    stroke = "none",
    strokeWidth = 0,
    radius = 0,
    opacity = 1,
    dash = "",
  } = options;
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}"
    rx="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"
    opacity="${opacity}" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`;
}

export function line(x1, y1, x2, y2, options = {}) {
  const {
    stroke = C.divider,
    width = 1,
    opacity = 1,
    dash = "",
    cap = "round",
  } = options;
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
    stroke="${stroke}" stroke-width="${width}" opacity="${opacity}"
    stroke-linecap="${cap}" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`;
}

export function circle(cx, cy, radius, options = {}) {
  const {
    fill = C.surface,
    stroke = "none",
    strokeWidth = 0,
    opacity = 1,
  } = options;
  return `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${fill}"
    stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}"/>`;
}

export function icon(name, x, y, size = 20, options = {}) {
  const { color = C.ink, weight = "regular", opacity = 1 } = options;
  const body =
    iconBodies.get(`${weight}:${name}`) ??
    iconBodies.get(`regular:${name}`) ??
    "";
  return `<g transform="translate(${x} ${y}) scale(${size / 256})"
    fill="${color}" color="${color}" opacity="${opacity}">${body}</g>`;
}

export function badge(x, y, label, options = {}) {
  const {
    fill = C.primarySoft,
    color = C.primary,
    width = Math.max(72, label.length * 7 + 24),
    height = 28,
    radius = 8,
    iconName = "",
  } = options;
  const iconMarkup = iconName
    ? icon(iconName, x + 10, y + (height - 14) / 2, 14, { color })
    : "";
  const labelX = iconName ? x + 31 : x + width / 2;
  return [
    rect(x, y, width, height, { fill, radius }),
    iconMarkup,
    txt(labelX, y + height / 2 + 5, label, {
      size: 12,
      weight: 600,
      fill: color,
      anchor: iconName ? "start" : "middle",
    }),
  ];
}

export function button(x, y, width, label, options = {}) {
  const {
    height = 44,
    kind = "primary",
    iconName = "",
    disabled = false,
  } = options;
  const palette = {
    primary: { fill: C.primary, stroke: C.primary, text: C.surface },
    secondary: { fill: C.surface, stroke: C.primary, text: C.primary },
    tertiary: { fill: "transparent", stroke: "none", text: C.primary },
    destructive: { fill: C.error, stroke: C.error, text: C.surface },
  }[kind];
  const actual = disabled
    ? { fill: C.disabled, stroke: C.disabled, text: C.warmMuted }
    : palette;
  const estimatedLabelWidth = label.length * 7.5;
  const groupWidth = iconName ? estimatedLabelWidth + 27 : estimatedLabelWidth;
  const groupStart = x + (width - groupWidth) / 2;
  return [
    rect(x, y, width, height, {
      fill: actual.fill,
      stroke: actual.stroke,
      strokeWidth: actual.stroke === "none" ? 0 : 1,
      radius: 12,
    }),
    iconName
      ? icon(iconName, groupStart, y + (height - 17) / 2, 17, {
          color: actual.text,
        })
      : "",
    txt(iconName ? groupStart + 27 : x + width / 2, y + height / 2 + 5, label, {
      size: 15,
      weight: 600,
      fill: actual.text,
      anchor: iconName ? "start" : "middle",
    }),
  ];
}

export function field(x, y, width, label, value, options = {}) {
  const {
    height = 44,
    warning = false,
    error = false,
    suffix = "",
    iconName = "",
  } = options;
  const border = error ? C.error : warning ? C.warning : C.border;
  return [
    txt(x, y - 8, label, { size: 12, fill: C.secondary, weight: 500 }),
    rect(x, y, width, height, {
      fill: C.surface,
      stroke: border,
      strokeWidth: warning || error ? 1.5 : 1,
      radius: 10,
    }),
    iconName ? icon(iconName, x + 13, y + 13, 18, { color: C.secondary }) : "",
    txt(x + (iconName ? 42 : 14), y + 27, value, { size: 14, weight: 500 }),
    suffix
      ? txt(x + width - 14, y + 27, suffix, {
          size: 12,
          fill: C.secondary,
          anchor: "end",
          weight: 500,
        })
      : "",
  ];
}

export function labelText(x, y, label) {
  return txt(x, y, label.toUpperCase(), {
    size: 11,
    fill: C.secondary,
    weight: 600,
    letterSpacing: 1.4,
  });
}

export function progressStrip(x, y, width, active = 1, dark = false) {
  const gap = 8;
  const segmentWidth = (width - gap * 3) / 4;
  const labels = ["Foto", "Persiapan", "Pemeriksaan AI", "Tinjau"];
  return [
    ...labels.map((label, index) => {
      const currentX = x + index * (segmentWidth + gap);
      const complete = index < active;
      const current = index === active;
      const color = complete
        ? C.signal
        : current
          ? dark
            ? C.surface
            : C.primary
          : dark
            ? C.darkBorder
            : C.divider;
      return [
        rect(currentX, y, segmentWidth, 4, { fill: color, radius: 2 }),
        txt(currentX, y + 22, label, {
          size: 11,
          fill: current
            ? dark
              ? C.surface
              : C.primary
            : dark
              ? C.darkMuted
              : C.secondary,
          weight: current ? 600 : 500,
        }),
      ];
    }),
  ];
}

export function receipt(x, y, width = 186, height = 300, options = {}) {
  const { compact = false } = options;
  const padding = compact ? 14 : 20;
  const rows = compact ? 7 : 10;
  return [
    rect(x, y, width, height, {
      fill: "#FFFDF8",
      stroke: C.border,
      strokeWidth: 1,
      radius: 5,
    }),
    rect(x + padding, y + 20, width * 0.32, 8, {
      fill: "#A6A39B",
      radius: 4,
    }),
    txt(x + width - padding, y + 27, "SUPERINDO", {
      size: compact ? 8 : 10,
      fill: C.warmMuted,
      weight: 600,
      anchor: "end",
      letterSpacing: 0.4,
    }),
    ...Array.from({ length: rows }, (_, index) => {
      const rowY = y + 50 + index * ((height - 92) / rows);
      const variableWidth =
        index % 3 === 0 ? width * 0.72 : index % 3 === 1 ? width * 0.54 : width * 0.64;
      return line(x + padding, rowY, x + padding + variableWidth, rowY, {
        stroke: C.border,
      });
    }),
    line(x + padding, y + height - 28, x + width - padding, y + height - 28, {
      stroke: C.warmMuted,
      width: 2,
    }),
  ];
}

export function cropFrame(x, y, width, height, color = C.primary) {
  const length = 30;
  return [
    line(x, y, x + length, y, { stroke: color, width: 2 }),
    line(x, y, x, y + length, { stroke: color, width: 2 }),
    line(x + width, y, x + width - length, y, { stroke: color, width: 2 }),
    line(x + width, y, x + width, y + length, { stroke: color, width: 2 }),
    line(x, y + height, x + length, y + height, { stroke: color, width: 2 }),
    line(x, y + height, x, y + height - length, { stroke: color, width: 2 }),
    line(x + width, y + height, x + width - length, y + height, {
      stroke: color,
      width: 2,
    }),
    line(x + width, y + height, x + width, y + height - length, {
      stroke: color,
      width: 2,
    }),
  ];
}

export function layout(width = 1440) {
  const sidebar = 240;
  const padding = width >= 1440 ? 40 : 32;
  const contentX = sidebar + padding;
  const contentRight = width - padding;
  return {
    width,
    sidebar,
    padding,
    contentX,
    contentRight,
    contentWidth: contentRight - contentX,
  };
}

export function sidebar(active = "Dashboard", width = 1440) {
  const { sidebar: sidebarWidth } = layout(width);
  const nav = [
    ["Dashboard", "house"],
    ["Transaksi", "receipt"],
    ["Scan struk", "scan"],
    ["Profil", "user"],
  ];
  return [
    rect(0, 0, sidebarWidth, 1024, { fill: C.ink }),
    `<image href="${reverseLogoUri}" x="28" y="30" width="164" height="24" preserveAspectRatio="xMinYMid meet"/>`,
    txt(28, 80, "PERSONAL FINANCE", {
      size: 10,
      fill: C.darkMuted,
      weight: 600,
      letterSpacing: 1.7,
    }),
    ...nav.map(([label, iconName], index) => {
      const y = 112 + index * 54;
      const selected = label === active;
      return [
        selected
          ? rect(20, y, 200, 44, { fill: C.darkSurface2, radius: 10 })
          : "",
        selected
          ? rect(20, y + 9, 3, 26, { fill: C.signal, radius: 2 })
          : "",
        icon(iconName, 36, y + 12, 20, {
          color: selected ? C.surface : C.darkMuted,
          weight: selected ? "fill" : "regular",
        }),
        txt(70, y + 28, label, {
          size: 14,
          fill: selected ? C.surface : C.darkMuted,
          weight: selected ? 600 : 500,
        }),
      ];
    }),
    rect(20, 938, 200, 62, {
      fill: C.darkSurface,
      stroke: C.darkBorder,
      strokeWidth: 1,
      radius: 12,
    }),
    circle(47, 969, 16, { fill: C.primary }),
    txt(47, 974, "MS", {
      size: 10,
      fill: C.surface,
      weight: 600,
      anchor: "middle",
    }),
    txt(74, 965, "Mario Sianturi", {
      size: 13,
      fill: C.surface,
      weight: 600,
    }),
    txt(74, 983, "Akun personal", {
      size: 11,
      fill: C.darkMuted,
      weight: 500,
    }),
    icon("caret-right", 194, 961, 16, { color: C.darkMuted }),
  ];
}

export function pageHeader(
  title,
  subtitle,
  active,
  width = 1440,
  options = {},
) {
  const { contentX, contentRight } = layout(width);
  const { showScan = true, extraButton = null } = options;
  const right = [];
  let cursor = contentRight;
  if (showScan) {
    cursor -= 150;
    right.push(...button(cursor, 38, 150, "Scan struk", {
      iconName: "scan",
    }));
    cursor -= 16;
  }
  if (extraButton) {
    cursor -= extraButton.width;
    right.push(
      ...button(cursor, 38, extraButton.width, extraButton.label, {
        kind: extraButton.kind ?? "secondary",
        iconName: extraButton.iconName ?? "",
      }),
    );
    cursor -= 16;
  }
  return [
    sidebar(active, width),
    txt(contentX, 58, title, {
      size: 32,
      weight: 600,
      family: DISPLAY,
    }),
    txt(contentX, 84, subtitle, {
      size: 14,
      fill: C.secondary,
      weight: 500,
    }),
    ...right,
    line(contentX, 116, contentRight, 116, { stroke: C.border }),
  ];
}

export function transactionRow(
  x,
  y,
  width,
  merchant,
  meta,
  date,
  amount,
  options = {},
) {
  const {
    selected = false,
    color = C.primarySoft,
    iconName = "receipt",
    height = 76,
  } = options;
  return [
    selected
      ? rect(x, y, width, height, {
          fill: C.primarySoft,
          stroke: C.primary,
          strokeWidth: 1.5,
          radius: 10,
        })
      : rect(x, y, width, height, { fill: C.surface, radius: 0 }),
    circle(x + 28, y + height / 2, 18, { fill: color }),
    icon(iconName, x + 19, y + height / 2 - 9, 18, {
      color:
        color === C.expenseSoft
          ? C.expense
          : color === C.signalSoft
            ? C.signalInk
            : C.primary,
    }),
    txt(x + 58, y + 30, merchant, { size: 14, weight: 600 }),
    txt(x + 58, y + 52, meta, {
      size: 12,
      fill: C.secondary,
      weight: 500,
    }),
    txt(x + width - 144, y + 31, date, {
      size: 12,
      fill: C.secondary,
      anchor: "end",
      weight: 500,
      numeric: true,
    }),
    txt(x + width - 16, y + 31, amount, {
      size: 14,
      fill: C.expenseInk,
      anchor: "end",
      weight: 600,
      numeric: true,
    }),
    selected ? "" : line(x + 58, y + height, x + width, y + height),
  ];
}

export function statusItem(x, y, label, state = "done", dark = false) {
  const palette =
    state === "done"
      ? { dot: C.signal, ink: dark ? C.surface : C.ink, icon: "check" }
      : state === "active"
        ? { dot: C.primary, ink: dark ? C.surface : C.ink, icon: "" }
        : { dot: dark ? C.darkBorder : C.divider, ink: dark ? C.darkMuted : C.secondary, icon: "" };
  return [
    circle(x + 10, y + 10, 10, { fill: palette.dot }),
    palette.icon
      ? icon(palette.icon, x + 4, y + 4, 12, { color: C.ink })
      : state === "active"
        ? circle(x + 10, y + 10, 3, { fill: C.surface })
        : "",
    txt(x + 30, y + 15, label, {
      size: 13,
      fill: palette.ink,
      weight: state === "active" ? 600 : 500,
    }),
  ];
}

export function innerSvg(source) {
  return source
    .replace(/^<\?xml[^>]+>\s*/u, "")
    .replace(/^<svg[^>]+>/u, "")
    .replace(/<\/svg>\s*$/u, "")
    .replace(/<style>[\s\S]*?<\/style>/u, "")
    .replace(/^<rect width="\d+" height="\d+" fill="[^"]+"\/>\s*/u, "");
}

export async function writeSvgAndPng(basePath, svg) {
  const svgPath = `${basePath}.svg`;
  const pngPath = `${basePath}.png`;
  await fs.writeFile(svgPath, svg, "utf8");
  await sharp(Buffer.from(svg)).png().toFile(pngPath);
  return [svgPath, pngPath];
}
