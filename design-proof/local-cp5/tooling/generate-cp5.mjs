import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  BODY,
  C,
  DISPLAY,
  badge,
  button,
  circle,
  icon,
  labelText,
  line,
  rect,
  svgDoc,
  textLines,
  txt,
  writeSvgAndPng,
} from "../../local-cp3/tooling/design-core.mjs";

const TOOLING_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(TOOLING_DIR, "..");
const DESIGN_PROOF = path.resolve(ROOT, "..");
const PROJECT_ROOT = path.resolve(DESIGN_PROOF, "..");
const PROOF_DIR = path.join(ROOT, "proof");
const REVIEW_DIR = path.join(ROOT, "review-notes");

await fs.mkdir(PROOF_DIR, { recursive: true });
await fs.mkdir(REVIEW_DIR, { recursive: true });

function boardHeader(title, subtitle) {
  return [
    txt(48, 68, title, {
      size: 38,
      weight: 600,
      family: DISPLAY,
    }),
    txt(48, 100, subtitle, {
      size: 15,
      fill: C.secondary,
      weight: 500,
    }),
    ...badge(1532, 42, "FINAL / LOCKED", {
      width: 220,
      height: 32,
      fill: C.primarySoft,
      color: C.primary,
    }),
    line(48, 126, 1752, 126, { stroke: C.divider }),
  ];
}

function metricCard(x, y, width, value, label, detail, tone = "default") {
  const palette = {
    default: { fill: C.surface, accent: C.primary, value: C.ink },
    good: { fill: C.signalSoft, accent: C.signalInk, value: C.signalInk },
    warning: { fill: C.warningSoft, accent: C.warning, value: C.warning },
    information: { fill: C.primarySoft, accent: C.primary, value: C.primary },
  }[tone];
  return [
    rect(x, y, width, 152, {
      fill: palette.fill,
      stroke: tone === "default" ? C.border : "none",
      strokeWidth: tone === "default" ? 1 : 0,
      radius: 16,
    }),
    rect(x, y + 24, 4, 104, { fill: palette.accent, radius: 2 }),
    txt(x + 28, y + 40, label.toUpperCase(), {
      size: 11,
      fill: palette.accent,
      weight: 600,
      letterSpacing: 1.2,
    }),
    txt(x + 28, y + 91, value, {
      size: 34,
      fill: palette.value,
      weight: 600,
      family: DISPLAY,
      numeric: true,
    }),
    txt(x + 28, y + 124, detail, {
      size: 13,
      fill: tone === "default" ? C.secondary : palette.value,
      weight: 500,
    }),
  ];
}

function checklistCard(x, y, width, height, title, rows) {
  return [
    rect(x, y, width, height, {
      fill: C.surface,
      stroke: C.border,
      strokeWidth: 1,
      radius: 16,
    }),
    txt(x + 24, y + 38, title, {
      size: 20,
      weight: 600,
      family: DISPLAY,
    }),
    line(x + 24, y + 56, x + width - 24, y + 56),
    ...rows.flatMap((row, index) => {
      const rowY = y + 86 + index * 48;
      const tone = row.tone ?? "good";
      const palette = {
        good: { bg: C.signalSoft, ink: C.signalInk, icon: "check" },
        warning: { bg: C.warningSoft, ink: C.warning, icon: "warning" },
        information: { bg: C.primarySoft, ink: C.primary, icon: "info" },
      }[tone];
      return [
        circle(x + 34, rowY - 5, 14, { fill: palette.bg }),
        icon(palette.icon, x + 27, rowY - 12, 14, { color: palette.ink }),
        txt(x + 58, rowY, row.label, { size: 14, weight: 600 }),
        txt(x + width - 24, rowY, row.value, {
          size: 13,
          fill: palette.ink,
          anchor: "end",
          weight: 600,
        }),
      ];
    }),
  ];
}

function qaOverviewBoard() {
  const coverageRows = [
    { label: "Mobile primary + 360 spot-check", value: "13 renderings" },
    { label: "Desktop primary + 1280 spot-check", value: "9 renderings" },
    { label: "Runtime states + prototype", value: "12 states" },
    { label: "Logo marks, lockups, favicon, PWA", value: "asset audit" },
    { label: "Compact transition", value: "1024 proof", tone: "information" },
  ];
  const gateRows = [
    { label: "P0 / P1 open", value: "0 / 0" },
    { label: "P2 correction contracts", value: "2 / 2" },
    { label: "P3 handoff clarifications", value: "5 / 5" },
    {
      label: "Installed PWA physical device",
      value: "Pending",
      tone: "warning",
    },
    { label: "1–2 beta-user sessions", value: "Pending", tone: "warning" },
  ];
  return svgDoc(1800, 1080, "Fintrack AI CP5 R0 QA overview", [
    ...boardHeader(
      "CP5-R0 · Visual QA Overview",
      "Audit membedakan pass struktural, defect visual, dan bukti runtime yang memang belum tersedia.",
    ),
    ...metricCard(48, 160, 402, "34", "Proof renderings", "Primary + spot-check + state", "default"),
    ...metricCard(474, 160, 402, "661/661", "Upstream checks", "CP2 + CP3 + CP4 + LOGO-R1", "good"),
    ...metricCard(900, 160, 402, "2", "Visible defects", "Keduanya punya correction contract", "warning"),
    ...metricCard(1326, 160, 426, "0", "Foundation changes", "Arah, palette, hierarchy tetap", "information"),
    ...checklistCard(48, 344, 828, 340, "Coverage", coverageRows),
    ...checklistCard(900, 344, 852, 340, "Acceptance gates", gateRows),
    rect(48, 716, 1704, 244, {
      fill: C.ink,
      radius: 18,
    }),
    txt(80, 764, "R0 VERDICT", {
      size: 12,
      fill: C.signal,
      weight: 600,
      letterSpacing: 1.3,
    }),
    txt(80, 812, "Design Proof Final · implementation gates tetap terlacak.", {
      size: 28,
      fill: C.surface,
      weight: 600,
      family: DISPLAY,
    }),
    ...textLines(
      80,
      854,
      [
        "Dua defect presisi tidak mengubah intent desain dan telah diberi ukuran koreksi.",
        "Runtime accessibility, installed PWA, dan beta-user result tetap dipisahkan dari bukti mockup.",
        "Owner approval tercatat; delta diterapkan ke DESIGN_SYSTEM.md versi 1.2.",
      ],
      { size: 15, fill: C.darkMuted, lineHeight: 28, weight: 500 },
    ),
    ...badge(1460, 792, "P0 0", {
      width: 104,
      fill: C.darkSurface2,
      color: C.signal,
    }),
    ...badge(1580, 792, "P1 0", {
      width: 104,
      fill: C.darkSurface2,
      color: C.signal,
    }),
    ...badge(1460, 840, "P2 2", {
      width: 104,
      fill: C.warningSoft,
      color: C.warning,
    }),
    ...badge(1580, 840, "P3 5", {
      width: 104,
      fill: C.primarySoft,
      color: C.primary,
    }),
  ]);
}

