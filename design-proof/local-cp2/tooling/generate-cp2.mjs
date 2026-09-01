import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const TOOLING_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(TOOLING_DIR, "..");
const PROJECT_ROOT = path.resolve(ROOT, "..", "..");
const runtimeRequire = createRequire(
  path.join(ROOT, "tooling-runtime", "package.json"),
);
const sharp = runtimeRequire("sharp");
const MOBILE_DIR = path.join(ROOT, "mobile");
const TESTS_DIR = path.join(ROOT, "tests");
const RUNTIME_DIR = path.join(ROOT, "tooling-runtime", "node_modules");
const LOGO_PATH = path.join(
  PROJECT_ROOT,
  "design-proof",
  "logo-r1",
  "assets",
  "lockups",
  "fintrack-ai-lockup-compact-primary.svg",
);
const SPACE_FONT_PATH = path.join(
  PROJECT_ROOT,
  "design-proof",
  "logo-r0",
  "assets",
  "fonts",
  "SpaceGrotesk-Variable.ttf",
);
const PLEX_FONT_DIR = path.join(
  RUNTIME_DIR,
  "@ibm",
  "plex",
  "IBM-Plex-Sans",
  "fonts",
  "complete",
  "woff",
);
const PLEX_FONT_PATHS = {
  regular: path.join(PLEX_FONT_DIR, "IBMPlexSans-Regular.woff"),
  medium: path.join(PLEX_FONT_DIR, "IBMPlexSans-Medium.woff"),
  semibold: path.join(PLEX_FONT_DIR, "IBMPlexSans-SemiBold.woff"),
};
const ICON_ROOT = path.join(
  RUNTIME_DIR,
  "@phosphor-icons",
  "core",
  "assets",
);

const C = {
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
  darkBorder: "#344252",
  darkMuted: "#AAB3BF",
};

const DISPLAY = "'Space Grotesk', Arial, sans-serif";
const BODY = "'IBM Plex Sans', Arial, sans-serif";
const REQUIRED_ICONS = [
  "arrow-counter-clockwise",
  "arrow-left",
  "calendar",
  "camera",
  "caret-down",
  "caret-right",
  "check",
  "check-circle",
  "clock",
  "cloud-arrow-up",
  "cloud-check",
  "coffee",
  "dots-three",
  "file-text",
  "floppy-disk",
  "fork-knife",
  "funnel",
  "house",
  "image",
  "info",
  "lightning",
  "list-checks",
  "lock-simple",
  "magnifying-glass",
  "note-pencil",
  "pencil-simple",
  "plus",
  "receipt",
  "scan",
  "shield-check",
  "shopping-bag",
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
  fs.mkdir(MOBILE_DIR, { recursive: true }),
  fs.mkdir(TESTS_DIR, { recursive: true }),
]);

const [spaceFont, plexRegular, plexMedium, plexSemibold, logoSvg] = await Promise.all([
  fs.readFile(SPACE_FONT_PATH),
  fs.readFile(PLEX_FONT_PATHS.regular),
  fs.readFile(PLEX_FONT_PATHS.medium),
  fs.readFile(PLEX_FONT_PATHS.semibold),
  fs.readFile(LOGO_PATH, "utf8"),
]);
const fontCss = `
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
const logoDataUri = `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString("base64")}`;

const iconBodies = new Map();
for (const weight of ["regular", "fill"]) {
  for (const name of REQUIRED_ICONS) {
    const filePath = path.join(ICON_ROOT, weight, `${name}.svg`);
    try {
      const source = await fs.readFile(filePath, "utf8");
      const body = source
        .replace(/^<svg[^>]*>/u, "")
        .replace(/<\/svg>\s*$/u, "");
      iconBodies.set(`${weight}:${name}`, body);
    } catch {
      if (weight === "regular") {
        throw new Error(`Missing required Phosphor icon: ${name}`);
      }
    }
  }
}

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function rect(x, y, width, height, options = {}) {
  const {
    fill = "none",
    stroke = "none",
    sw = 1,
    radius = 0,
    opacity = 1,
    dash = "",
  } = options;
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}"
    fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}"
    ${dash ? `stroke-dasharray="${dash}"` : ""}/>`;
}

function line(x1, y1, x2, y2, options = {}) {
  const {
    stroke = C.divider,
    sw = 1,
    opacity = 1,
    dash = "",
  } = options;
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
    stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round"
    opacity="${opacity}" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`;
}

function circle(cx, cy, radius, options = {}) {
  const {
    fill = "none",
    stroke = "none",
    sw = 1,
    opacity = 1,
  } = options;
  return `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${fill}"
    stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}"/>`;
}

function txt(x, y, value, options = {}) {
  const {
    size = 14,
    fill = C.ink,
    weight = 400,
    family = BODY,
    anchor = "start",
    letter = 0,
    opacity = 1,
    numeric = false,
  } = options;
  return `<text x="${x}" y="${y}" fill="${fill}" font-family="${family}"
    font-size="${size}" font-weight="${weight}" text-anchor="${anchor}"
    letter-spacing="${letter}" opacity="${opacity}"
    ${numeric ? 'style="font-variant-numeric: tabular-nums;"' : ""}>${esc(value)}</text>`;
}

function multiline(x, y, values, options = {}) {
  const {
    lineHeight = Math.round((options.size ?? 14) * 1.45),
  } = options;
  return values
    .map((value, index) => txt(x, y + index * lineHeight, value, options))
    .join("");
}

function icon(x, y, name, size = 20, color = C.secondary, weight = "regular") {
  const body =
    iconBodies.get(`${weight}:${name}`) ??
    iconBodies.get(`regular:${name}`);
  const scale = size / 256;
  return `<g transform="translate(${x} ${y}) scale(${scale})"
    color="${color}" fill="${color}">${body.replaceAll("currentColor", color)}</g>`;
}

function badge(x, y, label, options = {}) {
  const {
    fill = C.primarySoft,
    color = C.primary,
    width = Math.max(54, label.length * 6.5 + 20),
    height = 24,
    iconName = "",
  } = options;
  const iconSpace = iconName ? 15 : 0;
  return [
    rect(x, y, width, height, { fill, radius: 8 }),
    iconName
      ? icon(x + 8, y + (height - 14) / 2, iconName, 14, color)
      : "",
    txt(x + width / 2 + iconSpace / 2, y + height / 2 + 4, label, {
      size: 11,
      fill: color,
      weight: 600,
      anchor: "middle",
    }),
  ].join("");
}

function button(x, y, width, label, options = {}) {
  const {
    variant = "primary",
    height = 48,
    iconName = "",
  } = options;
  const styles = {
    primary: {
      fill: C.primary,
      stroke: C.primary,
      text: C.surface,
    },
    secondary: {
      fill: C.surface,
      stroke: C.primary,
      text: C.primary,
    },
    tertiary: {
      fill: "none",
      stroke: "none",
      text: C.primary,
    },
    danger: {
      fill: C.error,
      stroke: C.error,
      text: C.surface,
    },
    quietDanger: {
      fill: C.surface,
      stroke: C.error,
      text: C.error,
    },
  }[variant];
  const iconShift = iconName ? 10 : 0;
  return [
    rect(x, y, width, height, {
      fill: styles.fill,
      stroke: styles.stroke,
      sw: variant === "tertiary" ? 0 : 1,
      radius: 12,
    }),
    iconName
      ? icon(x + 15, y + (height - 18) / 2, iconName, 18, styles.text)
      : "",
    txt(x + width / 2 + iconShift, y + height / 2 + 5, label, {
      size: 15,
      fill: styles.text,
      weight: 600,
      anchor: "middle",
    }),
  ].join("");
}