function weeklyBefore(x, y) {
  return [
    rect(x, y, 420, 244, {
      fill: C.surface,
      stroke: C.error,
      strokeWidth: 1.5,
      radius: 16,
    }),
    line(x + 210, y + 30, x + 210, y + 214),
    labelText(x + 238, y + 46, "Pengeluaran minggu ini"),
    txt(x + 238, y + 91, "Rp846.000", {
      size: 24,
      family: DISPLAY,
      weight: 600,
      numeric: true,
    }),
    txt(x + 238, y + 121, "24% dari total bulan ini", {
      size: 13,
      fill: C.secondary,
    }),
    ...button(x + 238, y + 146, 150, "Tambah manual", {
      kind: "secondary",
      iconName: "plus",
    }),
    line(x + 388, y + 28, x + 388, y + 216, {
      stroke: C.error,
      width: 2,
      dash: "5 5",
    }),
    txt(x + 210, y + 232, "Fixed 150 px text zone", {
      size: 12,
      fill: C.error,
      weight: 600,
    }),
  ];
}

function weeklyAfter(x, y) {
  return [
    rect(x, y, 420, 244, {
      fill: C.surface,
      stroke: C.primary,
      strokeWidth: 1.5,
      radius: 16,
    }),
    line(x + 200, y + 30, x + 200, y + 214),
    labelText(x + 228, y + 46, "Minggu ini"),
    txt(x + 228, y + 91, "Rp846.000", {
      size: 24,
      family: DISPLAY,
      weight: 600,
      numeric: true,
    }),
    txt(x + 228, y + 121, "24% dari total bulan ini", {
      size: 13,
      fill: C.secondary,
    }),
    ...button(x + 228, y + 146, 164, "Tambah manual", {
      kind: "secondary",
      iconName: "plus",
    }),
    line(x + 404, y + 28, x + 404, y + 216, {
      stroke: C.signalInk,
      width: 2,
      dash: "5 5",
    }),
    txt(x + 200, y + 232, "Intrinsic zone · 16 px right safe gap", {
      size: 12,
      fill: C.signalInk,
      weight: 600,
    }),
  ];
}

function offlineBadgeBefore(x, y) {
  return [
    rect(x, y, 390, 160, {
      fill: C.surface,
      stroke: C.error,
      strokeWidth: 1.5,
      radius: 18,
    }),
    rect(x + 278, y + 44, 96, 28, {
      fill: C.primarySoft,
      radius: 8,
    }),
    txt(x + 326, y + 63, "OFFLINE / CACHED", {
      size: 12,
      fill: C.primary,
      weight: 600,
      anchor: "middle",
    }),
    line(x + 374, y + 24, x + 374, y + 100, {
      stroke: C.error,
      width: 2,
      dash: "5 5",
    }),
    txt(x + 24, y + 124, "96 px fixed width · 8 px right inset", {
      size: 13,
      fill: C.error,
      weight: 600,
    }),
  ];
}

function offlineBadgeAfter(x, y) {
  return [
    rect(x, y, 390, 160, {
      fill: C.surface,
      stroke: C.primary,
      strokeWidth: 1.5,
      radius: 18,
    }),
    rect(x + 246, y + 44, 128, 28, {
      fill: C.primarySoft,
      radius: 8,
    }),
    txt(x + 310, y + 63, "OFFLINE / CACHED", {
      size: 12,
      fill: C.primary,
      weight: 600,
      anchor: "middle",
    }),
    line(x + 374, y + 24, x + 374, y + 100, {
      stroke: C.signalInk,
      width: 2,
      dash: "5 5",
    }),
    txt(x + 24, y + 124, "128 px minimum · 16 px right inset", {
      size: 13,
      fill: C.signalInk,
      weight: 600,
    }),
  ];
}

function precisionCorrectionsBoard() {
  const notes = [
    ["FT-PREC-003", "Sidebar authority", "240 px final; 280 px context board ditolak"],
    ["FT-PREC-004", "Runtime text floor", "Critical metadata ≥12 px"],
    ["FT-PREC-005", "Desktop async state", "Upload-ready dan processing dipisah"],
    ["FT-PREC-006", "1024 transition", "Compact rail 72 px; type scale dipertahankan"],
    ["FT-PREC-007", "Editable source", "Local generators + SVG/PNG menjadi authority"],
  ];
  return svgDoc(1800, 1220, "Fintrack AI CP5 R0 precision corrections", [
    ...boardHeader(
      "CP5-R0 · Precision Corrections",
      "Before/after menjelaskan perbaikan defect—bukan redesign atau perubahan hierarchy.",
    ),
    ...badge(48, 154, "FT-PREC-001 · P2", {
      width: 160,
      fill: C.warningSoft,
      color: C.warning,
    }),
    txt(48, 208, "Weekly summary safe width", {
      size: 23,
      family: DISPLAY,
      weight: 600,
    }),
    txt(48, 234, "Compact copy dan intrinsic sizing menggantikan clipping.", {
      size: 14,
      fill: C.secondary,
    }),
    txt(48, 278, "BEFORE", {
      size: 11,
      fill: C.error,
      weight: 600,
      letterSpacing: 1.2,
    }),
    txt(494, 278, "AFTER / IMPLEMENTATION CONTRACT", {
      size: 11,
      fill: C.signalInk,
      weight: 600,
      letterSpacing: 1.2,
    }),
    ...weeklyBefore(48, 296),
    ...weeklyAfter(494, 296),
    ...badge(970, 154, "FT-PREC-002 · P2", {
      width: 160,
      fill: C.warningSoft,
      color: C.warning,
    }),
    txt(970, 208, "Offline badge intrinsic sizing", {
      size: 23,
      family: DISPLAY,
      weight: 600,
    }),
    txt(970, 234, "Label panjang mendapat padding dan safe right inset.", {
      size: 14,
      fill: C.secondary,
    }),
    txt(970, 278, "BEFORE", {
      size: 11,
      fill: C.error,
      weight: 600,
      letterSpacing: 1.2,
    }),
    ...offlineBadgeBefore(970, 296),
    txt(1378, 278, "AFTER", {
      size: 11,
      fill: C.signalInk,
      weight: 600,
      letterSpacing: 1.2,
    }),
    ...offlineBadgeAfter(1378, 296),
    rect(48, 594, 1704, 478, {
      fill: C.surface,
      stroke: C.border,
      strokeWidth: 1,
      radius: 16,
    }),
    txt(72, 636, "Handoff clarifications", {
      size: 22,
      weight: 600,
      family: DISPLAY,
    }),
    line(72, 656, 1728, 656),
    ...notes.flatMap(([id, title, resolution], index) => {
      const y = 700 + index * 70;
      return [
        ...badge(72, y - 22, id, {
          width: 138,
          fill: C.primarySoft,
          color: C.primary,
        }),
        txt(234, y, title, { size: 15, weight: 600 }),
        txt(520, y, resolution, {
          size: 14,
          fill: C.secondary,
          weight: 500,
        }),
        ...badge(1550, y - 22, "DOCUMENTED", {
          width: 150,
          fill: C.signalSoft,
          color: C.signalInk,
        }),
        index < notes.length - 1 ? line(72, y + 28, 1728, y + 28) : "",
      ];
    }),
    rect(48, 1100, 1704, 66, {
      fill: C.primarySoft,
      radius: 12,
    }),
    icon("info", 70, 1121, 20, { color: C.primary }),
    txt(
      104,
      1142,
      "Aturan global: min-width: 0; intrinsic badge sizing; min-height untuk text scaling; critical label tidak di-ellipsis.",
      { size: 14, fill: C.primary, weight: 600 },
    ),
  ]);
}

function accessibilityResponsiveBoard() {
  const modes = [
    ["360", "Mobile narrow", "16 px padding · actions fit/stack · labels utuh"],
    ["390", "Mobile primary", "4-column intent · bottom nav + safe area"],
    ["768", "Tablet entry", "Stack content; choose compact rail OR bottom nav"],
    ["1024", "Compact desktop", "72 px rail · 24 px padding · type retained"],
    ["1280", "Desktop", "240 px sidebar · ratios adjust before type"],
    ["1440", "Wide", "40 px padding · content bounded · whitespace grows"],
  ];
  const a11y = [
    ["Touch", "44×44 minimum", "48 px main mobile control"],
    ["Focus", "2 px + 2 px offset", "Visible; not color-only"],
    ["Text", "12 px critical floor", "200% zoom must reflow"],
    ["Status", "Label + icon + copy", "aria-live only on change"],
    ["Dialog", "Batal first", "Trap · Escape · return"],
    ["Motion", "120 / 180 / 260 ms", "Reduced motion removes transform"],
  ];
  return svgDoc(1800, 1160, "Fintrack AI CP5 R0 accessibility responsive", [
    ...boardHeader(
      "CP5-R0 · Accessibility & Responsive",
      "Design contract menjelaskan perilaku; runtime browser tetap memerlukan evidence terpisah.",
    ),
    rect(48, 160, 1044, 850, {
      fill: C.surface,
      stroke: C.border,
      strokeWidth: 1,
      radius: 16,
    }),
    txt(72, 204, "Viewport contract", {
      size: 22,
      weight: 600,
      family: DISPLAY,
    }),
    txt(72, 230, "Breakpoint bukan alasan mengecilkan teks sampai muat.", {
      size: 14,
      fill: C.secondary,
    }),
    ...modes.flatMap(([width, mode, rule], index) => {
      const y = 286 + index * 110;
      const active = width === "1024";
      return [
        rect(72, y - 34, 996, 86, {
          fill: active ? C.primarySoft : index % 2 === 0 ? C.canvasSubtle : C.surface,
          stroke: active ? C.primary : C.divider,
          strokeWidth: active ? 1.5 : 1,
          radius: 12,
        }),
        txt(96, y, `${width}px`, {
          size: 24,
          family: DISPLAY,
          weight: 600,
          fill: active ? C.primary : C.ink,
          numeric: true,
        }),
        txt(230, y - 2, mode, { size: 15, weight: 600 }),
        txt(230, y + 24, rule, {
          size: 13,
          fill: C.secondary,
          weight: 500,
        }),
        active
          ? badge(910, y - 18, "NEW PROOF", {
              width: 126,
              fill: C.surface,
              color: C.primary,
            })
          : "",
      ];
    }),
    rect(1116, 160, 636, 850, {
      fill: C.ink,
      radius: 16,
    }),
    txt(1144, 204, "Accessibility contract", {
      size: 22,
      weight: 600,
      family: DISPLAY,
      fill: C.surface,
    }),
    txt(1144, 230, "WCAG 2.2 AA target", {
      size: 14,
      fill: C.darkMuted,
    }),
    ...a11y.flatMap(([title, value, detail], index) => {
      const y = 294 + index * 108;
      return [
        circle(1158, y - 7, 14, { fill: C.darkSurface2 }),
        icon("check", 1151, y - 14, 14, { color: C.signal }),
        txt(1188, y - 2, title, {
          size: 15,
          fill: C.surface,
          weight: 600,
        }),
        txt(1716, y - 2, value, {
          size: 14,
          fill: C.signal,
          anchor: "end",
          weight: 600,
        }),
        txt(1188, y + 28, detail, {
          size: 13,
          fill: C.darkMuted,
          weight: 500,
        }),
        index < a11y.length - 1
          ? line(1144, y + 56, 1724, y + 56, { stroke: C.darkBorder })
          : "",
      ];
    }),
    rect(1144, 918, 580, 62, {
      fill: C.warningSoft,
      radius: 10,
    }),
    icon("warning", 1162, 938, 20, { color: C.warning }),
    txt(1198, 956, "Runtime semantics + 200% zoom masih pending implementasi.", {
      size: 13,
      fill: C.warning,
      weight: 600,
    }),
    rect(48, 1038, 1704, 70, {
      fill: C.signalSoft,
      radius: 12,
    }),
    icon("shield-check", 72, 1061, 22, { color: C.signalInk }),
    txt(
      112,
      1082,
      "Tidak ada design-level contrast failure yang ditemukan; computed browser colors tetap harus diaudit setelah implementation.",
      { size: 14, fill: C.signalInk, weight: 600 },
    ),
  ]);
}