function field(x, y, width, label, value, options = {}) {
  const {
    height = 48,
    warning = false,
    suffix = "",
    iconName = "",
  } = options;
  const stroke = warning ? C.warning : C.border;
  return [
    txt(x, y, label, {
      size: 12,
      fill: C.secondary,
      weight: 500,
    }),
    rect(x, y + 8, width, height, {
      fill: C.surface,
      stroke,
      sw: warning ? 1.5 : 1,
      radius: 10,
    }),
    iconName
      ? icon(x + 13, y + 8 + (height - 18) / 2, iconName, 18, C.secondary)
      : "",
    txt(x + (iconName ? 42 : 14), y + 8 + height / 2 + 5, value, {
      size: 14,
      weight: 500,
      numeric: value.includes("Rp"),
    }),
    suffix
      ? txt(x + width - 13, y + 8 + height / 2 + 4, suffix, {
          size: 11,
          fill: C.secondary,
          weight: 500,
          anchor: "end",
        })
      : "",
    warning
      ? badge(x + width - 108, y - 10, "Perlu diperiksa", {
          fill: C.warningSoft,
          color: C.warning,
          width: 108,
          height: 22,
        })
      : "",
  ].join("");
}

function statusBar(width, dark = false) {
  const color = dark ? C.surface : C.ink;
  return [
    txt(18, 18, "09:41", { size: 11, fill: color, weight: 600 }),
    rect(width - 68, 11, 16, 7, {
      fill: "none",
      stroke: color,
      sw: 1.2,
      radius: 2,
    }),
    rect(width - 49, 11, 16, 7, {
      fill: "none",
      stroke: color,
      sw: 1.2,
      radius: 2,
    }),
    rect(width - 28, 10, 16, 9, {
      fill: "none",
      stroke: color,
      sw: 1.2,
      radius: 2,
    }),
    rect(width - 10, 13, 2, 4, { fill: color, radius: 1 }),
  ].join("");
}

function brandHeader(width) {
  return [
    statusBar(width),
    `<image href="${logoDataUri}" x="16" y="42" width="164" height="24"/>`,
    circle(width - 34, 54, 18, {
      fill: C.primarySoft,
      stroke: C.border,
    }),
    txt(width - 34, 58, "MS", {
      size: 10,
      fill: C.primary,
      weight: 600,
      anchor: "middle",
    }),
  ].join("");
}

function flowHeader(width, title, options = {}) {
  const {
    dark = false,
    action = "",
    actionColor = dark ? C.surface : C.primary,
  } = options;
  const color = dark ? C.surface : C.ink;
  return [
    statusBar(width, dark),
    icon(16, 42, "arrow-left", 20, color),
    txt(46, 57, title, {
      size: 18,
      fill: color,
      weight: 600,
      family: DISPLAY,
    }),
    action
      ? txt(width - 16, 56, action, {
          size: 13,
          fill: actionColor,
          weight: 600,
          anchor: "end",
        })
      : "",
  ].join("");
}

function progressHeader(step, dark = false, width = 390) {
  const names = ["Foto", "Persiapan", "Pemeriksaan AI", "Tinjau"];
  const gap = 6;
  const segmentWidth = (width - 32 - gap * 3) / 4;
  const muted = dark ? C.darkMuted : C.secondary;
  return [
    txt(16, 91, `LANGKAH ${step} DARI 4`, {
      size: 10,
      fill: muted,
      weight: 600,
      letter: 1.1,
    }),
    txt(width - 16, 91, names[step - 1], {
      size: 11,
      fill: dark ? C.signal : C.primary,
      weight: 600,
      anchor: "end",
    }),
    ...Array.from({ length: 4 }, (_, index) => {
      const x = 16 + index * (segmentWidth + gap);
      const completed = index < step - 1;
      const active = index === step - 1;
      return rect(x, 102, segmentWidth, 4, {
        fill: completed
          ? C.signal
          : active
            ? dark
              ? C.surface
              : C.primary
            : dark
              ? C.darkBorder
              : C.disabled,
        radius: 2,
      });
    }),
  ].join("");
}

function bottomNav(active, width = 390) {
  const items = [
    ["Dashboard", "house"],
    ["Transaksi", "receipt"],
    ["Scan", "scan"],
    ["Profil", "user"],
  ];
  const cellWidth = width / 4;
  return [
    rect(0, 764, width, 80, {
      fill: C.surface,
      stroke: C.divider,
      sw: 1,
    }),
    ...items.map(([label, iconName], index) => {
      const center = index * cellWidth + cellWidth / 2;
      const selected = label === active;
      const color = selected ? C.primary : C.secondary;
      return [
        iconName === "scan"
          ? rect(center - 28, 772, 56, 34, {
              fill: selected ? C.primarySoft : C.canvasSubtle,
              radius: 12,
            })
          : "",
        icon(
          center - 10,
          iconName === "scan" ? 779 : 777,
          iconName,
          20,
          color,
          selected && iconBodies.has(`fill:${iconName}`) ? "fill" : "regular",
        ),
        txt(center, 828, label, {
          size: 11,
          fill: color,
          weight: selected ? 600 : 500,
          anchor: "middle",
        }),
      ].join("");
    }),
  ].join("");
}

function categoryMark(x, y, color, iconName) {
  return [
    rect(x, y, 36, 36, {
      fill: color.soft,
      radius: 10,
    }),
    icon(x + 9, y + 9, iconName, 18, color.strong),
  ].join("");
}

function transactionRow(x, y, width, data, options = {}) {
  const {
    divider = true,
    selected = false,
    height = 62,
  } = options;
  const category = {
    food: { soft: C.expenseSoft, strong: C.expense, icon: "fork-knife" },
    shop: { soft: "#F0EAF5", strong: C.chartPurple, icon: "shopping-bag" },
    transport: { soft: C.primarySoft, strong: C.primary, icon: "train" },
    bill: { soft: C.warningSoft, strong: C.chartGold, icon: "lightning" },
  }[data.category];
  return [
    selected
      ? rect(x, y, width, height, {
          fill: C.primarySoft,
          stroke: C.primary,
          sw: 1.5,
          radius: 12,
        })
      : "",
    categoryMark(x + 10, y + 13, category, category.icon),
    txt(x + 58, y + 27, data.merchant, {
      size: 14,
      weight: 600,
    }),
    txt(x + 58, y + 48, `${data.meta} · ${data.source}`, {
      size: 11,
      fill: C.secondary,
      weight: 400,
    }),
    txt(x + width - 10, y + 35, data.amount, {
      size: 13,
      fill: C.expenseInk,
      weight: 600,
      anchor: "end",
      numeric: true,
    }),
    divider && !selected
      ? line(x + 58, y + height, x + width, y + height, {
          stroke: C.divider,
        })
      : "",
  ].join("");
}

function cropFrame(x, y, width, height, options = {}) {
  const {
    dark = false,
    lineColor = dark ? C.surface : C.primary,
    background = dark ? C.darkSurface : C.surface,
  } = options;
  const length = 24;
  const inset = 12;
  const points = [
    [x + inset, y + inset, 1, 1],
    [x + width - inset, y + inset, -1, 1],
    [x + inset, y + height - inset, 1, -1],
    [x + width - inset, y + height - inset, -1, -1],
  ];
  return [
    rect(x, y, width, height, {
      fill: background,
      stroke: dark ? C.darkBorder : C.border,
      radius: 18,
    }),
    ...points.flatMap(([px, py, dx, dy]) => [
      line(px, py, px + dx * length, py, {
        stroke: lineColor,
        sw: 2,
      }),
      line(px, py, px, py + dy * length, {
        stroke: lineColor,
        sw: 2,
      }),
    ]),
  ].join("");
}