function handoffMapBoard() {
  const nodes = [
    ["1", "Brief", "Target · scope · product truth"],
    ["2", "Design system", "Brand · tokens · guardrails"],
    ["3", "Final locks", "CP1–CP4 + LOGO-R1"],
    ["4", "CP5 corrections", "Defect overrides visual artifact"],
    ["5", "Machine tokens", "JSON · CSS · matrices"],
    ["6", "Implementation", "Semantic component · responsive code"],
    ["7", "Runtime QA", "Screenshot · keyboard · zoom · PWA"],
  ];
  return svgDoc(1800, 1080, "Fintrack AI CP5 R0 handoff map", [
    ...boardHeader(
      "CP5-R0 · Design-to-Code Authority",
      "Programmer memperbaiki defect teknis kecil, tetapi tidak menafsirkan ulang arah desain.",
    ),
    ...nodes.flatMap(([step, title, detail], index) => {
      const x = 48 + index * 242;
      const selected = index === 3 || index === 4;
      return [
        rect(x, 188, 206, 180, {
          fill: selected ? C.primarySoft : C.surface,
          stroke: selected ? C.primary : C.border,
          strokeWidth: selected ? 1.5 : 1,
          radius: 16,
        }),
        circle(x + 30, 220, 16, {
          fill: selected ? C.primary : C.ink,
        }),
        txt(x + 30, 225, step, {
          size: 12,
          fill: C.surface,
          weight: 600,
          anchor: "middle",
        }),
        txt(x + 22, 270, title, {
          size: 18,
          weight: 600,
          family: DISPLAY,
        }),
        ...textLines(x + 22, 300, detail.split(" · "), {
          size: 13,
          fill: C.secondary,
          lineHeight: 22,
          weight: 500,
        }),
        index < nodes.length - 1
          ? [
              line(x + 206, 278, x + 238, 278, {
                stroke: C.primary,
                width: 2,
              }),
              icon("arrow-right", x + 218, 269, 18, {
                color: C.primary,
              }),
            ]
          : "",
      ];
    }),
    rect(48, 414, 830, 446, {
      fill: C.surface,
      stroke: C.border,
      strokeWidth: 1,
      radius: 16,
    }),
    txt(72, 456, "Programmer boleh memperbaiki langsung", {
      size: 22,
      family: DISPLAY,
      weight: 600,
    }),
    ...[
      "Clipping, overflow, safe padding",
      "Intrinsic sizing dan min-width: 0",
      "Baseline/icon optical alignment",
      "Browser font rendering",
      "Focus ring dan semantic markup",
      "Safe-area dan small breakpoint",
    ].flatMap((label, index) => {
      const y = 508 + index * 52;
      return [
        circle(84, y - 5, 13, { fill: C.signalSoft }),
        icon("check", 78, y - 11, 12, { color: C.signalInk }),
        txt(110, y, label, { size: 14, weight: 600 }),
      ];
    }),
    rect(922, 414, 830, 446, {
      fill: C.surface,
      stroke: C.border,
      strokeWidth: 1,
      radius: 16,
    }),
    txt(946, 456, "Programmer harus meminta keputusan", {
      size: 22,
      family: DISPLAY,
      weight: 600,
    }),
    ...[
      "Core palette atau font",
      "Navigation dan hierarchy",
      "Focused inspection removal",
      "AI flow atau recovery path",
      "Dark-first / metric-card wall",
      "Semantic color role",
    ].flatMap((label, index) => {
      const y = 508 + index * 52;
      return [
        circle(958, y - 5, 13, { fill: C.warningSoft }),
        icon("warning", 952, y - 11, 12, { color: C.warning }),
        txt(984, y, label, { size: 14, weight: 600 }),
      ];
    }),
    rect(48, 892, 1704, 112, {
      fill: C.ink,
      radius: 16,
    }),
    txt(76, 928, "FINAL IMPLEMENTATION GATE", {
      size: 11,
      fill: C.signal,
      weight: 600,
      letterSpacing: 1.2,
    }),
    txt(
      76,
      970,
      "360 · 390 · 768 · 1024 · 1280 · 1440 screenshots + keyboard + 200% zoom + reduced motion + PWA.",
      { size: 17, fill: C.surface, weight: 600 },
    ),
  ]);
}

const microMarkSource = await fs.readFile(
  path.join(
    DESIGN_PROOF,
    "logo-r1",
    "assets",
    "marks",
    "fintrack-ai-mark-micro-reverse.svg",
  ),
  "utf8",
);
const microMarkUri = `data:image/svg+xml;base64,${Buffer.from(microMarkSource).toString("base64")}`;

function compactDashboard1024() {
  const rail = 72;
  const padding = 24;
  const contentX = rail + padding;
  const contentW = 1024 - rail - padding * 2;
  const gap = 24;
  const summaryW = 560;
  const insightW = contentW - summaryW - gap;
  const lowerY = 376;
  const lowerH = 574;
  return svgDoc(1024, 1024, "Fintrack AI compact dashboard 1024 CP5 R0", [
    rect(0, 0, rail, 1024, { fill: C.ink }),
    `<image href="${microMarkUri}" x="20" y="24" width="32" height="32"/>`,
    ...[
      ["house", 112, true],
      ["receipt", 176, false],
      ["scan", 240, false],
      ["user", 304, false],
    ].flatMap(([name, y, active]) => [
      active
        ? rect(12, y - 12, 48, 48, {
            fill: C.darkSurface2,
            radius: 12,
          })
        : "",
      active ? rect(12, y, 3, 24, { fill: C.signal, radius: 2 }) : "",
      icon(name, 26, y + 2, 20, {
        color: active ? C.surface : C.darkMuted,
      }),
    ]),
    txt(contentX, 54, "Dashboard", {
      size: 30,
      family: DISPLAY,
      weight: 600,
    }),
    txt(contentX, 80, "Ringkasan pengeluaran pribadi · Juli 2026", {
      size: 14,
      fill: C.secondary,
    }),
    ...button(842, 34, 134, "Scan struk", {
      iconName: "scan",
    }),
    line(contentX, 106, 976, 106),
    rect(contentX, 144, summaryW, 208, {
      fill: C.surface,
      stroke: C.border,
      strokeWidth: 1,
      radius: 18,
    }),
    labelText(contentX + 24, 176, "Total pengeluaran"),
    txt(contentX + 24, 230, "Rp3.482.500", {
      size: 36,
      family: DISPLAY,
      weight: 600,
      numeric: true,
    }),
    txt(contentX + 24, 262, "Sedikit lebih tinggi dari Juni", {
      size: 14,
      fill: C.secondary,
    }),
    line(contentX + 336, 168, contentX + 336, 328),
    labelText(contentX + 364, 176, "Minggu ini"),
    txt(contentX + 364, 222, "Rp846.000", {
      size: 24,
      family: DISPLAY,
      weight: 600,
      numeric: true,
    }),
    txt(contentX + 364, 250, "24% dari total bulan ini", {
      size: 13,
      fill: C.secondary,
    }),
    ...button(contentX + 364, 278, 164, "Tambah manual", {
      kind: "secondary",
      iconName: "plus",
    }),
    rect(contentX + summaryW + gap, 144, insightW, 208, {
      fill: C.primarySoft,
      radius: 18,
    }),
    rect(contentX + summaryW + gap, 168, 4, 160, {
      fill: C.primary,
      radius: 2,
    }),
    ...badge(contentX + summaryW + gap + 24, 168, "Insight mingguan", {
      width: 130,
      fill: C.surface,
      color: C.primary,
    }),
    txt(contentX + summaryW + gap + 24, 228, "Makan naik sedikit", {
      size: 19,
      family: DISPLAY,
      weight: 600,
    }),
    ...textLines(
      contentX + summaryW + gap + 24,
      258,
      ["Naik Rp84.000 dibanding", "minggu lalu."],
      { size: 13, fill: C.secondary, lineHeight: 21 },
    ),
    txt(contentX + summaryW + gap + 24, 324, "Lihat rincian →", {
      size: 13,
      fill: C.primary,
      weight: 600,
    }),
    rect(contentX, lowerY, summaryW, lowerH, {
      fill: C.surface,
      stroke: C.border,
      strokeWidth: 1,
      radius: 16,
    }),
    txt(contentX + 24, lowerY + 40, "Distribusi kategori", {
      size: 20,
      family: DISPLAY,
      weight: 600,
    }),
    txt(contentX + 24, lowerY + 64, "Juli 2026 · seluruh transaksi", {
      size: 13,
      fill: C.secondary,
    }),
    ...[
      ["Makan & minum", "Rp1.214.000", 0.84, C.expense],
      ["Belanja", "Rp824.500", 0.58, C.chartPurple],
      ["Tagihan", "Rp760.000", 0.54, C.chartGold],
      ["Transportasi", "Rp384.000", 0.28, C.primary],
    ].flatMap(([label, value, ratio, color], index) => {
      const y = lowerY + 124 + index * 86;
      return [
        circle(contentX + 28, y - 5, 5, { fill: color }),
        txt(contentX + 46, y, label, { size: 14, weight: 500 }),
        txt(contentX + summaryW - 24, y, value, {
          size: 14,
          anchor: "end",
          weight: 600,
          numeric: true,
        }),
        rect(contentX + 46, y + 18, summaryW - 94, 8, {
          fill: C.disabled,
          radius: 4,
        }),
        rect(contentX + 46, y + 18, Math.round((summaryW - 94) * ratio), 8, {
          fill: color,
          radius: 4,
        }),
      ];
    }),
    rect(contentX + 24, lowerY + lowerH - 70, summaryW - 48, 46, {
      fill: C.canvasSubtle,
      radius: 10,
    }),
    icon("info", contentX + 38, lowerY + lowerH - 56, 18, {
      color: C.primary,
    }),
    txt(
      contentX + 68,
      lowerY + lowerH - 42,
      "Kategori terbesar tetap memiliki ringkasan teks.",
      { size: 13, fill: C.secondary, weight: 500 },
    ),
    rect(contentX + summaryW + gap, lowerY, insightW, lowerH, {
      fill: C.surface,
      stroke: C.border,
      strokeWidth: 1,
      radius: 16,
    }),
    txt(contentX + summaryW + gap + 24, lowerY + 40, "Transaksi terbaru", {
      size: 20,
      family: DISPLAY,
      weight: 600,
    }),
    txt(976 - 24, lowerY + 40, "Lihat semua", {
      size: 12,
      fill: C.primary,
      weight: 600,
      anchor: "end",
    }),
    ...[
      ["Superindo", "12 Jul · Belanja", "−Rp326.500", C.primarySoft],
      ["Kedai Sela", "11 Jul · Makan", "−Rp48.000", C.expenseSoft],
      ["KRL", "10 Jul · Manual", "−Rp20.000", C.primarySoft],
      ["PLN", "08 Jul · Tagihan", "−Rp350.000", C.signalSoft],
    ].flatMap(([merchant, meta, amount, color], index) => {
      const y = lowerY + 84 + index * 92;
      return [
        circle(contentX + summaryW + gap + 38, y + 12, 18, { fill: color }),
        txt(contentX + summaryW + gap + 68, y + 8, merchant, {
          size: 14,
          weight: 600,
        }),
        txt(contentX + summaryW + gap + 68, y + 30, meta, {
          size: 12,
          fill: C.secondary,
        }),
        txt(976 - 24, y + 16, amount, {
          size: 13,
          fill: C.expenseInk,
          weight: 600,
          anchor: "end",
          numeric: true,
        }),
        line(contentX + summaryW + gap + 24, y + 58, 976 - 24, y + 58),
      ];
    }),
    txt(contentX + summaryW + gap + 24, lowerY + lowerH - 30, "22 transaksi · Juli 2026", {
      size: 12,
      fill: C.secondary,
    }),
  ]);
}