function receiptVisual(x, y, width, height, options = {}) {
  const { compact = false } = options;
  const lineCount = compact ? 3 : 7;
  return [
    rect(x, y, width, height, {
      fill: "#FFFEFA",
      stroke: "#CEC9BE",
      radius: 5,
    }),
    rect(x + 14, y + 14, width * 0.38, 7, {
      fill: "#A9A69E",
      radius: 3,
    }),
    txt(x + width - 14, y + 21, "SUPERINDO", {
      size: Math.max(7, width / 18),
      fill: C.warmMuted,
      weight: 600,
      anchor: "end",
      letter: 0.4,
    }),
    ...Array.from({ length: lineCount }, (_, index) =>
      line(
        x + 14,
        y + 39 + index * ((height - 76) / Math.max(1, lineCount - 1)),
        x + width - 14 - (index % 3) * 16,
        y + 39 + index * ((height - 76) / Math.max(1, lineCount - 1)),
        { stroke: "#D8D4CB", sw: 1 },
      ),
    ),
    line(x + 14, y + height - 27, x + width - 14, y + height - 27, {
      stroke: "#8F8B83",
      sw: 2,
    }),
  ].join("");
}

function checklistItem(x, y, label, state, dark = false) {
  const isDone = state === "done";
  const isActive = state === "active";
  const color = isDone
    ? C.signalInk
    : isActive
      ? dark
        ? C.surface
        : C.primary
      : dark
        ? C.darkMuted
        : C.secondary;
  return [
    circle(x + 9, y + 9, 9, {
      fill: isDone
        ? C.signal
        : isActive
          ? dark
            ? C.primary
            : C.primarySoft
          : dark
            ? C.darkBorder
            : C.disabled,
    }),
    isDone
      ? icon(x + 3, y + 3, "check", 12, C.signalInk)
      : isActive
        ? circle(x + 9, y + 9, 3, { fill: color })
        : "",
    txt(x + 30, y + 14, label, {
      size: 13,
      fill: dark ? C.surface : C.ink,
      weight: isActive ? 600 : 500,
    }),
  ].join("");
}

function svgDocument(width, height, body, options = {}) {
  const {
    background = C.canvas,
    title = "Fintrack AI CP2",
  } = options;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"
  viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(title)}">
  <style>${fontCss}</style>
  <rect width="${width}" height="${height}" fill="${background}"/>
  ${body}