const finalTokens = {
  meta: {
    project: "Fintrack AI",
    direction: "Quiet Signal — Refined",
    checkpoint: "CP5-R0",
    status: "Final / Locked",
  },
  color: {
    canvas: "#F6F2E8",
    canvasSubtle: "#FCFBF7",
    surface: "#FFFFFF",
    ink: "#0B1220",
    inkSecondary: "#53606C",
    inkWarmMuted: "#6B665E",
    primary: "#285A73",
    primaryHover: "#1F465A",
    primarySoft: "#DCEAF0",
    signal: "#B9D86E",
    signalInk: "#526827",
    signalSoft: "#EDF5D5",
    expense: "#D96C52",
    expenseInk: "#A63D2A",
    expenseSoft: "#F8E2DB",
    warningInk: "#8A3C00",
    warningSoft: "#FFF1D6",
    error: "#B42318",
    errorSoft: "#FDE8E7",
    border: "#D9D6CC",
    divider: "#E7E3DA",
    disabledBackground: "#EEEAE1",
    disabledInk: "#6B665E",
  },
  typography: {
    displayFamily: "Space Grotesk",
    bodyFamily: "IBM Plex Sans",
    weights: { display: [500, 600, 700], body: [400, 500, 600] },
    numeric: "tabular-nums",
    runtimeFloor: { criticalMetadata: 12, navigationLabel: 11, body: 16 },
    scale: {
      display: { mobile: 32, desktop: 40, lineHeight: 1.1, weight: 600 },
      h1: { mobile: 28, desktop: 32, lineHeight: 1.2, weight: 600 },
      h2: { mobile: 22, desktop: 24, lineHeight: 1.25, weight: 600 },
      h3: { mobile: 18, desktop: 20, lineHeight: 1.35, weight: 600 },
      bodyLarge: { mobile: 17, desktop: 18, lineHeight: 1.55, weight: 400 },
      body: { mobile: 16, desktop: 16, lineHeight: 1.5, weight: 400 },
      bodySmall: { mobile: 14, desktop: 14, lineHeight: 1.45, weight: 400 },
      caption: { mobile: 12, desktop: 12, lineHeight: 1.4, weight: 500 },
      button: { mobile: 15, desktop: 15, lineHeight: 1.2, weight: 600 },
    },
  },
  spacing: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
  },
  radius: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, full: 999 },
  elevation: {
    level1: "0 1px 2px rgba(11, 18, 32, 0.06)",
    level2: "0 8px 24px rgba(11, 18, 32, 0.10)",
    level3: "0 18px 48px rgba(11, 18, 32, 0.16)",
  },
  motion: {
    fast: 120,
    base: 180,
    slow: 260,
    enter: "cubic-bezier(0.16, 1, 0.3, 1)",
    exit: "cubic-bezier(0.4, 0, 1, 1)",
  },
  layout: {
    breakpoints: { mobile: 0, tablet: 768, desktop: 1024, wide: 1440 },
    pagePadding: { mobile: 16, tablet: 24, desktop: 32, wide: 40 },
    columns: { mobile: 4, tablet: 8, desktop: 12 },
    gutter: { mobile: 16, tablet: 24, desktop: 24 },
    sidebar: { compact: 72, desktop: 240 },
    maximum: { dashboard: 1440, form: 640, reading: 720 },
  },
  component: {
    minimumTouchTarget: 44,
    mobileMainControlHeight: 48,
    desktopControlHeight: 44,
    focusRingWidth: 2,
    focusRingOffset: 2,
    offlineCachedBadgeMinimumWidth: 128,
    statusBadgeHorizontalPadding: 10,
    dashboardWeeklyColumnMinimum: 176,
  },
  logo: {
    revision: "LOGO-R1",
    masterMarkMinimum: 24,
    microMarkRange: [16, 23],
    compactLockupRange: [24, 27],
    masterLockupMinimum: 28,
    sidebarWidthAuthority: 240,
    productionStatus: "Asset-ready; installed-PWA physical-device validation pending",
  },
};

const responsiveContract = {
  checkpoint: "CP5-R0",
  modes: [
    {
      width: 360,
      name: "mobile-narrow",
      navigation: "bottom",
      padding: 16,
      rules: ["labels-remain-visible", "actions-fit-or-stack", "no-font-reduction"],
    },
    {
      width: 390,
      name: "mobile-primary",
      navigation: "bottom",
      padding: 16,
      rules: ["four-column-intent", "safe-area-bottom", "one-hand-primary-actions"],
    },
    {
      width: 768,
      name: "tablet-entry",
      navigation: "contextual-single-mode",
      padding: 24,
      rules: ["compact-rail-or-bottom-nav-never-both", "stack-before-shrink"],
    },
    {
      width: 1024,
      name: "compact-desktop",
      navigation: "compact-rail",
      navigationWidth: 72,
      padding: 24,
      rules: ["twelve-column-capable", "type-scale-retained", "weekly-correction-applied"],
    },
    {
      width: 1280,
      name: "desktop",
      navigation: "sidebar",
      navigationWidth: 240,
      padding: 32,
      rules: ["ratios-adjust-before-type", "split-workspace-when-contextual"],
    },
    {
      width: 1440,
      name: "wide",
      navigation: "sidebar",
      navigationWidth: 240,
      padding: 40,
      rules: ["content-bounded", "whitespace-grows", "no-metric-card-wall"],
    },
  ],
  overflowContract: {
    flexGridChildMinWidth: 0,
    criticalLabelEllipsis: false,
    badgeSizing: "intrinsic",
    textContainerHeight: "min-height",
    stackWhenMinimumUnavailable: true,
  },
};

const componentStateMatrix = {
  checkpoint: "CP5-R0",
  components: {
    button: {
      variants: ["primary", "secondary", "tertiary", "destructive"],
      states: ["default", "hover", "pressed", "focus-visible", "disabled", "loading"],
      minimumTarget: 44,
      labelClippingAllowed: false,
    },
    field: {
      states: ["default", "hover", "focus", "filled", "warning", "error", "disabled", "read-only"],
      requirements: ["persistent-label", "programmatic-error", "min-height-for-scaling"],
    },
    badge: {
      states: ["information", "success", "warning", "error", "offline", "manual", "ai-source"],
      sizing: "intrinsic-with-horizontal-padding",
      colorOnly: false,
    },
    transactionRow: {
      states: ["default", "hover", "selected", "focus-visible", "sync-pending", "disabled"],
      numericAlignment: "tabular-right",
    },
    dialog: {
      states: ["open", "submitting", "error"],
      keyboard: ["initial-focus-safe-action", "focus-trap", "escape", "focus-return"],
    },
    asyncRegion: {
      states: ["loading", "empty", "offline", "error", "quota", "review", "success"],
      timerDrivenFakeProgress: false,
      contextPreservedOnFailure: true,
    },
  },
};

const precisionFindings = {
  checkpoint: "CP5-R0",
  summary: { P0: 0, P1: 0, P2: 2, P3: 5, pending: 2 },
  findings: [
    {
      id: "FT-PREC-001",
      severity: "P2",
      title: "Weekly summary safe width",
      status: "specified",
      implementationPending: true,
    },
    {
      id: "FT-PREC-002",
      severity: "P2",
      title: "Offline cached badge overflow",
      status: "specified",
      implementationPending: true,
    },
    {
      id: "FT-PREC-003",
      severity: "P3",
      title: "Sidebar authority mismatch",
      status: "documented",
      authority: "240px",
    },
    {
      id: "FT-PREC-004",
      severity: "P3",
      title: "Runtime text floor",
      status: "documented",
      criticalMinimum: "12px",
    },
    {
      id: "FT-PREC-005",
      severity: "P3",
      title: "Async state source precedence",
      status: "documented",
      authority: "CP4 split runtime states",
    },
    {
      id: "FT-PREC-006",
      severity: "P3",
      title: "1024 transition proof",
      status: "resolved-in-cp5-proof",
    },
    {
      id: "FT-PREC-007",
      severity: "P3",
      title: "Editable source authority",
      status: "documented",
      authority: "local generators and exports",
    },
    {
      id: "FT-VAL-001",
      severity: "pending",
      title: "Installed PWA physical-device test",
      status: "not-verified",
    },
    {
      id: "FT-VAL-002",
      severity: "pending",
      title: "1–2 beta-user test",
      status: "not-verified",
    },
  ],
};

const tokenCss = `:root {
  --ft-color-canvas: #f6f2e8;
  --ft-color-canvas-subtle: #fcfbf7;
  --ft-color-surface: #ffffff;
  --ft-color-ink: #0b1220;
  --ft-color-ink-secondary: #53606c;
  --ft-color-ink-warm-muted: #6b665e;
  --ft-color-primary: #285a73;
  --ft-color-primary-hover: #1f465a;
  --ft-color-primary-soft: #dceaf0;
  --ft-color-signal: #b9d86e;
  --ft-color-signal-ink: #526827;
  --ft-color-signal-soft: #edf5d5;
  --ft-color-expense: #d96c52;
  --ft-color-expense-ink: #a63d2a;
  --ft-color-expense-soft: #f8e2db;
  --ft-color-warning-ink: #8a3c00;
  --ft-color-warning-soft: #fff1d6;
  --ft-color-error: #b42318;
  --ft-color-error-soft: #fde8e7;
  --ft-color-border: #d9d6cc;
  --ft-color-divider: #e7e3da;
  --ft-color-disabled-bg: #eeeae1;
  --ft-color-disabled-ink: #6b665e;

  --ft-font-display: "Space Grotesk", sans-serif;
  --ft-font-body: "IBM Plex Sans", sans-serif;

  --ft-space-1: 0.25rem;
  --ft-space-2: 0.5rem;
  --ft-space-3: 0.75rem;
  --ft-space-4: 1rem;
  --ft-space-5: 1.25rem;
  --ft-space-6: 1.5rem;
  --ft-space-8: 2rem;
  --ft-space-10: 2.5rem;
  --ft-space-12: 3rem;
  --ft-space-16: 4rem;
  --ft-space-20: 5rem;

  --ft-radius-xs: 0.25rem;
  --ft-radius-sm: 0.5rem;
  --ft-radius-md: 0.75rem;
  --ft-radius-lg: 1rem;
  --ft-radius-xl: 1.25rem;

  --ft-shadow-1: 0 1px 2px rgb(11 18 32 / 6%);
  --ft-shadow-2: 0 8px 24px rgb(11 18 32 / 10%);
  --ft-shadow-3: 0 18px 48px rgb(11 18 32 / 16%);

  --ft-motion-fast: 120ms;
  --ft-motion-base: 180ms;
  --ft-motion-slow: 260ms;
  --ft-ease-enter: cubic-bezier(0.16, 1, 0.3, 1);
  --ft-ease-exit: cubic-bezier(0.4, 0, 1, 1);

  --ft-touch-target-min: 44px;
  --ft-control-mobile: 48px;
  --ft-control-desktop: 44px;
  --ft-focus-ring: 2px;
  --ft-focus-offset: 2px;
  --ft-sidebar-compact: 72px;
  --ft-sidebar-desktop: 240px;
  --ft-badge-offline-min: 128px;
  --ft-dashboard-weekly-min: 176px;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

.ft-flex-child,
.ft-grid-child {
  min-width: 0;
}

.ft-status-badge {
  align-items: center;
  display: inline-flex;
  justify-content: center;
  inline-size: max-content;
  max-inline-size: 100%;
  min-block-size: 28px;
  padding-inline: 10px;
}

.ft-status-badge--offline {
  min-inline-size: var(--ft-badge-offline-min, 128px);
}

.ft-dashboard-weekly {
  min-inline-size: min(176px, 100%);
}

:where(a, button, input, select, textarea, [tabindex]):focus-visible {
  outline: var(--ft-focus-ring, 2px) solid var(--ft-color-primary);
  outline-offset: var(--ft-focus-offset, 2px);
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
`;

async function writeJson(name, value) {
  await fs.writeFile(
    path.join(ROOT, name),
    `${JSON.stringify(value, null, 2)}\n`,
    "utf8",
  );
}

const generated = [];
for (const [name, svg] of [
  ["CP5_R0_QA_OVERVIEW", qaOverviewBoard()],
  ["CP5_R0_PRECISION_CORRECTIONS", precisionCorrectionsBoard()],
  ["CP5_R0_ACCESSIBILITY_RESPONSIVE", accessibilityResponsiveBoard()],
  ["CP5_R0_HANDOFF_MAP", handoffMapBoard()],
]) {
  generated.push(...(await writeSvgAndPng(path.join(ROOT, name), svg)));
}
generated.push(
  ...(await writeSvgAndPng(
    path.join(PROOF_DIR, "compact-dashboard-1024-cp5-r0"),
    compactDashboard1024(),
  )),
);

await writeJson("final-design-tokens.json", finalTokens);
await fs.writeFile(path.join(ROOT, "final-design-tokens.css"), tokenCss, "utf8");
await writeJson("responsive-contract.json", responsiveContract);
await writeJson("component-state-matrix.json", componentStateMatrix);
await writeJson("precision-findings.json", precisionFindings);

const cp2 = JSON.parse(
  await fs.readFile(path.join(DESIGN_PROOF, "local-cp2", "manifest.json"), "utf8"),
);
const cp3 = JSON.parse(
  await fs.readFile(path.join(DESIGN_PROOF, "local-cp3", "manifest.json"), "utf8"),
);
const cp4 = JSON.parse(
  await fs.readFile(path.join(DESIGN_PROOF, "local-cp4", "manifest.json"), "utf8"),
);
const logo = JSON.parse(
  await fs.readFile(path.join(DESIGN_PROOF, "logo-r1", "manifest.json"), "utf8"),
);