</svg>`;
}

function mobileDashboard(width = 390) {
  const contentWidth = width - 32;
  const actionGap = 12;
  const actionWidth = (contentWidth - actionGap) / 2;
  return svgDocument(
    width,
    844,
    [
      brandHeader(width),
      txt(16, 110, "Ringkasan Juli", {
        size: 28,
        weight: 600,
        family: DISPLAY,
      }),
      txt(16, 136, "JULI 2026", {
        size: 11,
        fill: C.secondary,
        weight: 600,
        letter: 1.2,
      }),
      txt(16, 176, "Rp3.482.500", {
        size: 32,
        weight: 600,
        family: DISPLAY,
        numeric: true,
      }),
      icon(16, 186, "trend-up", 16, C.expenseInk),
      txt(38, 198, "Sedikit lebih tinggi dari Juni", {
        size: 12,
        fill: C.secondary,
        weight: 500,
      }),
      button(16, 214, actionWidth, "Tambah manual", {
        variant: "secondary",
        height: 46,
        iconName: "plus",
      }),
      button(16 + actionWidth + actionGap, 214, actionWidth, "Scan struk", {
        height: 46,
        iconName: "scan",
      }),
      rect(16, 278, contentWidth, 104, {
        fill: C.primarySoft,
        radius: 16,
      }),
      rect(16, 294, 3, 72, {
        fill: C.primary,
        radius: 2,
      }),
      badge(32, 290, "Insight mingguan", {
        fill: C.surface,
        color: C.primary,
        width: 120,
      }),
      txt(32, 334, "Makan naik sedikit", {
        size: 18,
        weight: 600,
        family: DISPLAY,
      }),
      txt(32, 357, "Naik Rp84.000 dibanding minggu lalu.", {
        size: 13,
        fill: C.secondary,
      }),
      txt(16, 414, "Distribusi kategori", {
        size: 18,
        weight: 600,
        family: DISPLAY,
      }),
      txt(width - 16, 414, "Lihat detail", {
        size: 12,
        fill: C.primary,
        weight: 600,
        anchor: "end",
      }),
      rect(16, 430, contentWidth, 142, {
        fill: C.surface,
        stroke: C.border,
        radius: 16,
      }),
      ...[
        ["Makan & minum", "Rp1.214.000", 0.66, C.expense],
        ["Belanja", "Rp824.500", 0.45, C.chartPurple],
        ["Tagihan", "Rp760.000", 0.41, C.chartGold],
      ].map(([label, amount, ratio, color], index) => {
        const y = 455 + index * 39;
        return [
          txt(30, y, label, {
            size: 12,
            fill: C.secondary,
            weight: 500,
          }),
          txt(width - 30, y, amount, {
            size: 12,
            weight: 600,
            anchor: "end",
            numeric: true,
          }),
          rect(30, y + 10, contentWidth - 60, 6, {
            fill: C.disabled,
            radius: 3,
          }),
          rect(30, y + 10, (contentWidth - 60) * ratio, 6, {
            fill: color,
            radius: 3,
          }),
        ].join("");
      }),
      txt(16, 607, "Transaksi terbaru", {
        size: 18,
        weight: 600,
        family: DISPLAY,
      }),
      txt(width - 16, 607, "Semua", {
        size: 12,
        fill: C.primary,
        weight: 600,
        anchor: "end",
      }),
      rect(16, 620, contentWidth, 130, {
        fill: C.surface,
        stroke: C.border,
        radius: 14,
      }),
      transactionRow(
        18,
        621,
        contentWidth - 4,
        {
          merchant: "Superindo",
          meta: "12 Jul · Belanja",
          source: "AI · Struk",
          amount: "−Rp326.500",
          category: "shop",
        },
        { height: 63 },
      ),
      transactionRow(
        18,
        685,
        contentWidth - 4,
        {
          merchant: "Kedai Sela",
          meta: "11 Jul · Makan",
          source: "AI · Struk",
          amount: "−Rp48.000",
          category: "food",
        },
        { divider: false, height: 63 },
      ),
      bottomNav("Dashboard", width),
    ].join(""),
    { title: "Fintrack AI mobile dashboard high fidelity CP2 R0" },
  );
}

function mobileDashboardStates(width = 390) {
  const cw = width - 32;
  return svgDocument(
    width,
    844,
    [
      brandHeader(width),
      txt(16, 110, "Kondisi dashboard", {
        size: 26,
        weight: 600,
        family: DISPLAY,
      }),
      txt(16, 134, "Status tetap jelas tanpa mengubah struktur utama.", {
        size: 12,
        fill: C.secondary,
      }),
      txt(16, 169, "LOADING", {
        size: 10,
        fill: C.secondary,
        weight: 600,
        letter: 1.1,
      }),
      rect(16, 180, cw, 126, {
        fill: C.surface,
        stroke: C.border,
        radius: 14,
      }),
      badge(width - 98, 193, "Memuat", {
        fill: C.signalSoft,
        color: C.signalInk,
        width: 66,
      }),
      rect(30, 199, 92, 10, {
        fill: C.disabled,
        radius: 5,
      }),
      rect(30, 222, 178, 27, {
        fill: C.disabled,
        radius: 7,
      }),
      rect(30, 263, cw - 28, 26, {
        fill: C.canvasSubtle,
        stroke: C.divider,
        radius: 8,
      }),
      txt(16, 338, "EMPTY", {
        size: 10,
        fill: C.secondary,
        weight: 600,
        letter: 1.1,
      }),
      rect(16, 349, cw, 150, {
        fill: C.surface,
        stroke: C.border,
        radius: 14,
      }),
      icon(30, 373, "receipt", 26, C.primary),
      txt(70, 383, "Belum ada transaksi bulan ini", {
        size: 15,
        weight: 600,
      }),
      multiline(
        70,
        406,
        ["Tambahkan secara manual atau scan", "struk pertamamu."],
        { size: 12, fill: C.secondary, lineHeight: 18 },
      ),
      button(70, 447, 154, "Tambah transaksi", {
        height: 38,
      }),
      txt(16, 531, "OFFLINE / CACHED", {
        size: 10,
        fill: C.secondary,
        weight: 600,
        letter: 1.1,
      }),
      rect(16, 542, cw, 188, {
        fill: C.surface,
        stroke: C.border,
        radius: 14,
      }),
      rect(28, 554, cw - 24, 62, {
        fill: C.primarySoft,
        radius: 10,
      }),
      icon(40, 575, "wifi-slash", 20, C.primary),
      txt(72, 578, "Kamu sedang offline", {
        size: 13,
        weight: 600,
      }),
      txt(72, 598, "Data tersimpan masih bisa dilihat.", {
        size: 11,
        fill: C.secondary,
      }),
      badge(width - 98, 567, "Offline", {
        fill: C.surface,
        color: C.primary,
        width: 62,
      }),
      transactionRow(
        28,
        630,
        cw - 24,
        {
          merchant: "PLN",
          meta: "08 Jul · Tagihan",
          source: "Tersimpan",
          amount: "−Rp350.000",
          category: "bill",
        },
        { divider: false, height: 68 },
      ),
      bottomNav("Dashboard", width),
    ].join(""),
    { title: "Fintrack AI mobile dashboard states high fidelity CP2 R0" },
  );
}

function mobileTransactions(width = 390) {
  const cw = width - 32;
  const filterWidth = 50;
  return svgDocument(
    width,
    844,
    [
      brandHeader(width),
      txt(16, 110, "Transaksi", {
        size: 28,
        weight: 600,
        family: DISPLAY,
      }),
      rect(16, 126, cw - filterWidth - 10, 46, {
        fill: C.surface,
        stroke: C.border,
        radius: 12,
      }),
      icon(30, 140, "magnifying-glass", 18, C.secondary),
      txt(56, 154, "Cari merchant atau catatan", {
        size: 12,
        fill: C.secondary,
      }),
      rect(width - 16 - filterWidth, 126, filterWidth, 46, {
        fill: C.surface,
        stroke: C.primary,
        radius: 12,
      }),
      icon(width - 16 - filterWidth + 15, 140, "funnel", 18, C.primary),
      txt(16, 201, "JULI 2026", {
        size: 10,
        fill: C.secondary,
        weight: 600,
        letter: 1.1,
      }),
      txt(width - 16, 201, "22 transaksi · Rp3.482.500", {
        size: 12,
        weight: 600,
        anchor: "end",
        numeric: true,
      }),
      txt(16, 231, "Hari ini", {
        size: 14,
        weight: 600,
      }),
      rect(16, 242, cw, 132, {
        fill: C.surface,
        stroke: C.border,
        radius: 14,
      }),
      transactionRow(
        18,
        243,
        cw - 4,
        {
          merchant: "Superindo",
          meta: "12 Jul · Belanja",
          source: "AI · Struk",
          amount: "−Rp326.500",
          category: "shop",
        },
        { height: 64 },
      ),
      transactionRow(
        18,
        308,
        cw - 4,
        {
          merchant: "Kedai Sela",
          meta: "12 Jul · Makan",
          source: "AI · Struk",
          amount: "−Rp48.000",
          category: "food",
        },
        { divider: false, height: 64 },
      ),
      txt(16, 408, "Minggu ini", {
        size: 14,
        weight: 600,
      }),
      rect(16, 419, cw, 324, {
        fill: C.surface,
        stroke: C.border,
        radius: 14,
      }),
      ...[
        {
          merchant: "KRL",
          meta: "10 Jul · Transportasi",
          source: "Manual",
          amount: "−Rp20.000",
          category: "transport",
        },
        {
          merchant: "PLN",
          meta: "08 Jul · Tagihan",
          source: "AI · Struk",
          amount: "−Rp350.000",
          category: "bill",
        },
        {
          merchant: "Kedai Sela",
          meta: "07 Jul · Makan",
          source: "AI · Struk",
          amount: "−Rp64.000",
          category: "food",
        },
        {
          merchant: "Superindo",
          meta: "05 Jul · Belanja",
          source: "AI · Struk",
          amount: "−Rp284.000",
          category: "shop",
        },
        {
          merchant: "Kedai Sela",
          meta: "03 Jul · Makan",
          source: "Manual",
          amount: "−Rp42.000",
          category: "food",
        },
      ].map((item, index) =>
        transactionRow(18, 420 + index * 64, cw - 4, item, {
          divider: index !== 4,
          height: 64,
        }),
      ),
      bottomNav("Transaksi", width),
    ].join(""),
    { title: "Fintrack AI mobile transactions high fidelity CP2 R0" },
  );
}

function mobileTransactionEdit(width = 390) {
  const cw = width - 32;
  const half = (cw - 12) / 2;
  return svgDocument(
    width,
    844,
    [
      flowHeader(width, "Edit transaksi", {
        action: "Simpan",
      }),
      rect(16, 84, cw, 88, {
        fill: C.canvasSubtle,
        stroke: C.border,
        radius: 16,
      }),
      badge(30, 98, "AI · Struk", {
        width: 82,
      }),
      txt(30, 150, "−Rp326.500", {
        size: 26,
        fill: C.expenseInk,
        weight: 600,
        family: DISPLAY,
        numeric: true,
      }),
      txt(width - 30, 148, "12 Jul 2026", {
        size: 12,
        fill: C.secondary,
        anchor: "end",
      }),
      field(16, 199, cw, "Merchant", "Superindo", {
        iconName: "shopping-bag",
      }),
      field(16, 283, cw, "Total pengeluaran", "Rp326.500", {
        suffix: "IDR",
      }),
      field(16, 367, half, "Tanggal", "12 Jul 2026", {
        iconName: "calendar",
      }),
      field(28 + half, 367, half, "Kategori", "Belanja", {
        iconName: "tag",
      }),
      field(16, 451, cw, "Catatan", "Belanja kebutuhan rumah", {
        height: 64,
        iconName: "note-pencil",
      }),
      rect(16, 552, cw, 58, {
        fill: C.primarySoft,
        radius: 10,
      }),
      icon(30, 571, "shield-check", 20, C.primary),
      txt(60, 574, "Hasil scan sudah ditinjau", {
        size: 13,
        fill: C.primary,
        weight: 600,
      }),
      txt(60, 594, "Semua field tetap dapat diedit.", {
        size: 11,
        fill: C.secondary,
      }),
      icon(16, 640, "trash", 18, C.error),
      txt(42, 654, "Hapus transaksi", {
        size: 13,
        fill: C.error,
        weight: 600,
      }),
      rect(0, 684, width, 160, {
        fill: C.surface,
        stroke: C.divider,
      }),
      button(16, 704, cw, "Simpan perubahan", {
        height: 50,
        iconName: "floppy-disk",
      }),
      txt(width / 2, 783, "Perubahan baru disimpan setelah kamu menekan tombol.", {
        size: 11,
        fill: C.secondary,
        anchor: "middle",
      }),
    ].join(""),
    { title: "Fintrack AI mobile transaction edit high fidelity CP2 R0" },
  );
}

function mobileScanStart(width = 390) {
  const cw = width - 32;
  return svgDocument(
    width,
    844,
    [
      flowHeader(width, "Scan struk", { action: "Batal" }),
      progressHeader(1, false, width),
      txt(16, 153, "Foto strukmu", {
        size: 28,
        weight: 600,
        family: DISPLAY,
      }),
      txt(16, 181, "dengan jelas", {
        size: 28,
        weight: 600,
        family: DISPLAY,
      }),
      txt(16, 205, "Pastikan seluruh struk masuk ke dalam bingkai.", {
        size: 12,
        fill: C.secondary,
      }),
      cropFrame(16, 224, cw, 264),
      circle(width / 2, 338, 30, {
        fill: C.primarySoft,
      }),
      icon(width / 2 - 13, 325, "camera", 26, C.primary),
      txt(width / 2, 387, "Belum ada foto dipilih", {
        size: 13,
        fill: C.secondary,
        weight: 500,
        anchor: "middle",
      }),
      rect(16, 504, cw, 66, {
        fill: C.primarySoft,
        radius: 12,
      }),
      icon(30, 526, "shield-check", 20, C.primary),
      multiline(
        62,
        530,
        [
          "Pastikan struk tidak menampilkan nomor kartu",
          "lengkap sebelum upload.",
        ],
        {
          size: 12,
          lineHeight: 18,
          weight: 500,
        },
      ),
      button(16, 594, cw, "Ambil foto", {
        height: 48,
        iconName: "camera",
      }),
      button(16, 654, cw, "Pilih dari galeri", {
        variant: "secondary",
        height: 48,
        iconName: "image",
      }),
      txt(width / 2, 735, "Foto akan dikompres sebelum diunggah.", {
        size: 11,
        fill: C.secondary,
        anchor: "middle",
      }),
    ].join(""),
    { title: "Fintrack AI mobile scan start high fidelity CP2 R0" },
  );
}

function mobileScanUpload(width = 390) {
  const cw = width - 32;
  return svgDocument(
    width,
    844,
    [
      flowHeader(width, "Menyiapkan struk", { action: "Batal" }),
      progressHeader(2, false, width),
      cropFrame(16, 132, cw, 300),
      receiptVisual(width / 2 - 62, 151, 124, 256),
      badge(width - 104, 392, "412 KB", {
        fill: C.signalSoft,
        color: C.signalInk,
        width: 72,
        iconName: "check",
      }),
      txt(16, 468, "Menyiapkan foto dengan aman", {
        size: 21,
        weight: 600,
        family: DISPLAY,
      }),
      multiline(
        16,
        493,
        [
          "Ukuran foto diperkecil sebelum upload agar",
          "penyimpanan tetap efisien.",
        ],
        {
          size: 12,
          fill: C.secondary,
          lineHeight: 18,
        },
      ),
      line(25, 547, 25, 657, {
        stroke: C.divider,
        sw: 2,
      }),
      checklistItem(16, 542, "Memeriksa format foto", "done"),
      checklistItem(16, 588, "Mengompres foto", "done"),
      checklistItem(16, 634, "Mengunggah dengan aman", "active"),
      rect(16, 694, cw, 54, {
        fill: C.canvasSubtle,
        stroke: C.border,
        radius: 10,
      }),
      icon(30, 710, "info", 18, C.secondary),
      multiline(
        58,
        714,
        [
          "Belum ada transaksi yang disimpan.",
          "Kamu masih dapat membatalkan.",
        ],
        {
          size: 11,
          fill: C.secondary,
          lineHeight: 17,
        },
      ),
    ].join(""),
    { title: "Fintrack AI mobile scan upload high fidelity CP2 R0" },
  );
}

function mobileScanProcessing(width = 390) {
  const cw = width - 32;
  return svgDocument(
    width,
    844,
    [
      flowHeader(width, "Memeriksa struk", {
        dark: true,
        action: "Batal",
      }),
      progressHeader(3, true, width),
      cropFrame(16, 132, cw, 344, {
        dark: true,
        lineColor: C.signal,
      }),
      receiptVisual(width / 2 - 66, 158, 132, 286),
      line(44, 318, width - 44, 318, {
        stroke: C.signal,
        sw: 2,
      }),
      badge(width / 2 - 58, 435, "Membaca struk", {
        fill: C.signalSoft,
        color: C.signalInk,
        width: 116,
      }),
      txt(16, 520, "AI sedang menyusun hasil", {
        size: 22,
        fill: C.surface,
        weight: 600,
        family: DISPLAY,
      }),
      multiline(
        16,
        547,
        [
          "Kamu akan meninjau merchant, total, tanggal,",
          "dan kategori sebelum transaksi disimpan.",
        ],
        {
          size: 12,
          fill: C.darkMuted,
          lineHeight: 18,
        },
      ),
      line(25, 607, 25, 710, {
        stroke: C.darkBorder,
        sw: 2,
      }),
      checklistItem(16, 600, "Foto dikompres", "done", true),
      checklistItem(16, 645, "Diunggah dengan aman", "done", true),
      checklistItem(16, 690, "Membaca dan mengelompokkan data", "active", true),
      txt(width / 2, 777, "Tidak ada persentase atau confidence palsu.", {
        size: 11,
        fill: C.darkMuted,
        anchor: "middle",
      }),
    ].join(""),
    {
      background: C.ink,
      title: "Fintrack AI focused inspection high fidelity CP2 R0",
    },
  );
}

function mobileScanReview(width = 390) {
  const cw = width - 32;
  const half = (cw - 12) / 2;
  return svgDocument(
    width,
    844,
    [
      flowHeader(width, "Tinjau hasil scan"),
      progressHeader(4, false, width),
      txt(16, 132, "Periksa sebelum transaksi disimpan.", {
        size: 12,
        fill: C.secondary,
      }),
      rect(16, 148, cw, 64, {
        fill: C.surface,
        stroke: C.border,
        radius: 12,
      }),
      receiptVisual(28, 158, 38, 44, { compact: true }),
      txt(80, 176, "Struk Superindo", {
        size: 14,
        weight: 600,
      }),
      txt(80, 195, "412 KB · siap ditinjau", {
        size: 11,
        fill: C.secondary,
      }),
      badge(width - 106, 167, "AI · Struk", {
        width: 74,
      }),
      field(16, 239, cw, "Merchant", "Superindo"),
      field(16, 322, cw, "Total pengeluaran", "Rp326.500", {
        suffix: "IDR",
      }),
      field(16, 405, half, "Tanggal", "12 Jul 2026"),
      field(28 + half, 405, half, "Kategori", "Belanja", {
        warning: true,
      }),
      rect(16, 489, cw, 50, {
        fill: C.surface,
        stroke: C.border,
        radius: 10,
      }),
      icon(30, 505, "list-checks", 18, C.primary),
      txt(58, 519, "5 item terdeteksi", {
        size: 13,
        weight: 600,
      }),
      txt(width - 32, 519, "Buka", {
        size: 12,
        fill: C.primary,
        weight: 600,
        anchor: "end",
      }),
      rect(16, 557, cw, 62, {
        fill: C.warningSoft,
        radius: 10,
      }),
      icon(30, 578, "warning", 20, C.warning),
      multiline(
        62,
        582,
        [
          "Kategori perlu diperiksa karena beberapa",
          "item tidak terbaca penuh.",
        ],
        {
          size: 11,
          fill: C.warning,
          weight: 500,
          lineHeight: 17,
        },
      ),
      rect(0, 674, width, 170, {
        fill: C.surface,
        stroke: C.divider,
      }),
      button(16, 696, cw, "Simpan transaksi", {
        height: 50,
        iconName: "floppy-disk",
      }),
      txt(width / 2, 779, "Semua field tetap dapat diedit.", {
        size: 11,
        fill: C.secondary,
        anchor: "middle",
      }),
    ].join(""),
    { title: "Fintrack AI mobile scan review high fidelity CP2 R0" },
  );
}

function mobileScanQuota(width = 390) {
  const cw = width - 32;
  return svgDocument(
    width,
    844,
    [
      flowHeader(width, "Scan belum tersedia"),
      rect(16, 92, cw, 154, {
        fill: C.warningSoft,
        stroke: "#E7C482",
        radius: 16,
      }),
      circle(46, 126, 18, {
        fill: C.surface,
      }),
      icon(36, 116, "warning", 20, C.warning),
      txt(76, 124, "Pemindaian AI sedang sibuk", {
        size: 16,
        fill: C.warning,
        weight: 600,
        family: DISPLAY,
      }),
      multiline(
        76,
        150,
        [
          "Transaksi belum disimpan.",
          "Kamu dapat mencoba lagi nanti.",
        ],
        {
          size: 12,
          fill: C.warning,
          lineHeight: 18,
        },
      ),
      line(32, 204, width - 32, 204, {
        stroke: "#E7C482",
      }),
      txt(32, 228, "Tidak ada detail teknis atau kode error.", {
        size: 11,
        fill: C.warning,
      }),
      txt(16, 282, "Foto tetap tersedia", {
        size: 18,
        weight: 600,
        family: DISPLAY,
      }),
      rect(16, 298, cw, 76, {
        fill: C.surface,
        stroke: C.border,
        radius: 12,
      }),
      receiptVisual(28, 310, 44, 50, { compact: true }),
      txt(88, 326, "Struk Superindo", {
        size: 14,
        weight: 600,
      }),
      txt(88, 349, "412 KB · belum disimpan", {
        size: 11,
        fill: C.secondary,
      }),
      badge(width - 136, 324, "Tersedia sementara", {
        fill: C.signalSoft,
        color: C.signalInk,
        width: 104,
        height: 22,
      }),
      txt(16, 420, "Lanjutkan tanpa AI", {
        size: 21,
        weight: 600,
        family: DISPLAY,
      }),
      multiline(
        16,
        448,
        [
          "Isi merchant, total, tanggal, dan kategori secara",
          "manual tanpa memilih ulang foto.",
        ],
        {
          size: 12,
          fill: C.secondary,
          lineHeight: 18,
        },
      ),
      button(16, 520, cw, "Masukkan data manual", {
        height: 50,
        iconName: "pencil-simple",
      }),
      button(16, 584, cw, "Coba scan lagi nanti", {
        variant: "secondary",
        height: 50,
        iconName: "arrow-counter-clockwise",
      }),
      txt(width / 2, 674, "Foto dapat dihapus sebelum kamu keluar.", {
        size: 11,
        fill: C.secondary,
        anchor: "middle",
      }),
    ].join(""),
    { title: "Fintrack AI mobile AI quota fallback high fidelity CP2 R0" },
  );
}

function mobileDestructive(width = 390) {
  const cw = width - 32;
  return svgDocument(
    width,
    844,
    [
      flowHeader(width, "Pola konfirmasi"),
      txt(16, 88, "Risiko berbeda membutuhkan friction yang berbeda.", {
        size: 12,
        fill: C.secondary,
      }),
      txt(16, 126, "HAPUS TRANSAKSI", {
        size: 10,
        fill: C.secondary,
        weight: 600,
        letter: 1.1,
      }),
      rect(16, 138, cw, 198, {
        fill: C.surface,
        stroke: C.border,
        radius: 16,
      }),
      icon(30, 158, "trash", 22, C.error),
      txt(64, 175, "Hapus transaksi Superindo?", {
        size: 16,
        weight: 600,
        family: DISPLAY,
      }),
      multiline(
        30,
        207,
        [
          "Transaksi Rp326.500 akan dihapus dari",
          "riwayat pengeluaran Juli.",
        ],
        {
          size: 12,
          fill: C.secondary,
          lineHeight: 18,
        },
      ),
      button(30, 262, 124, "Batal", {
        variant: "secondary",
        height: 44,
      }),
      button(166, 262, width - 196, "Hapus transaksi", {
        variant: "danger",
        height: 44,
      }),
      txt(30, 323, "Konfirmasi ringkas untuk satu data.", {
        size: 10,
        fill: C.secondary,
      }),
      txt(16, 376, "HAPUS AKUN DAN SELURUH DATA", {
        size: 10,
        fill: C.error,
        weight: 600,
        letter: 1.1,
      }),
      rect(16, 389, cw, 330, {
        fill: C.surface,
        stroke: C.error,
        sw: 1.5,
        radius: 16,
      }),
      icon(30, 411, "warning", 22, C.error),
      txt(64, 428, "Hapus akun secara permanen?", {
        size: 17,
        weight: 600,
        family: DISPLAY,
      }),
      multiline(
        30,
        461,
        [
          "Semua transaksi, insight, dan foto struk",
          "akan dihapus. Tindakan ini tidak dapat",
          "dibatalkan.",
        ],
        {
          size: 12,
          fill: C.secondary,
          lineHeight: 19,
        },
      ),
      txt(30, 535, "Ketik HAPUS untuk melanjutkan", {
        size: 12,
        weight: 600,
      }),
      rect(30, 548, cw - 28, 48, {
        fill: C.surface,
        stroke: C.error,
        radius: 10,
      }),
      txt(44, 579, "HAPUS", {
        size: 14,
        weight: 600,
      }),
      button(30, 616, cw - 28, "Hapus akun dan data", {
        variant: "danger",
        height: 50,
      }),
      txt(width / 2, 754, "Aksi destructive tidak memakai bottom sheet.", {
        size: 11,
        fill: C.secondary,
        anchor: "middle",
      }),
    ].join(""),
    { title: "Fintrack AI mobile destructive confirmation high fidelity CP2 R0" },
  );
}

const frames = [
  {
    number: "01",
    slug: "mobile-dashboard-default-cp2-r0",
    title: "Dashboard — default",
    svg: mobileDashboard(),
  },
  {
    number: "02",
    slug: "mobile-dashboard-states-cp2-r0",
    title: "Dashboard — loading / empty / offline",
    svg: mobileDashboardStates(),
  },
  {
    number: "03",
    slug: "mobile-transactions-list-cp2-r0",
    title: "Daftar transaksi",
    svg: mobileTransactions(),
  },
  {
    number: "04",
    slug: "mobile-transaction-detail-edit-cp2-r0",
    title: "Detail & edit transaksi",
    svg: mobileTransactionEdit(),
  },
  {
    number: "05",
    slug: "mobile-scan-start-cp2-r0",
    title: "Scan — pilih foto",
    svg: mobileScanStart(),
  },
  {
    number: "06",
    slug: "mobile-scan-upload-cp2-r0",
    title: "Kompresi & upload",
    svg: mobileScanUpload(),
  },
  {
    number: "07",
    slug: "mobile-scan-processing-cp2-r0",
    title: "Focused inspection",
    svg: mobileScanProcessing(),
  },
  {
    number: "08",
    slug: "mobile-scan-review-cp2-r0",
    title: "Review hasil AI",
    svg: mobileScanReview(),
  },
  {
    number: "09",
    slug: "mobile-scan-quota-error-cp2-r0",
    title: "AI quota / fallback",
    svg: mobileScanQuota(),
  },
  {
    number: "10",
    slug: "mobile-destructive-confirmation-cp2-r0",
    title: "Destructive confirmation",
    svg: mobileDestructive(),
  },
];

function innerSvg(source) {
  return source
    .replace(/^<\?xml[^>]+>\s*/u, "")
    .replace(/^<svg[^>]+>/u, "")
    .replace(/<\/svg>\s*$/u, "")
    .replace(/<style>[\s\S]*?<\/style>/u, "");
}

function contactSheet() {
  const columns = 5;
  const scale = 0.54;
  const thumbWidth = 390 * scale;
  const thumbHeight = 844 * scale;
  const cellWidth = 330;
  const cellHeight = 575;
  const rows = 2;
  const width = 80 + columns * cellWidth;
  const height = 160 + rows * cellHeight;
  const body = [
    txt(40, 55, "Fintrack AI · CP2-R0 Mobile", {
      size: 34,
      weight: 600,
      family: DISPLAY,
    }),
    txt(40, 87, "Quiet Signal — Refined · high-fidelity proof · 390 × 844", {
      size: 15,
      fill: C.secondary,
      weight: 500,
    }),
    badge(width - 196, 42, "FINAL / LOCKED", {
      fill: C.primarySoft,
      color: C.primary,
      width: 156,
      height: 30,
    }),
    ...frames.map((frame, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const cellX = 40 + column * cellWidth;
      const cellY = 128 + row * cellHeight;
      const screenX = cellX + (cellWidth - thumbWidth) / 2;
      const screenY = cellY + 58;
      return [
        txt(cellX, cellY + 17, `${frame.number} · ${frame.title}`, {
          size: 13,
          weight: 600,
        }),
        rect(screenX - 9, screenY - 9, thumbWidth + 18, thumbHeight + 18, {
          fill: C.surface,
          stroke: "#CFCAC0",
          radius: 14,
        }),
        `<g transform="translate(${screenX} ${screenY}) scale(${scale})">${innerSvg(frame.svg)}</g>`,
      ].join("");
    }),
  ].join("");
  return svgDocument(width, height, body, {
    background: "#ECE9E1",
    title: "Fintrack AI CP2 R0 mobile contact sheet",
  });
}

function visualFoundationBoard() {
  const width = 1600;
  const height = 1040;
  const colorTokens = [
    ["Rice Paper", C.canvas, C.ink],
    ["Midnight", C.ink, C.surface],
    ["Mineral Blue", C.primary, C.surface],
    ["Signal Leaf", C.signal, C.ink],
    ["Warm Coral", C.expense, C.ink],
    ["Surface", C.surface, C.ink],
  ];
  const body = [
    txt(60, 70, "CP2-R0 · Visual Foundation", {
      size: 38,
      weight: 600,
      family: DISPLAY,
    }),
    txt(60, 104, "Typography, color, components, and motif calibration", {
      size: 16,
      fill: C.secondary,
    }),
    txt(60, 164, "TYPOGRAPHY", {
      size: 12,
      fill: C.secondary,
      weight: 600,
      letter: 1.4,
    }),
    rect(60, 184, 700, 258, {
      fill: C.surface,
      stroke: C.border,
      radius: 18,
    }),
    txt(92, 242, "Ringkasan Juli", {
      size: 40,
      weight: 600,
      family: DISPLAY,
    }),
    txt(92, 278, "Space Grotesk 600 · display and financial anchor", {
      size: 14,
      fill: C.secondary,
    }),
    txt(92, 342, "Pengeluaran makanmu sedikit meningkat.", {
      size: 18,
      weight: 400,
      family: BODY,
    }),
    txt(92, 375, "IBM Plex Sans 400/500/600 · body, form, and metadata", {
      size: 14,
      fill: C.secondary,
    }),
    txt(92, 414, "Rp3.482.500  ·  12 Jul 2026  ·  −Rp326.500", {
      size: 16,
      weight: 600,
      numeric: true,
    }),
    txt(810, 164, "CORE COLOR DISTRIBUTION", {
      size: 12,
      fill: C.secondary,
      weight: 600,
      letter: 1.4,
    }),
    ...colorTokens.map(([label, color, foreground], index) => {
      const column = index % 3;
      const row = Math.floor(index / 3);
      const x = 810 + column * 240;
      const y = 184 + row * 129;
      return [
        rect(x, y, 214, 102, {
          fill: color,
          stroke: color === C.surface ? C.border : color,
          radius: 14,
        }),
        txt(x + 18, y + 42, label, {
          size: 15,
          fill: foreground,
          weight: 600,
        }),
        txt(x + 18, y + 69, color, {
          size: 12,
          fill: foreground,
          weight: 500,
        }),
      ].join("");
    }),
    txt(60, 498, "COMPONENT HIERARCHY", {
      size: 12,
      fill: C.secondary,
      weight: 600,
      letter: 1.4,
    }),
    rect(60, 520, 700, 284, {
      fill: C.surface,
      stroke: C.border,
      radius: 18,
    }),
    button(92, 558, 188, "Scan struk", {
      iconName: "scan",
    }),
    button(296, 558, 188, "Tambah manual", {
      variant: "secondary",
      iconName: "plus",
    }),
    button(500, 558, 188, "Hapus data", {
      variant: "danger",
      iconName: "trash",
    }),
    field(92, 650, 286, "Merchant", "Superindo"),
    field(402, 650, 286, "Kategori", "Belanja", {
      warning: true,
    }),
    badge(92, 746, "AI · Struk", { width: 82 }),
    badge(190, 746, "Selesai", {
      fill: C.signalSoft,
      color: C.signalInk,
      width: 76,
      iconName: "check",
    }),
    badge(282, 746, "Offline", {
      fill: C.primarySoft,
      color: C.primary,
      width: 76,
      iconName: "wifi-slash",
    }),
    badge(374, 746, "Perlu ditinjau", {
      fill: C.warningSoft,
      color: C.warning,
      width: 116,
    }),
    txt(810, 498, "MOTIF RESTRAINT", {
      size: 12,
      fill: C.secondary,
      weight: 600,
      letter: 1.4,
    }),
    rect(810, 520, 730, 284, {
      fill: C.ink,
      radius: 18,
    }),
    cropFrame(850, 556, 310, 210, {
      dark: true,
      lineColor: C.signal,
    }),
    receiptVisual(955, 580, 100, 162),
    line(884, 661, 1126, 661, {
      stroke: C.signal,
      sw: 2,
    }),
    txt(1200, 588, "Crop frame", {
      size: 20,
      fill: C.surface,
      weight: 600,
      family: DISPLAY,
    }),
    multiline(
      1200,
      620,
      [
        "Hanya pada upload,",
        "processing, dan review.",
        "",
        "Tracking line menjelaskan",
        "hubungan atau progres;",
        "bukan dekorasi.",
      ],
      {
        size: 14,
        fill: C.darkMuted,
        lineHeight: 22,
      },
    ),
    rect(60, 856, 1480, 118, {
      fill: C.canvasSubtle,
      stroke: C.border,
      radius: 16,
    }),
    icon(88, 884, "shield-check", 24, C.primary),
    txt(128, 898, "Anti-generic guardrail", {
      size: 17,
      weight: 600,
      family: DISPLAY,
    }),
    txt(128, 929, "No gradient AI · no glassmorphism · no metric-card wall · no dark-first dashboard · no fake progress", {
      size: 14,
      fill: C.secondary,
      weight: 500,
    }),
  ].join("");
  return svgDocument(width, height, body, {
    background: C.canvas,
    title: "Fintrack AI CP2 R0 visual foundation",
  });
}

function spotcheckSheet() {
  const items = [
    {
      title: "Dashboard · 360 px",
      svg: mobileDashboard(360),
    },
    {
      title: "Transactions · 360 px",
      svg: mobileTransactions(360),
    },
    {
      title: "Review · 360 px",
      svg: mobileScanReview(360),
    },
  ];
  const scale = 0.78;
  const thumbWidth = 360 * scale;
  const thumbHeight = 844 * scale;
  const cellWidth = 480;
  const width = 1500;
  const height = 860;
  const body = [
    txt(50, 62, "CP2-R0 · 360 px Spot-check", {
      size: 34,
      weight: 600,
      family: DISPLAY,
    }),
    txt(50, 96, "Content width 328 px · labels retained · no font-size reduction", {
      size: 15,
      fill: C.secondary,
    }),
    ...items.map((item, index) => {
      const cellX = 40 + index * cellWidth;
      const screenX = cellX + (cellWidth - thumbWidth) / 2;
      const screenY = 155;
      return [
        txt(cellX + 18, 137, item.title, {
          size: 14,
          weight: 600,
        }),
        rect(screenX - 10, screenY - 10, thumbWidth + 20, thumbHeight + 20, {
          fill: C.surface,
          stroke: "#CFCAC0",
          radius: 16,
        }),
        `<g transform="translate(${screenX} ${screenY}) scale(${scale})">${innerSvg(item.svg)}</g>`,
      ].join("");
    }),
  ].join("");
  return {
    svg: svgDocument(width, height, body, {
      background: "#ECE9E1",
      title: "Fintrack AI CP2 R0 360 px spotcheck",
    }),
    screens: items,
  };
}

async function writeSvgAndPng(basePath, source) {
  const svgPath = `${basePath}.svg`;
  const pngPath = `${basePath}.png`;
  await fs.writeFile(svgPath, source, "utf8");
  await sharp(Buffer.from(source))
    .png({ compressionLevel: 9 })
    .toFile(pngPath);
  return [svgPath, pngPath];
}

const generated = [];
for (const frame of frames) {
  const paths = await writeSvgAndPng(
    path.join(MOBILE_DIR, frame.slug),
    frame.svg,
  );
  generated.push(...paths);
}

const contactPaths = await writeSvgAndPng(
  path.join(ROOT, "CP2_R0_MOBILE_CONTACT_SHEET"),
  contactSheet(),
);
generated.push(...contactPaths);

const foundationPaths = await writeSvgAndPng(
  path.join(ROOT, "CP2_R0_VISUAL_FOUNDATION"),
  visualFoundationBoard(),
);
generated.push(...foundationPaths);

const spotcheck = spotcheckSheet();
const spotcheckPaths = await writeSvgAndPng(
  path.join(ROOT, "CP2_R0_360_SPOTCHECK"),
  spotcheck.svg,
);
generated.push(...spotcheckPaths);
for (const item of spotcheck.screens) {
  const slug = item.title
    .toLowerCase()
    .replaceAll(" · ", "-")
    .replaceAll(" ", "-")
    .replaceAll("px", "px")
    .replace(/[^a-z0-9-]/gu, "");
  const paths = await writeSvgAndPng(
    path.join(TESTS_DIR, `${slug}-cp2-r0`),
    item.svg,
  );
  generated.push(...paths);
}

const tokens = {
  checkpoint: "CP2-R0",
  direction: "Quiet Signal — Refined",
  status: "Final / Locked",
  viewport: {
    primary: { width: 390, height: 844 },
    spotcheck: { width: 360, height: 844 },
    horizontalPadding: 16,
    bottomNavigationHeight: 80,
    minimumTouchTarget: 44,
  },
  typography: {
    display: {
      family: "Space Grotesk",
      weights: [500, 600, 700],
    },
    body: {
      family: "IBM Plex Sans",
      weights: [400, 500, 600],
    },
    financialNumerals: "tabular-nums",
  },
  color: {
    canvas: C.canvas,
    canvasSubtle: C.canvasSubtle,
    surface: C.surface,
    ink: C.ink,
    secondary: C.secondary,
    primary: C.primary,
    primarySoft: C.primarySoft,
    signal: C.signal,
    signalSoft: C.signalSoft,
    expense: C.expense,
    expenseSoft: C.expenseSoft,
    warning: C.warning,
    warningSoft: C.warningSoft,
    error: C.error,
    errorSoft: C.errorSoft,
    border: C.border,
    divider: C.divider,
  },
  shape: {
    button: 12,
    field: 10,
    card: [14, 16],
    scanPanel: 18,
  },
  iconography: {
    family: "Phosphor Icons",
    defaultWeight: "regular",
    activeNavigationWeight: "fill where available",
    sizes: {
      inline: [16, 18],
      navigation: 20,
      primaryScan: 26,
    },
  },
  logo: {
    revision: "LOGO-R1",
    asset: "../logo-r1/assets/lockups/fintrack-ai-lockup-compact-primary.svg",
    dashboardHeight: 24,
  },
  motifs: {
    cropFrame: "scan start, upload, focused inspection, and review only",
    trackingLine: "1.5–2 px; semantic progress or relationship only",
  },
};
const tokenPath = path.join(ROOT, "cp2-ui-tokens.json");
await fs.writeFile(tokenPath, `${JSON.stringify(tokens, null, 2)}\n`, "utf8");
generated.push(tokenPath);

const manifest = {
  project: "Fintrack AI",
  checkpoint: "CP2",
  revision: "R0",
  direction: "Quiet Signal — Refined",
  status: "Final / Locked",
  generatedAt: "2026-07-29",
  sourceHierarchy: "../local-cp1/CONTENT_HIERARCHY.md",
  designSystem: "../../DESIGN_SYSTEM.md",
  logo: "../logo-r1/LOGO_R1_FINAL_LOCK.md",
  finalLock: "CP2_R0_FINAL_LOCK.md",
  viewports: {
    primary: "390x844",
    spotcheck: "360x844",
  },
  fonts: {
    display: "Space Grotesk variable, embedded",
    body: "IBM Plex Sans 400/500/600, embedded",
  },
  icons: "Phosphor Icons 2.1.1",
  frames: frames.map((frame) => ({
    number: frame.number,
    title: frame.title,
    svg: `mobile/${frame.slug}.svg`,
    png: `mobile/${frame.slug}.png`,
  })),
  reviewBoards: [
    "CP2_R0_MOBILE_CONTACT_SHEET.svg",
    "CP2_R0_MOBILE_CONTACT_SHEET.png",
    "CP2_R0_VISUAL_FOUNDATION.svg",
    "CP2_R0_VISUAL_FOUNDATION.png",
    "CP2_R0_360_SPOTCHECK.svg",
    "CP2_R0_360_SPOTCHECK.png",
  ],
  generatedFiles: generated.map((filePath) =>
    path.relative(ROOT, filePath).replaceAll("\\", "/"),
  ),
};
const manifestPath = path.join(ROOT, "manifest.json");
await fs.writeFile(
  manifestPath,
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);

console.log(
  JSON.stringify(
    {
      root: ROOT,
      status: manifest.status,
      frames: frames.length,
      generatedFiles: generated.length,
      manifest: manifestPath,
    },
    null,
    2,
  ),
);