const authorityFiles = new Set([
  "DESIGN_SYSTEM.md",
  "design-proof/DESIGN_PROOF_SPEC.md",
  "design-proof/CHECKPOINT_TRACKER.md",
  "design-proof/local-cp5/CP5_R0_FINAL_LOCK.md",
  "design-proof/local-cp1/review-notes/CP1_FINAL_LOCK.md",
  "design-proof/local-cp2/CP2_R0_FINAL_LOCK.md",
  "design-proof/local-cp2/cp2-ui-tokens.json",
  "design-proof/local-cp3/CP3_R0_FINAL_LOCK.md",
  "design-proof/local-cp3/cp3-ui-tokens.json",
  "design-proof/local-cp4/CP4_R0_FINAL_LOCK.md",
  "design-proof/local-cp4/cp4-interaction-model.json",
  "design-proof/logo-r1/LOGO_R1_FINAL_LOCK.md",
  "design-proof/logo-r1/logo-tokens.json",
]);

for (const frame of cp2.frames) {
  authorityFiles.add(`design-proof/local-cp2/${frame.svg}`);
  authorityFiles.add(`design-proof/local-cp2/${frame.png}`);
}
for (const stem of ["dashboard", "transactions", "review"]) {
  authorityFiles.add(
    `design-proof/local-cp2/tests/${stem}-360-px-cp2-r0.svg`,
  );
  authorityFiles.add(
    `design-proof/local-cp2/tests/${stem}-360-px-cp2-r0.png`,
  );
}
for (const frame of cp3.frames) {
  authorityFiles.add(`design-proof/local-cp3/${frame.svg}`);
  authorityFiles.add(`design-proof/local-cp3/${frame.png}`);
}
for (const frame of cp3.spotchecks) {
  authorityFiles.add(`design-proof/local-cp3/${frame.svg}`);
  authorityFiles.add(`design-proof/local-cp3/${frame.png}`);
}
for (const frame of cp4.stateFrames) {
  authorityFiles.add(`design-proof/local-cp4/${frame.svg}`);
  authorityFiles.add(`design-proof/local-cp4/${frame.png}`);
}
for (const file of cp4.prototype) {
  authorityFiles.add(`design-proof/local-cp4/${file}`);
}
for (const file of logo.files.filter((file) => file.startsWith("assets/"))) {
  authorityFiles.add(`design-proof/logo-r1/${file}`);
}

const inventory = [];
for (const relativePath of [...authorityFiles].sort()) {
  const fullPath = path.join(PROJECT_ROOT, ...relativePath.split("/"));
  const data = await fs.readFile(fullPath);
  inventory.push({
    path: relativePath,
    bytes: data.length,
    sha256: crypto.createHash("sha256").update(data).digest("hex"),
  });
}
await writeJson("asset-inventory.json", {
  project: "Fintrack AI",
  checkpoint: "CP5-R0",
  generatedAt: "2026-07-29",
  authorityFileCount: inventory.length,
  files: inventory,
});

const manifest = {
  project: "Fintrack AI",
  checkpoint: "CP5",
  revision: "R0",
  direction: "Quiet Signal — Refined",
  status: "Final / Locked",
  generatedAt: "2026-07-29",
  sourceLocks: {
    content: "../local-cp1/review-notes/CP1_FINAL_LOCK.md",
    logo: "../logo-r1/LOGO_R1_FINAL_LOCK.md",
    mobile: "../local-cp2/CP2_R0_FINAL_LOCK.md",
    desktop: "../local-cp3/CP3_R0_FINAL_LOCK.md",
    interaction: "../local-cp4/CP4_R0_FINAL_LOCK.md",
  },
  finalLock: "CP5_R0_FINAL_LOCK.md",
  upstreamVerification: {
    cp2: "98/98",
    cp3: "106/106",
    cp4: "221/221",
    logo: "236/236",
    combined: "661/661",
  },
  findings: precisionFindings.summary,
  externalValidation: {
    installedPwaPhysicalDevice: "not verified",
    betaUsers: "not performed",
    runtimeAccessibility: "implementation required",
  },
  boards: [
    "CP5_R0_QA_OVERVIEW.svg",
    "CP5_R0_QA_OVERVIEW.png",
    "CP5_R0_PRECISION_CORRECTIONS.svg",
    "CP5_R0_PRECISION_CORRECTIONS.png",
    "CP5_R0_ACCESSIBILITY_RESPONSIVE.svg",
    "CP5_R0_ACCESSIBILITY_RESPONSIVE.png",
    "CP5_R0_HANDOFF_MAP.svg",
    "CP5_R0_HANDOFF_MAP.png",
  ],
  proofs: [
    "proof/compact-dashboard-1024-cp5-r0.svg",
    "proof/compact-dashboard-1024-cp5-r0.png",
  ],
  machineHandoff: [
    "final-design-tokens.json",
    "final-design-tokens.css",
    "responsive-contract.json",
    "component-state-matrix.json",
    "precision-findings.json",
    "asset-inventory.json",
  ],
  documentation: [
    "README.md",
    "CP5_R0_SPEC.md",
    "CP5_R0_VISUAL_QA_REPORT.md",
    "CP5_R0_IMPLEMENTATION_HANDOFF.md",
    "CP5_R0_ACCESSIBILITY_MATRIX.md",
    "CP5_R0_DESIGN_SYSTEM_DELTA.md",
    "CP5_R0_BETA_TEST_SCRIPT.md",
    "CP5_R0_FINAL_LOCK.md",
    "review-notes/CP5_R0_SELF_CRITIQUE.md",
    "review-notes/CP5_R0_BROWSER_QA.md",
  ],
  preview: [
    "preview/index.html",
    "preview/styles.css",
    "preview/mobile-qa.html",
  ],
  generatedFiles: generated.map((filePath) =>
    path.relative(ROOT, filePath).replaceAll("\\", "/"),
  ),
};
await writeJson("manifest.json", manifest);

console.log(
  JSON.stringify(
    {
      root: ROOT,
      status: manifest.status,
      boards: manifest.boards.length / 2,
      proofs: manifest.proofs.length / 2,
      authorityFiles: inventory.length,
      generatedFiles: generated.length,
    },
    null,
    2,
  ),
);
