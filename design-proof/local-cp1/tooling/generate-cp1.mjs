import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const ROOT = "D:\\Kuliah\\Bahan Kuliah\\Matkul\\Vscode\\fintrack-ai\\design-proof\\local-cp1";
const MOBILE = path.join(ROOT, "mobile");
const DESKTOP = path.join(ROOT, "desktop");

const C = {
  canvas: "#F6F2E8",
  subtle: "#FCFBF7",
  surface: "#FFFFFF",
  ink: "#0B1220",
  secondary: "#53606C",
  muted: "#6B665E",
  primary: "#285A73",
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
  wire: "#A8A49B",
  darkLine: "#647083",
};

const BODY = "IBM Plex Sans, Arial, sans-serif";
const DISPLAY = "Space Grotesk, Arial, sans-serif";

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function rect(x, y, w, h, options = {}) {
  const {
    fill = "none",
    stroke = "none",
    sw = 1,
    r = 0,
    opacity = 1,
    dash = "",
  } = options;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`;
}

function line(x1, y1, x2, y2, options = {}) {
  const { stroke = C.border, sw = 1, dash = "", opacity = 1 } = options;
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" opacity="${opacity}"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`;
}

function circle(cx, cy, r, options = {}) {
  const { fill = "none", stroke = "none", sw = 1, opacity = 1 } = options;
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}"/>`;
}

function text(x, y, value, options = {}) {
  const {
    size = 14,
    fill = C.ink,
    weight = 400,
    family = BODY,
    anchor = "start",
    opacity = 1,
    letter = 0,
  } = options;
  return `<text x="${x}" y="${y}" fill="${fill}" font-family="${family}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" opacity="${opacity}" letter-spacing="${letter}">${esc(value)}</text>`;
}

function multiline(x, y, lines, options = {}) {
  const {
    size = 14,
    fill = C.ink,
    weight = 400,
    family = BODY,
    lineHeight = Math.round(size * 1.45),
    anchor = "start",
  } = options;
  return lines
    .map((value, index) =>
      text(x, y + index * lineHeight, value, { size, fill, weight, family, anchor }),
    )
    .join("");
}

function labelPill(x, y, value, options = {}) {
  const {
    fill = C.primarySoft,
    color = C.primary,
    width = Math.max(54, value.length * 7 + 20),
  } = options;
  return [
    rect(x, y, width, 26, { fill, r: 8 }),
    text(x + width / 2, y + 17, value, { size: 11, fill: color, weight: 600, anchor: "middle" }),
  ].join("");
}

function icon(x, y, type, color = C.secondary, size = 20) {
  const s = size;
  const cx = x + s / 2;
  const cy = y + s / 2;
  if (type === "home") {
    return `<path d="M${x + 2} ${y + 9} L${cx} ${y + 2} L${x + s - 2} ${y + 9} V${y + s - 2} H${x + 5} V${y + 11} H${x + s - 5} V${y + s - 2} H${x + 2} Z" fill="none" stroke="${color}" stroke-width="1.6" stroke-linejoin="round"/>`;
  }
  if (type === "list") {
    return [3, 9, 15]
      .map((dy) => `${circle(x + 3, y + dy, 1.2, { fill: color })}${line(x + 7, y + dy, x + s - 1, y + dy, { stroke: color, sw: 1.6 })}`)
      .join("");
  }
  if (type === "scan") {
    return [
      line(x + 2, y + 7, x + 2, y + 2, { stroke: color, sw: 1.8 }),
      line(x + 2, y + 2, x + 7, y + 2, { stroke: color, sw: 1.8 }),
      line(x + s - 2, y + 7, x + s - 2, y + 2, { stroke: color, sw: 1.8 }),
      line(x + s - 2, y + 2, x + s - 7, y + 2, { stroke: color, sw: 1.8 }),
      line(x + 2, y + s - 7, x + 2, y + s - 2, { stroke: color, sw: 1.8 }),
      line(x + 2, y + s - 2, x + 7, y + s - 2, { stroke: color, sw: 1.8 }),
      line(x + s - 2, y + s - 7, x + s - 2, y + s - 2, { stroke: color, sw: 1.8 }),
      line(x + s - 2, y + s - 2, x + s - 7, y + s - 2, { stroke: color, sw: 1.8 }),
    ].join("");
  }
  if (type === "user") {
    return `${circle(cx, y + 6, 4, { stroke: color, sw: 1.6 })}<path d="M${x + 3} ${y + s - 2} C${x + 4} ${y + 13}, ${x + s - 4} ${y + 13}, ${x + s - 3} ${y + s - 2}" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round"/>`;
  }
  if (type === "camera") {
    return `${rect(x + 1, y + 5, s - 2, s - 7, { stroke: color, sw: 1.6, r: 3 })}${rect(x + 6, y + 2, s - 12, 5, { stroke: color, sw: 1.6, r: 2 })}${circle(cx, y + 12, 4, { stroke: color, sw: 1.6 })}`;
  }
  if (type === "chevron") {
    return `<path d="M${x + 4} ${y + 2} L${x} ${y + 6} L${x + 4} ${y + 10}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  if (type === "check") {
    return `<path d="M${x + 2} ${y + 7} L${x + 6} ${y + 11} L${x + 13} ${y + 3}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  if (type === "alert") {
    return `<path d="M${cx} ${y + 1} L${x + s - 1} ${y + s - 2} H${x + 1} Z" fill="none" stroke="${color}" stroke-width="1.6" stroke-linejoin="round"/>${line(cx, y + 6, cx, y + 12, { stroke: color, sw: 1.8 })}${circle(cx, y + 16, 1, { fill: color })}`;
  }
  return circle(cx, cy, s / 3, { stroke: color, sw: 1.5 });
}

function button(x, y, w, label, options = {}) {
  const {
    variant = "primary",
    iconType = "",
    h = 48,
  } = options;
  const styles = {
    primary: { fill: C.primary, stroke: C.primary, color: C.surface },
    secondary: { fill: C.surface, stroke: C.primary, color: C.primary },
    tertiary: { fill: "none", stroke: "none", color: C.primary },
    destructive: { fill: C.error, stroke: C.error, color: C.surface },
    quietDestructive: { fill: C.surface, stroke: C.error, color: C.error },
  }[variant];
  const iconOffset = iconType ? 12 : 0;
  return [
    rect(x, y, w, h, { fill: styles.fill, stroke: styles.stroke, sw: 1, r: 12 }),
    iconType ? icon(x + 16, y + (h - 20) / 2, iconType, styles.color, 20) : "",
    text(x + w / 2 + iconOffset, y + h / 2 + 5, label, {
      size: 14,
      fill: styles.color,
      weight: 600,
      anchor: "middle",
    }),
  ].join("");
}

function field(x, y, w, label, value, options = {}) {
  const { warning = false, h = 58, suffix = "" } = options;
  const stroke = warning ? C.warning : C.border;
  return [
    text(x, y, label, { size: 12, fill: C.secondary, weight: 500 }),
    rect(x, y + 8, w, h, { fill: C.surface, stroke, sw: warning ? 1.5 : 1, r: 10 }),
    text(x + 14, y + 8 + h / 2 + 5, value, { size: 15, fill: C.ink, weight: 500 }),
    suffix ? text(x + w - 14, y + 8 + h / 2 + 4, suffix, { size: 12, fill: C.secondary, weight: 500, anchor: "end" }) : "",
    warning ? labelPill(x + w - 116, y - 9, "Perlu diperiksa", { fill: C.warningSoft, color: C.warning, width: 116 }) : "",
  ].join("");
}

function topStatus(width, dark = false) {
  const color = dark ? C.surface : C.ink;
  return [
    text(18, 19, "09:41", { size: 11, fill: color, weight: 600 }),
    line(width - 58, 13, width - 49, 13, { stroke: color, sw: 1.8 }),
    line(width - 45, 16, width - 37, 10, { stroke: color, sw: 1.6 }),
    rect(width - 30, 9, 17, 9, { stroke: color, sw: 1.3, r: 2 }),
    rect(width - 12, 12, 2, 4, { fill: color, r: 1 }),
  ].join("");
}

function mobileHeader(title, options = {}) {
  const { back = false, dark = false, action = "" } = options;
  const fg = dark ? C.surface : C.ink;
  return [
    topStatus(390, dark),
    back ? icon(18, 43, "chevron", fg, 12) : text(18, 58, "Fintrack AI", { size: 14, fill: fg, weight: 600, family: DISPLAY }),
    text(back ? 42 : 18, back ? 55 : 91, title, {
      size: back ? 18 : 26,
      fill: fg,
      weight: 600,
      family: DISPLAY,
    }),
    action ? text(372, 55, action, { size: 13, fill: dark ? C.surface : C.primary, weight: 600, anchor: "end" }) : "",
    !back ? circle(354, 54, 18, { fill: dark ? "#202A39" : C.primarySoft, stroke: dark ? C.darkLine : "none" }) : "",
    !back ? text(354, 59, "MS", { size: 11, fill: dark ? C.surface : C.primary, weight: 600, anchor: "middle" }) : "",
  ].join("");
}

function mobileNav(active = "Dashboard") {
  const items = [
    ["Dashboard", "home"],
    ["Transaksi", "list"],
    ["Scan", "scan"],
    ["Profil", "user"],
  ];
  const centers = [52, 149, 246, 338];
  return [
    rect(0, 770, 390, 74, { fill: C.surface }),
    line(0, 770, 390, 770, { stroke: C.divider }),
    ...items.map(([label, type], index) => {
      const isActive = label === active;
      const color = isActive ? C.primary : C.secondary;
      const selected = type === "scan" ? rect(centers[index] - 27, 778, 54, 34, { fill: isActive ? C.primarySoft : C.subtle, r: 12 }) : "";
      return [
        selected,
        icon(centers[index] - 10, 785, type, color, 20),
        text(centers[index], 828, label, { size: 10, fill: color, weight: isActive ? 600 : 500, anchor: "middle" }),
      ].join("");
    }),
  ].join("");
}

function transactionRowMobile(y, merchant, meta, amount, options = {}) {
  const { source = "AI · Struk", accent = C.primarySoft, mark = C.primary } = options;
  return [
    rect(18, y, 354, 70, { fill: C.surface, stroke: C.divider, r: 12 }),
    rect(30, y + 15, 38, 38, { fill: accent, r: 10 }),
    circle(49, y + 34, 6, { fill: mark }),
    text(80, y + 26, merchant, { size: 14, weight: 600 }),
    text(80, y + 48, `${meta} · ${source}`, { size: 11, fill: C.secondary }),
    text(357, y + 37, amount, { size: 13, fill: C.expenseInk, weight: 600, anchor: "end" }),
  ].join("");
}

function appSidebar(active = "Dashboard") {
  const items = [
    ["Dashboard", "home"],
    ["Transaksi", "list"],
    ["Scan struk", "scan"],
    ["Profil", "user"],
  ];
  return [
    rect(0, 0, 240, 1024, { fill: C.ink }),
    icon(28, 29, "scan", C.signal, 24),
    text(62, 47, "Fintrack AI", { size: 18, fill: C.surface, weight: 600, family: DISPLAY }),
    text(28, 91, "PERSONAL FINANCE", { size: 10, fill: "#9FA9B7", weight: 600, letter: 1.3 }),
    ...items.map(([label, type], index) => {
      const y = 116 + index * 58;
      const isActive = label === active;
      return [
        isActive ? rect(18, y, 204, 44, { fill: "#1E3141", r: 10 }) : "",
        isActive ? rect(18, y + 10, 3, 24, { fill: C.signal, r: 2 }) : "",
        icon(34, y + 12, type, isActive ? C.surface : "#AAB3BF", 20),
        text(68, y + 28, label, { size: 14, fill: isActive ? C.surface : "#AAB3BF", weight: isActive ? 600 : 500 }),
      ].join("");
    }),
    rect(18, 936, 204, 62, { fill: "#121E2A", stroke: "#314051", r: 12 }),
    circle(44, 967, 15, { fill: C.primary }),
    text(70, 961, "Mario Sianturi", { size: 12, fill: C.surface, weight: 600 }),
    text(70, 980, "Akun pribadi", { size: 10, fill: "#9FA9B7" }),
  ].join("");
}

function desktopHeader(title, subtitle, action = "") {
  return [
    text(280, 56, title, { size: 30, weight: 600, family: DISPLAY }),
    text(280, 82, subtitle, { size: 14, fill: C.secondary }),
    action ? button(1190, 34, 202, action, { h: 48, iconType: "scan" }) : "",
    line(280, 106, 1392, 106, { stroke: C.divider }),
  ].join("");
}

function svg(width, height, content, options = {}) {
  const { bg = C.canvas, title = "" } = options;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(title)}">
  <rect width="${width}" height="${height}" fill="${bg}"/>
  ${content}
</svg>`;
}

function mobileDashboard() {
  const bars = [
    ["Makan & minum", "Rp1.214.000", 148, C.expense],
    ["Belanja", "Rp824.500", 101, "#8A6FA8"],
    ["Tagihan", "Rp760.000", 92, "#B48A32"],
  ];
  return svg(390, 844, [
    mobileHeader("Ringkasan pengeluaran"),
    text(18, 122, "JULI 2026", { size: 11, fill: C.secondary, weight: 600, letter: 1 }),
    text(18, 160, "Rp3.482.500", { size: 32, weight: 600, family: DISPLAY }),
    text(18, 184, "Sedikit lebih tinggi dari Juni", { size: 12, fill: C.secondary }),
    button(18, 204, 171, "Tambah manual", { variant: "secondary", h: 46 }),
    button(201, 204, 171, "Scan struk", { h: 46, iconType: "scan" }),
    rect(18, 268, 354, 98, { fill: C.primarySoft, r: 16 }),
    labelPill(32, 282, "Insight mingguan", { fill: C.surface, color: C.primary, width: 124 }),
    multiline(32, 329, ["Pengeluaran makanmu sedikit meningkat", "dibanding minggu lalu."], { size: 14, weight: 500, lineHeight: 20 }),
    text(18, 400, "Distribusi kategori", { size: 18, weight: 600, family: DISPLAY }),
    text(372, 400, "Lihat detail", { size: 12, fill: C.primary, weight: 600, anchor: "end" }),
    rect(18, 416, 354, 158, { fill: C.surface, stroke: C.border, r: 14 }),
    ...bars.map(([name, amount, width, color], index) => {
      const y = 439 + index * 42;
      return [
        text(32, y, name, { size: 12, fill: C.secondary, weight: 500 }),
        text(356, y, amount, { size: 12, weight: 600, anchor: "end" }),
        rect(32, y + 10, 228, 8, { fill: C.disabled, r: 4 }),
        rect(32, y + 10, width, 8, { fill: color, r: 4 }),
      ].join("");
    }),
    text(18, 611, "Transaksi terbaru", { size: 18, weight: 600, family: DISPLAY }),
    text(372, 611, "Semua", { size: 12, fill: C.primary, weight: 600, anchor: "end" }),
    transactionRowMobile(626, "Superindo", "12 Jul · Belanja", "−Rp326.500"),
    transactionRowMobile(704, "Kedai Sela", "11 Jul · Makan", "−Rp48.000", { accent: C.expenseSoft, mark: C.expense }),
    mobileNav("Dashboard"),
  ].join(""), { title: "Mobile dashboard default CP1" });
}

function mobileDashboardStates() {
  const stateCard = (y, titleValue, status, content) => [
    text(18, y, titleValue, { size: 12, fill: C.secondary, weight: 600, letter: 0.8 }),
    rect(18, y + 12, 354, 166, { fill: C.surface, stroke: C.border, r: 14 }),
    content,
    labelPill(276, y + 24, status, {
      width: 80,
      fill: status === "Offline" ? C.primarySoft : status === "Empty" ? C.subtle : C.signalSoft,
      color: status === "Offline" ? C.primary : status === "Empty" ? C.secondary : C.signalInk,
    }),
  ].join("");
  const loading = [
    rect(32, 147, 112, 12, { fill: C.disabled, r: 5 }),
    rect(32, 173, 216, 26, { fill: C.disabled, r: 6 }),
    rect(32, 216, 324, 42, { fill: C.subtle, stroke: C.divider, r: 10 }),
  ].join("");
  const empty = [
    icon(34, 332, "list", C.primary, 26),
    text(75, 347, "Belum ada transaksi bulan ini", { size: 14, weight: 600 }),
    text(75, 369, "Tambahkan manual atau scan struk pertama.", { size: 11, fill: C.secondary }),
    button(75, 389, 156, "Tambah transaksi", { h: 38 }),
  ].join("");
  const offline = [
    rect(32, 515, 324, 58, { fill: C.primarySoft, r: 10 }),
    icon(44, 532, "alert", C.primary, 20),
    multiline(75, 538, ["Kamu sedang offline.", "Data tersimpan masih dapat dilihat."], { size: 12, lineHeight: 18, weight: 500 }),
    transactionRowMobile(586, "PLN", "08 Jul · Tagihan", "−Rp350.000", { source: "Tersimpan" }),
  ].join("");
  return svg(390, 844, [
    mobileHeader("State dashboard"),
    text(18, 118, "Tiga kondisi menjaga layout dan tindakan tetap jelas.", { size: 12, fill: C.secondary }),
    stateCard(128, "LOADING", "Loading", loading),
    stateCard(313, "EMPTY", "Empty", empty),
    stateCard(498, "OFFLINE / CACHED", "Offline", offline),
    mobileNav("Dashboard"),
  ].join(""), { title: "Mobile dashboard states CP1" });
}

function mobileTransactionsList() {
  return svg(390, 844, [
    mobileHeader("Transaksi"),
    rect(18, 111, 260, 46, { fill: C.surface, stroke: C.border, r: 12 }),
    circle(38, 134, 7, { stroke: C.secondary, sw: 1.5 }),
    line(43, 139, 48, 144, { stroke: C.secondary, sw: 1.5 }),
    text(57, 139, "Cari merchant atau catatan", { size: 12, fill: C.secondary }),
    rect(290, 111, 82, 46, { fill: C.surface, stroke: C.primary, r: 12 }),
    text(331, 139, "Filter", { size: 12, fill: C.primary, weight: 600, anchor: "middle" }),
    text(18, 185, "JULI 2026", { size: 11, fill: C.secondary, weight: 600, letter: 1 }),
    text(372, 185, "Rp3.482.500", { size: 13, weight: 600, anchor: "end" }),
    text(18, 219, "Hari ini", { size: 14, weight: 600 }),
    transactionRowMobile(230, "Superindo", "12 Jul · Belanja", "−Rp326.500"),
    transactionRowMobile(308, "Kedai Sela", "12 Jul · Makan", "−Rp48.000", { accent: C.expenseSoft, mark: C.expense }),
    text(18, 410, "Minggu ini", { size: 14, weight: 600 }),
    transactionRowMobile(421, "KRL", "10 Jul · Transportasi", "−Rp20.000", { source: "Manual" }),
    transactionRowMobile(499, "PLN", "08 Jul · Tagihan", "−Rp350.000", { accent: C.warningSoft, mark: "#B48A32" }),
    transactionRowMobile(577, "Kedai Sela", "07 Jul · Makan", "−Rp64.000", { accent: C.expenseSoft, mark: C.expense }),
    transactionRowMobile(655, "Superindo", "05 Jul · Belanja", "−Rp284.000"),
    mobileNav("Transaksi"),
  ].join(""), { title: "Mobile transactions list CP1" });
}

function mobileTransactionDetail() {
  return svg(390, 844, [
    mobileHeader("Edit transaksi", { back: true, action: "Simpan" }),
    rect(18, 86, 354, 92, { fill: C.subtle, stroke: C.border, r: 14 }),
    labelPill(32, 102, "AI · Struk", { width: 82 }),
    text(32, 152, "−Rp326.500", { size: 26, fill: C.expenseInk, weight: 600, family: DISPLAY }),
    text(356, 150, "12 Jul 2026", { size: 12, fill: C.secondary, anchor: "end" }),
    field(18, 213, 354, "Merchant", "Superindo"),
    field(18, 305, 354, "Total pengeluaran", "Rp326.500", { suffix: "IDR" }),
    field(18, 397, 171, "Tanggal", "12 Jul 2026"),
    field(201, 397, 171, "Kategori", "Belanja"),
    field(18, 489, 354, "Catatan", "Belanja kebutuhan rumah", { h: 70 }),
    rect(18, 595, 354, 54, { fill: C.primarySoft, r: 10 }),
    text(32, 618, "Sumber transaksi", { size: 11, fill: C.secondary, weight: 500 }),
    text(32, 638, "Hasil scan struk · sudah ditinjau", { size: 13, fill: C.primary, weight: 600 }),
    text(18, 690, "Hapus transaksi", { size: 13, fill: C.error, weight: 600 }),
    line(18, 713, 372, 713, { stroke: C.divider }),
    button(18, 728, 354, "Simpan perubahan", { h: 48 }),
  ].join(""), { title: "Mobile transaction detail and edit CP1" });
}

function cropFrame(x, y, w, h, options = {}) {
  const { color = C.primary, bg = C.subtle, dark = false } = options;
  const len = 30;
  const parts = [rect(x, y, w, h, { fill: bg, stroke: dark ? C.darkLine : C.divider, r: 16 })];
  const points = [
    [x + 12, y + 12, 1, 1],
    [x + w - 12, y + 12, -1, 1],
    [x + 12, y + h - 12, 1, -1],
    [x + w - 12, y + h - 12, -1, -1],
  ];
  for (const [px, py, dx, dy] of points) {
    parts.push(line(px, py, px + dx * len, py, { stroke: color, sw: 2 }));
    parts.push(line(px, py, px, py + dy * len, { stroke: color, sw: 2 }));
  }
  return parts.join("");
}

function receiptPlaceholder(x, y, w, h, dark = false) {
  const paper = dark ? "#EDE9DE" : C.surface;
  const detailLineCount = h < 100 ? 1 : 5;
  return [
    rect(x, y, w, h, { fill: paper, stroke: dark ? "#9199A4" : C.border, r: 5 }),
    rect(x + 14, y + 14, w * 0.42, 8, { fill: "#A9A69E", r: 3 }),
    ...Array.from({ length: detailLineCount }, (_, i) => line(x + 14, y + 40 + i * 22, x + w - 14 - (i % 2) * 32, y + 40 + i * 22, { stroke: "#C9C5BC", sw: i === detailLineCount - 1 ? 2 : 1 })),
    line(x + 14, y + h - 30, x + w - 14, y + h - 30, { stroke: "#98958E", sw: 2 }),
  ].join("");
}

function mobileScanStart() {
  return svg(390, 844, [
    mobileHeader("Scan struk", { back: true, action: "Batal" }),
    text(18, 91, "LANGKAH 1 DARI 4", { size: 10, fill: C.secondary, weight: 600, letter: 1 }),
    multiline(18, 130, ["Foto strukmu", "dengan jelas"], { size: 26, weight: 600, family: DISPLAY, lineHeight: 31 }),
    text(18, 204, "Pastikan seluruh struk masuk ke dalam bingkai.", { size: 13, fill: C.secondary }),
    cropFrame(18, 230, 354, 294),
    icon(174, 336, "camera", C.primary, 42),
    text(195, 400, "Belum ada foto dipilih", { size: 13, fill: C.secondary, anchor: "middle" }),
    rect(18, 544, 354, 72, { fill: C.primarySoft, r: 12 }),
    icon(32, 565, "alert", C.primary, 20),
    multiline(64, 570, ["Pastikan struk tidak menampilkan nomor kartu", "lengkap sebelum upload."], { size: 12, fill: C.ink, lineHeight: 18, weight: 500 }),
    button(18, 638, 354, "Ambil foto", { h: 48, iconType: "camera" }),
    button(18, 698, 354, "Pilih dari galeri", { h: 48, variant: "secondary" }),
    text(195, 776, "Foto akan dikompres sebelum diunggah.", { size: 11, fill: C.secondary, anchor: "middle" }),
  ].join(""), { title: "Mobile scan start CP1" });
}

function processStep(x, y, label, state = "pending", dark = false) {
  const fg = dark ? C.surface : C.ink;
  const secondary = dark ? "#AAB3BF" : C.secondary;
  const map = {
    done: { fill: C.signal, icon: C.ink, text: fg },
    active: { fill: dark ? C.primary : C.primarySoft, icon: dark ? C.surface : C.primary, text: fg },
    pending: { fill: dark ? "#283444" : C.disabled, icon: secondary, text: secondary },
  }[state];
  return [
    circle(x + 11, y + 11, 11, { fill: map.fill }),
    state === "done" ? icon(x + 4, y + 4, "check", map.icon, 14) : circle(x + 11, y + 11, 3, { fill: map.icon }),
    text(x + 34, y + 16, label, { size: 13, fill: map.text, weight: state === "active" ? 600 : 500 }),
  ].join("");
}

function mobileScanUpload() {
  return svg(390, 844, [
    mobileHeader("Menyiapkan struk", { back: true, action: "Batal" }),
    text(18, 91, "LANGKAH 2 DARI 4", { size: 10, fill: C.secondary, weight: 600, letter: 1 }),
    cropFrame(18, 112, 354, 296),
    receiptPlaceholder(112, 137, 166, 246),
    labelPill(250, 370, "412 KB", { fill: C.signalSoft, color: C.signalInk, width: 92 }),
    text(18, 448, "Menyiapkan foto dengan aman", { size: 20, weight: 600, family: DISPLAY }),
    multiline(18, 477, ["Ukuran foto diperkecil sebelum upload agar", "penyimpanan tetap efisien."], { size: 13, fill: C.secondary, lineHeight: 19 }),
    line(29, 535, 29, 659, { stroke: C.primary, sw: 2 }),
    processStep(18, 534, "Memeriksa format foto", "done"),
    processStep(18, 578, "Mengompres foto", "done"),
    processStep(18, 622, "Mengunggah dengan aman", "active"),
    rect(18, 684, 354, 58, { fill: C.subtle, stroke: C.border, r: 10 }),
    text(32, 708, "Tidak ada transaksi yang disimpan pada tahap ini.", { size: 11, fill: C.secondary }),
    text(32, 727, "Kamu masih dapat membatalkan.", { size: 11, fill: C.secondary }),
  ].join(""), { title: "Mobile scan compression and upload CP1" });
}

function mobileScanProcessing() {
  return svg(390, 844, [
    mobileHeader("Memeriksa struk", { back: true, dark: true, action: "Batal" }),
    text(18, 91, "LANGKAH 3 DARI 4", { size: 10, fill: "#AAB3BF", weight: 600, letter: 1 }),
    cropFrame(18, 114, 354, 348, { color: C.signal, bg: "#121D2A", dark: true }),
    receiptPlaceholder(108, 142, 174, 290, true),
    line(70, 286, 320, 286, { stroke: C.signal, sw: 2 }),
    rect(138, 444, 114, 28, { fill: C.signalSoft, r: 8 }),
    text(195, 462, "Membaca struk", { size: 11, fill: C.signalInk, weight: 600, anchor: "middle" }),
    text(18, 511, "AI sedang menyusun hasil", { size: 21, fill: C.surface, weight: 600, family: DISPLAY }),
    multiline(18, 540, ["Kami akan meminta kamu meninjau merchant,", "total, tanggal, dan kategori sebelum disimpan."], { size: 13, fill: "#B9C0CA", lineHeight: 19 }),
    line(29, 602, 29, 726, { stroke: C.darkLine, sw: 2 }),
    processStep(18, 601, "Foto dikompres", "done", true),
    processStep(18, 645, "Diunggah dengan aman", "done", true),
    processStep(18, 689, "Membaca dan mengelompokkan data", "active", true),
    text(195, 780, "Tidak ada persentase estimasi yang ditampilkan.", { size: 11, fill: "#8994A3", anchor: "middle" }),
  ].join(""), { bg: C.ink, title: "Mobile AI focused inspection processing CP1" });
}

function mobileScanReview() {
  return svg(390, 844, [
    mobileHeader("Tinjau hasil scan", { back: true }),
    text(18, 91, "LANGKAH 4 DARI 4", { size: 10, fill: C.secondary, weight: 600, letter: 1 }),
    text(18, 116, "Periksa sebelum transaksi disimpan.", { size: 13, fill: C.secondary }),
    rect(18, 140, 354, 86, { fill: C.subtle, stroke: C.border, r: 12 }),
    receiptPlaceholder(31, 152, 48, 62),
    text(95, 170, "Struk Superindo", { size: 14, weight: 600 }),
    text(95, 193, "Foto 412 KB · siap ditinjau", { size: 11, fill: C.secondary }),
    labelPill(272, 164, "AI · Struk", { width: 84 }),
    field(18, 260, 354, "Merchant", "Superindo"),
    field(18, 352, 354, "Total pengeluaran", "Rp326.500", { suffix: "IDR" }),
    field(18, 444, 171, "Tanggal", "12 Jul 2026"),
    field(201, 444, 171, "Kategori", "Belanja", { warning: true }),
    field(18, 536, 354, "Item terdeteksi", "5 item · lihat rincian", { suffix: "Buka" }),
    rect(18, 637, 354, 55, { fill: C.warningSoft, r: 10 }),
    icon(32, 655, "alert", C.warning, 18),
    multiline(62, 658, ["Kategori perlu diperiksa karena beberapa", "item tidak terbaca penuh."], { size: 11, fill: C.warning, lineHeight: 17, weight: 500 }),
    button(18, 717, 354, "Simpan transaksi", { h: 48 }),
    text(195, 788, "Semua field dapat diedit.", { size: 11, fill: C.secondary, anchor: "middle" }),
  ].join(""), { title: "Mobile AI receipt review CP1" });
}

function mobileScanQuota() {
  return svg(390, 844, [
    mobileHeader("Scan belum tersedia", { back: true }),
    rect(18, 103, 354, 170, { fill: C.warningSoft, stroke: "#E3C796", r: 16 }),
    circle(62, 150, 24, { fill: C.surface }),
    icon(51, 139, "alert", C.warning, 22),
    text(98, 138, "Pemindaian AI sedang sibuk", { size: 16, fill: C.warning, weight: 600, family: DISPLAY }),
    multiline(98, 164, ["Transaksi belum disimpan.", "Kamu dapat mencoba lagi nanti."], { size: 12, fill: C.warning, lineHeight: 19 }),
    line(32, 211, 356, 211, { stroke: "#E3C796" }),
    text(32, 240, "Tidak ada detail teknis atau kode error.", { size: 11, fill: C.warning }),
    text(18, 315, "Foto tetap tersedia", { size: 18, weight: 600, family: DISPLAY }),
    rect(18, 331, 354, 98, { fill: C.surface, stroke: C.border, r: 12 }),
    receiptPlaceholder(32, 344, 54, 72),
    text(102, 365, "Struk Superindo", { size: 14, weight: 600 }),
    text(102, 388, "412 KB · belum disimpan", { size: 11, fill: C.secondary }),
    labelPill(226, 365, "Tersedia sementara", { fill: C.signalSoft, color: C.signalInk, width: 130 }),
    text(18, 479, "Lanjutkan tanpa AI", { size: 18, weight: 600, family: DISPLAY }),
    multiline(18, 508, ["Isi merchant, total, tanggal, dan kategori secara", "manual tanpa memilih ulang foto."], { size: 13, fill: C.secondary, lineHeight: 19 }),
    button(18, 570, 354, "Masukkan data manual", { h: 48 }),
    button(18, 630, 354, "Coba scan lagi nanti", { h: 48, variant: "secondary" }),
    text(195, 718, "Kamu dapat menghapus foto sebelum keluar.", { size: 11, fill: C.secondary, anchor: "middle" }),
  ].join(""), { title: "Mobile AI quota fallback CP1" });
}

function mobileDestructive() {
  return svg(390, 844, [
    mobileHeader("Pola konfirmasi", { back: true }),
    text(18, 91, "Dua tingkat risiko memakai perlakuan berbeda.", { size: 12, fill: C.secondary }),
    text(18, 131, "HAPUS TRANSAKSI", { size: 11, fill: C.secondary, weight: 600, letter: 1 }),
    rect(18, 145, 354, 224, { fill: C.surface, stroke: C.border, r: 16 }),
    text(36, 181, "Hapus transaksi Superindo?", { size: 18, weight: 600, family: DISPLAY }),
    multiline(36, 211, ["Transaksi Rp326.500 akan dihapus dari", "riwayat pengeluaran Juli."], { size: 13, fill: C.secondary, lineHeight: 20 }),
    button(36, 281, 148, "Batal", { h: 46, variant: "secondary" }),
    button(196, 281, 158, "Hapus transaksi", { h: 46, variant: "destructive" }),
    text(36, 348, "Konfirmasi ringkas untuk satu data.", { size: 11, fill: C.secondary }),
    text(18, 419, "HAPUS AKUN DAN SELURUH DATA", { size: 11, fill: C.error, weight: 600, letter: 0.7 }),
    rect(18, 433, 354, 302, { fill: C.surface, stroke: C.error, sw: 1.5, r: 16 }),
    text(36, 469, "Hapus akun secara permanen?", { size: 18, weight: 600, family: DISPLAY }),
    multiline(36, 499, ["Semua transaksi, insight, dan foto struk", "akan dihapus. Tindakan ini tidak dapat dibatalkan."], { size: 13, fill: C.secondary, lineHeight: 20 }),
    text(36, 563, "Ketik HAPUS untuk melanjutkan", { size: 12, fill: C.ink, weight: 600 }),
    rect(36, 578, 318, 48, { fill: C.surface, stroke: C.error, r: 10 }),
    text(50, 608, "HAPUS", { size: 14, fill: C.ink, weight: 600, letter: 1 }),
    button(36, 646, 318, "Hapus akun dan data", { h: 46, variant: "destructive" }),
    text(195, 771, "Aksi destructive tidak memakai bottom sheet.", { size: 11, fill: C.secondary, anchor: "middle" }),
  ].join(""), { title: "Mobile destructive confirmation patterns CP1" });
}

function desktopDashboard() {
  const rows = [
    ["Superindo", "Belanja · AI · Struk", "12 Jul 2026", "−Rp326.500"],
    ["Kedai Sela", "Makan · AI · Struk", "11 Jul 2026", "−Rp48.000"],
    ["KRL", "Transportasi · Manual", "10 Jul 2026", "−Rp20.000"],
    ["PLN", "Tagihan · AI · Struk", "08 Jul 2026", "−Rp350.000"],
  ];
  return svg(1440, 1024, [
    appSidebar("Dashboard"),
    desktopHeader("Dashboard", "Ringkasan pengeluaran pribadi · Juli 2026", "Scan struk"),
    rect(280, 142, 672, 200, { fill: C.surface, stroke: C.border, r: 18 }),
    text(312, 180, "TOTAL PENGELUARAN", { size: 11, fill: C.secondary, weight: 600, letter: 1 }),
    text(312, 236, "Rp3.482.500", { size: 40, weight: 600, family: DISPLAY }),
    text(312, 271, "Sedikit lebih tinggi dari Juni", { size: 14, fill: C.secondary }),
    button(312, 292, 158, "Tambah manual", { variant: "secondary", h: 42 }),
    rect(976, 142, 416, 200, { fill: C.primarySoft, r: 18 }),
    labelPill(1008, 174, "Insight mingguan", { fill: C.surface, width: 128 }),
    multiline(1008, 230, ["Pengeluaran makanmu sedikit", "meningkat dibanding minggu lalu."], { size: 19, weight: 600, family: DISPLAY, lineHeight: 27 }),
    text(1008, 307, "Lihat rincian kategori →", { size: 12, fill: C.primary, weight: 600 }),
    text(280, 394, "Distribusi kategori", { size: 20, weight: 600, family: DISPLAY }),
    rect(280, 414, 672, 338, { fill: C.surface, stroke: C.border, r: 16 }),
    circle(467, 576, 112, { fill: "none", stroke: C.disabled, sw: 38 }),
    `<path d="M467 464 A112 112 0 0 1 565 630" fill="none" stroke="${C.expense}" stroke-width="38" stroke-linecap="butt"/>`,
    `<path d="M565 630 A112 112 0 0 1 405 670" fill="none" stroke="${C.primary}" stroke-width="38" stroke-linecap="butt"/>`,
    text(467, 570, "Kategori terbesar", { size: 12, fill: C.secondary, anchor: "middle" }),
    text(467, 601, "Makan", { size: 20, weight: 600, anchor: "middle", family: DISPLAY }),
    ...[
      ["Makan & minum", "Rp1.214.000", C.expense],
      ["Belanja", "Rp824.500", "#8A6FA8"],
      ["Tagihan", "Rp760.000", "#B48A32"],
      ["Transportasi", "Rp384.000", C.primary],
    ].map(([name, amount, color], i) => [
      circle(661, 496 + i * 52, 5, { fill: color }),
      text(677, 501 + i * 52, name, { size: 13, fill: C.secondary }),
      text(917, 501 + i * 52, amount, { size: 13, weight: 600, anchor: "end" }),
    ].join("")),
    text(976, 394, "Transaksi terbaru", { size: 20, weight: 600, family: DISPLAY }),
    text(1392, 394, "Lihat semua", { size: 12, fill: C.primary, weight: 600, anchor: "end" }),
    rect(976, 414, 416, 338, { fill: C.surface, stroke: C.border, r: 16 }),
    ...rows.map(([merchant, meta, date, amount], i) => {
      const y = 438 + i * 72;
      return [
        circle(1005, y + 21, 17, { fill: i === 1 ? C.expenseSoft : C.primarySoft }),
        circle(1005, y + 21, 5, { fill: i === 1 ? C.expense : C.primary }),
        text(1036, y + 14, merchant, { size: 13, weight: 600 }),
        text(1036, y + 34, `${meta} · ${date}`, { size: 10, fill: C.secondary }),
        text(1372, y + 24, amount, { size: 12, fill: C.expenseInk, weight: 600, anchor: "end" }),
        i < rows.length - 1 ? line(994, y + 55, 1374, y + 55, { stroke: C.divider }) : "",
      ].join("");
    }),
  ].join(""), { title: "Desktop dashboard default CP1" });
}

function desktopDashboardStates() {
  const card = (x, titleValue, subtitle, body, accent = C.primarySoft) => [
    text(x, 168, titleValue, { size: 12, fill: C.secondary, weight: 600, letter: 1 }),
    rect(x, 188, 344, 540, { fill: C.surface, stroke: C.border, r: 16 }),
    rect(x + 24, 216, 296, 70, { fill: accent, r: 12 }),
    text(x + 44, 246, subtitle, { size: 15, weight: 600 }),
    body,
  ].join("");
  const loading = [
    rect(328, 322, 122, 12, { fill: C.disabled, r: 5 }),
    rect(328, 350, 214, 30, { fill: C.disabled, r: 6 }),
    rect(328, 414, 296, 110, { fill: C.subtle, stroke: C.divider, r: 12 }),
    rect(328, 548, 296, 64, { fill: C.subtle, stroke: C.divider, r: 12 }),
    text(328, 682, "Skeleton mengikuti bentuk konten.", { size: 11, fill: C.secondary }),
  ].join("");
  const empty = [
    icon(718, 334, "list", C.primary, 34),
    text(770, 351, "Belum ada transaksi", { size: 17, weight: 600 }),
    multiline(718, 389, ["Tambahkan transaksi secara manual", "atau scan struk pertamamu."], { size: 13, fill: C.secondary, lineHeight: 20 }),
    button(718, 456, 190, "Tambah transaksi", { h: 44 }),
    text(718, 682, "Satu next step, tanpa ilustrasi besar.", { size: 11, fill: C.secondary }),
  ].join("");
  const offline = [
    rect(1108, 322, 296, 72, { fill: C.primarySoft, r: 10 }),
    icon(1128, 345, "alert", C.primary, 20),
    multiline(1160, 346, ["Data cache masih tersedia.", "Perubahan disinkronkan nanti."], { size: 12, lineHeight: 18, weight: 500 }),
    rect(1108, 422, 296, 66, { fill: C.subtle, stroke: C.divider, r: 10 }),
    text(1124, 449, "PLN", { size: 13, weight: 600 }),
    text(1388, 449, "−Rp350.000", { size: 12, fill: C.expenseInk, weight: 600, anchor: "end" }),
    text(1124, 469, "Data tersimpan · 08 Jul", { size: 10, fill: C.secondary }),
    text(1108, 682, "Konten tidak diganti layar error kosong.", { size: 11, fill: C.secondary }),
  ].join("");
  return svg(1440, 1024, [
    appSidebar("Dashboard"),
    desktopHeader("State dashboard", "Loading, empty, dan offline mempertahankan struktur yang sama"),
    card(280, "LOADING", "Memuat ringkasan", loading, C.subtle),
    card(670, "EMPTY", "Awal yang jelas", empty, C.signalSoft),
    card(1060, "OFFLINE / CACHED", "Tetap bisa melihat data", offline, C.primarySoft),
    rect(280, 772, 1124, 142, { fill: C.subtle, stroke: C.border, r: 14 }),
    text(312, 810, "Aturan bersama", { size: 16, weight: 600, family: DISPLAY }),
    multiline(312, 842, ["• Layout anchor tidak berpindah drastis ketika data selesai dimuat.", "• Status selalu memiliki label dan penjelasan, bukan warna saja.", "• Aksi berikutnya tetap spesifik terhadap kondisi pengguna."], { size: 13, fill: C.secondary, lineHeight: 24 }),
  ].join(""), { title: "Desktop dashboard states CP1" });
}

function desktopTransactions() {
  const rows = [
    ["Superindo", "Belanja · AI · Struk", "12 Jul 2026", "−Rp326.500", true],
    ["Kedai Sela", "Makan · AI · Struk", "12 Jul 2026", "−Rp48.000", false],
    ["KRL", "Transportasi · Manual", "10 Jul 2026", "−Rp20.000", false],
    ["PLN", "Tagihan · AI · Struk", "08 Jul 2026", "−Rp350.000", false],
    ["Kedai Sela", "Makan · AI · Struk", "07 Jul 2026", "−Rp64.000", false],
    ["Superindo", "Belanja · AI · Struk", "05 Jul 2026", "−Rp284.000", false],
  ];
  return svg(1440, 1024, [
    appSidebar("Transaksi"),
    desktopHeader("Transaksi", "22 transaksi · Juli 2026"),
    rect(280, 138, 446, 46, { fill: C.surface, stroke: C.border, r: 11 }),
    circle(304, 161, 7, { stroke: C.secondary, sw: 1.5 }),
    line(309, 166, 314, 171, { stroke: C.secondary, sw: 1.5 }),
    text(328, 166, "Cari merchant atau catatan", { size: 13, fill: C.secondary }),
    button(742, 138, 102, "Filter", { h: 46, variant: "secondary" }),
    rect(280, 210, 676, 714, { fill: C.surface, stroke: C.border, r: 14 }),
    text(304, 244, "MERCHANT / SUMBER", { size: 10, fill: C.secondary, weight: 600, letter: 0.8 }),
    text(752, 244, "TANGGAL", { size: 10, fill: C.secondary, weight: 600 }),
    text(932, 244, "NOMINAL", { size: 10, fill: C.secondary, weight: 600, anchor: "end" }),
    line(304, 260, 932, 260, { stroke: C.divider }),
    ...rows.map(([merchant, meta, date, amount, selected], i) => {
      const y = 274 + i * 96;
      return [
        selected ? rect(294, y - 2, 648, 82, { fill: C.primarySoft, stroke: C.primary, sw: 1.5, r: 10 }) : "",
        circle(320, y + 28, 17, { fill: merchant === "Kedai Sela" ? C.expenseSoft : C.subtle }),
        circle(320, y + 28, 5, { fill: merchant === "Kedai Sela" ? C.expense : C.primary }),
        text(350, y + 22, merchant, { size: 14, weight: 600 }),
        text(350, y + 44, meta, { size: 11, fill: C.secondary }),
        text(752, y + 31, date, { size: 12, fill: C.secondary }),
        text(928, y + 31, amount, { size: 13, fill: C.expenseInk, weight: 600, anchor: "end" }),
        !selected ? line(304, y + 78, 932, y + 78, { stroke: C.divider }) : "",
      ].join("");
    }),
    rect(980, 138, 412, 786, { fill: C.surface, stroke: C.border, r: 16 }),
    text(1012, 178, "Detail transaksi", { size: 20, weight: 600, family: DISPLAY }),
    labelPill(1278, 158, "AI · Struk", { width: 86 }),
    text(1012, 234, "Superindo", { size: 16, weight: 600 }),
    text(1360, 234, "−Rp326.500", { size: 20, fill: C.expenseInk, weight: 600, family: DISPLAY, anchor: "end" }),
    line(1012, 262, 1360, 262, { stroke: C.divider }),
    field(1012, 302, 348, "Merchant", "Superindo", { h: 46 }),
    field(1012, 380, 348, "Total pengeluaran", "Rp326.500", { h: 46 }),
    field(1012, 458, 164, "Tanggal", "12 Jul 2026", { h: 46 }),
    field(1196, 458, 164, "Kategori", "Belanja", { h: 46 }),
    field(1012, 536, 348, "Catatan", "Belanja kebutuhan rumah", { h: 64 }),
    rect(1012, 644, 348, 54, { fill: C.primarySoft, r: 10 }),
    text(1028, 666, "Sumber", { size: 10, fill: C.secondary }),
    text(1028, 686, "Hasil scan · sudah ditinjau", { size: 12, fill: C.primary, weight: 600 }),
    button(1012, 742, 348, "Simpan perubahan", { h: 46 }),
    button(1012, 802, 348, "Hapus transaksi", { h: 46, variant: "quietDestructive" }),
    text(1012, 884, "Side panel menjaga konteks daftar tetap terlihat.", { size: 11, fill: C.secondary }),
  ].join(""), { title: "Desktop transactions with detail panel CP1" });
}

function desktopScanProcessing() {
  return svg(1440, 1024, [
    appSidebar("Scan struk"),
    desktopHeader("Scan struk", "Unggah foto, kompres, lalu tinjau hasil sebelum menyimpan"),
    rect(280, 142, 524, 786, { fill: C.surface, stroke: C.border, r: 18 }),
    text(312, 182, "Pilih foto struk", { size: 21, weight: 600, family: DISPLAY }),
    text(312, 210, "Seluruh struk harus terlihat jelas.", { size: 13, fill: C.secondary }),
    cropFrame(312, 246, 460, 350),
    icon(516, 367, "camera", C.primary, 48),
    text(542, 438, "Tarik foto ke sini atau pilih file", { size: 14, fill: C.secondary, anchor: "middle" }),
    rect(312, 624, 460, 76, { fill: C.primarySoft, r: 12 }),
    icon(330, 650, "alert", C.primary, 20),
    multiline(364, 651, ["Pastikan struk tidak menampilkan nomor kartu", "lengkap sebelum upload."], { size: 12, lineHeight: 18, weight: 500 }),
    button(312, 732, 218, "Ambil foto", { h: 46, iconType: "camera" }),
    button(542, 732, 230, "Pilih dari perangkat", { h: 46, variant: "secondary" }),
    text(312, 826, "Urutan proses", { size: 13, weight: 600 }),
    text(312, 852, "Pilih → Kompres → Unggah → Tinjau → Simpan", { size: 12, fill: C.secondary }),
    rect(836, 142, 556, 786, { fill: C.ink, r: 18 }),
    text(872, 184, "Focused inspection mode", { size: 21, fill: C.surface, weight: 600, family: DISPLAY }),
    text(872, 212, "Mode sementara saat foto sedang diperiksa.", { size: 13, fill: "#AAB3BF" }),
    cropFrame(872, 248, 484, 358, { color: C.signal, bg: "#121D2A", dark: true }),
    receiptPlaceholder(1019, 276, 190, 302, true),
    line(920, 424, 1308, 424, { stroke: C.signal, sw: 2 }),
    labelPill(1068, 584, "Membaca struk", { fill: C.signalSoft, color: C.signalInk, width: 116 }),
    line(883, 666, 883, 798, { stroke: C.darkLine, sw: 2 }),
    processStep(872, 660, "Foto dikompres", "done", true),
    processStep(872, 704, "Diunggah dengan aman", "done", true),
    processStep(872, 748, "Membaca dan mengelompokkan data", "active", true),
    text(872, 836, "Hasil berikutnya selalu dapat diedit.", { size: 12, fill: "#AAB3BF" }),
    text(872, 866, "Tidak ada progres atau confidence palsu.", { size: 12, fill: "#AAB3BF" }),
  ].join(""), { title: "Desktop upload and AI processing CP1" });
}

function desktopScanReview() {
  return svg(1440, 1024, [
    appSidebar("Scan struk"),
    desktopHeader("Tinjau hasil scan", "Periksa setiap field sebelum transaksi disimpan"),
    rect(280, 142, 528, 786, { fill: C.subtle, stroke: C.border, r: 18 }),
    text(312, 182, "Preview struk", { size: 20, weight: 600, family: DISPLAY }),
    labelPill(668, 160, "412 KB", { fill: C.signalSoft, color: C.signalInk, width: 106 }),
    cropFrame(312, 222, 464, 602),
    receiptPlaceholder(420, 254, 248, 530),
    text(312, 870, "Foto tidak digunakan sebagai dekorasi; hanya untuk verifikasi.", { size: 11, fill: C.secondary }),
    rect(840, 142, 552, 786, { fill: C.surface, stroke: C.border, r: 18 }),
    text(872, 182, "Data transaksi", { size: 20, weight: 600, family: DISPLAY }),
    labelPill(1264, 160, "AI · Struk", { width: 96 }),
    text(872, 214, "Semua hasil dapat dikoreksi.", { size: 13, fill: C.secondary }),
    field(872, 256, 488, "Merchant", "Superindo", { h: 50 }),
    field(872, 340, 488, "Total pengeluaran", "Rp326.500", { h: 50, suffix: "IDR" }),
    field(872, 424, 232, "Tanggal", "12 Jul 2026", { h: 50 }),
    field(1128, 424, 232, "Kategori", "Belanja", { h: 50, warning: true }),
    field(872, 508, 488, "Item terdeteksi", "5 item · buka rincian", { h: 50, suffix: "Buka" }),
    rect(872, 606, 488, 72, { fill: C.warningSoft, r: 10 }),
    icon(890, 631, "alert", C.warning, 20),
    multiline(924, 632, ["Kategori perlu diperiksa karena beberapa item", "tidak terbaca penuh."], { size: 12, fill: C.warning, lineHeight: 19, weight: 500 }),
    field(872, 720, 488, "Catatan", "Belanja kebutuhan rumah", { h: 58 }),
    button(872, 838, 488, "Simpan transaksi", { h: 48 }),
  ].join(""), { title: "Desktop two-column receipt review CP1" });
}

function desktopComponentBoard() {
  const componentTitle = (x, y, titleValue) => text(x, y, titleValue, { size: 11, fill: C.secondary, weight: 600, letter: 1 });
  return svg(1440, 1024, [
    appSidebar("Dashboard"),
    desktopHeader("App shell & component states", "Referensi hierarchy low-fidelity, bukan library visual final"),
    text(280, 154, "APP SHELL", { size: 11, fill: C.secondary, weight: 600, letter: 1 }),
    rect(280, 172, 1112, 126, { fill: C.surface, stroke: C.border, r: 14 }),
    text(312, 208, "Side navigation 240 px", { size: 14, weight: 600 }),
    text(312, 234, "Konteks halaman dan aksi utama berada di header konten.", { size: 12, fill: C.secondary }),
    line(588, 190, 588, 278, { stroke: C.divider }),
    text(620, 208, "Main content", { size: 14, weight: 600 }),
    text(620, 234, "12-column grid · padding 40 px pada 1440.", { size: 12, fill: C.secondary }),
    line(986, 190, 986, 278, { stroke: C.divider }),
    button(1018, 208, 220, "Scan struk", { h: 46, iconType: "scan" }),
    text(1018, 270, "Satu primary action per region.", { size: 11, fill: C.secondary }),
    componentTitle(280, 344, "BUTTON STATES"),
    rect(280, 362, 532, 190, { fill: C.surface, stroke: C.border, r: 14 }),
    button(312, 394, 144, "Default", { h: 44 }),
    button(472, 394, 144, "Secondary", { h: 44, variant: "secondary" }),
    button(632, 394, 148, "Destructive", { h: 44, variant: "destructive" }),
    rect(312, 462, 144, 44, { fill: C.primary, stroke: C.primary, r: 12, opacity: 0.45 }),
    text(384, 489, "Disabled", { size: 13, fill: C.surface, weight: 600, anchor: "middle" }),
    rect(472, 458, 144, 52, { fill: "none", stroke: C.primary, sw: 2, r: 14 }),
    button(476, 462, 136, "Focus", { h: 44 }),
    componentTitle(844, 344, "FIELD STATES"),
    rect(844, 362, 548, 190, { fill: C.surface, stroke: C.border, r: 14 }),
    field(876, 398, 222, "Default", "Superindo", { h: 44 }),
    field(1130, 398, 230, "Needs review", "Belanja", { h: 44, warning: true }),
    componentTitle(280, 602, "BADGE / STATUS"),
    rect(280, 620, 532, 150, { fill: C.surface, stroke: C.border, r: 14 }),
    labelPill(312, 654, "AI · Struk", { width: 92 }),
    labelPill(420, 654, "Perlu ditinjau", { fill: C.warningSoft, color: C.warning, width: 120 }),
    labelPill(556, 654, "Offline", { fill: C.primarySoft, color: C.primary, width: 84 }),
    labelPill(656, 654, "Selesai", { fill: C.signalSoft, color: C.signalInk, width: 92 }),
    text(312, 726, "Label selalu hadir; warna bukan satu-satunya pembeda.", { size: 11, fill: C.secondary }),
    componentTitle(844, 602, "TRANSACTION ROW STATES"),
    rect(844, 620, 548, 150, { fill: C.surface, stroke: C.border, r: 14 }),
    rect(876, 646, 484, 48, { fill: C.subtle, stroke: C.divider, r: 10 }),
    text(892, 666, "Superindo", { size: 13, weight: 600 }),
    text(1344, 666, "−Rp326.500", { size: 12, fill: C.expenseInk, weight: 600, anchor: "end" }),
    rect(876, 706, 484, 48, { fill: C.primarySoft, stroke: C.primary, sw: 1.5, r: 10 }),
    text(892, 726, "Superindo · selected", { size: 13, weight: 600 }),
    text(1344, 726, "−Rp326.500", { size: 12, fill: C.expenseInk, weight: 600, anchor: "end" }),
    rect(280, 816, 1112, 110, { fill: C.subtle, stroke: C.border, r: 14 }),
    text(312, 852, "Low-fi guardrail", { size: 15, weight: 600, family: DISPLAY }),
    multiline(312, 880, ["Struktur ini menguji hierarchy, state, dan responsive intent. Radius, font rendering,", "spacing mikro, icon weight, dan elevation final baru divalidasi di CP2."], { size: 12, fill: C.secondary, lineHeight: 20 }),
  ].join(""), { title: "Desktop app shell and component state board CP1" });
}

const screens = [
  { platform: "mobile", file: "mobile-dashboard-default-cp1", title: "01 · Dashboard — default", svg: mobileDashboard() },
  { platform: "mobile", file: "mobile-dashboard-states-cp1", title: "02 · Dashboard — loading / empty / offline", svg: mobileDashboardStates() },
  { platform: "mobile", file: "mobile-transactions-list-cp1", title: "03 · Daftar transaksi", svg: mobileTransactionsList() },
  { platform: "mobile", file: "mobile-transaction-detail-edit-cp1", title: "04 · Detail & edit transaksi", svg: mobileTransactionDetail() },
  { platform: "mobile", file: "mobile-scan-start-cp1", title: "05 · Scan — pilih foto", svg: mobileScanStart() },
  { platform: "mobile", file: "mobile-scan-upload-cp1", title: "06 · Kompresi & upload", svg: mobileScanUpload() },
  { platform: "mobile", file: "mobile-scan-processing-cp1", title: "07 · Focused inspection", svg: mobileScanProcessing() },
  { platform: "mobile", file: "mobile-scan-review-cp1", title: "08 · Review hasil AI", svg: mobileScanReview() },
  { platform: "mobile", file: "mobile-scan-quota-error-cp1", title: "09 · AI quota / fallback", svg: mobileScanQuota() },
  { platform: "mobile", file: "mobile-destructive-confirmation-cp1", title: "10 · Destructive confirmation", svg: mobileDestructive() },
  { platform: "desktop", file: "desktop-dashboard-default-cp1", title: "11 · Dashboard — default", svg: desktopDashboard() },
  { platform: "desktop", file: "desktop-dashboard-states-cp1", title: "12 · Dashboard states", svg: desktopDashboardStates() },
  { platform: "desktop", file: "desktop-transactions-detail-cp1", title: "13 · Transactions + side panel", svg: desktopTransactions() },
  { platform: "desktop", file: "desktop-scan-upload-processing-cp1", title: "14 · Upload + processing", svg: desktopScanProcessing() },
  { platform: "desktop", file: "desktop-scan-review-cp1", title: "15 · Receipt review — two column", svg: desktopScanReview() },
  { platform: "desktop", file: "desktop-app-shell-component-states-cp1", title: "16 · App shell + state board", svg: desktopComponentBoard() },
];

function innerSvg(source) {
  return source
    .replace(/^<\?xml[^>]+>\s*/u, "")
    .replace(/^<svg[^>]+>/u, "")
    .replace(/<\/svg>\s*$/u, "");
}

function contactSheet(items, type) {
  const mobile = type === "mobile";
  const cols = 2;
  const scale = mobile ? 0.5 : 0.36;
  const cellW = mobile ? 500 : 560;
  const cellH = mobile ? 500 : 470;
  const thumbW = (mobile ? 390 : 1440) * scale;
  const thumbH = (mobile ? 844 : 1024) * scale;
  const rows = Math.ceil(items.length / cols);
  const width = 80 + cols * cellW;
  const height = 130 + rows * cellH;
  const content = [
    text(40, 50, `Fintrack AI · CP1 ${mobile ? "Mobile" : "Desktop"}`, { size: 28, weight: 600, family: DISPLAY }),
    text(40, 80, "Quiet Signal — Refined · content hierarchy & low-fidelity", { size: 14, fill: C.secondary }),
    ...items.map((item, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const cellX = 40 + col * cellW;
      const cellY = 112 + row * cellH;
      const screenX = cellX + (cellW - thumbW) / 2;
      const screenY = cellY + 46;
      return [
        text(cellX, cellY + 18, item.title, { size: 13, weight: 600 }),
        rect(screenX - 8, screenY - 8, thumbW + 16, thumbH + 16, { fill: C.surface, stroke: C.border, r: 10 }),
        `<g transform="translate(${screenX} ${screenY}) scale(${scale})">${innerSvg(item.svg)}</g>`,
      ].join("");
    }),
  ].join("");
  return svg(width, height, content, { bg: "#ECE9E1", title: `Fintrack AI CP1 ${type} contact sheet` });
}

async function writeSvgAndPng(filePathWithoutExt, source) {
  const svgPath = `${filePathWithoutExt}.svg`;
  const pngPath = `${filePathWithoutExt}.png`;
  await fs.writeFile(svgPath, source, "utf8");
  await sharp(Buffer.from(source)).png().toFile(pngPath);
}

async function run() {
  await Promise.all([MOBILE, DESKTOP].map((dir) => fs.mkdir(dir, { recursive: true })));

  for (const screen of screens) {
    const dir = screen.platform === "mobile" ? MOBILE : DESKTOP;
    await writeSvgAndPng(path.join(dir, screen.file), screen.svg);
  }

  const mobileSheet = contactSheet(screens.filter((screen) => screen.platform === "mobile"), "mobile");
  const desktopSheet = contactSheet(screens.filter((screen) => screen.platform === "desktop"), "desktop");
  await writeSvgAndPng(path.join(ROOT, "contact-sheet-mobile-cp1"), mobileSheet);
  await writeSvgAndPng(path.join(ROOT, "contact-sheet-desktop-cp1"), desktopSheet);

  const manifest = {
    project: "Fintrack AI",
    checkpoint: "CP1",
    revision: "R1 — hierarchy audit corrections",
    direction: "Quiet Signal — Refined",
    status: "CP1 FINAL — local fallback; pending Figma-native recreation",
    generatedAt: "2026-07-29",
    approvedAt: "2026-07-29",
    approvedBy: "Mario Sianturi",
    viewports: { mobile: "390x844", desktop: "1440x1024" },
    flowDecisions: {
      scanSteps: ["Foto", "Persiapan", "Pemeriksaan AI", "Tinjau"],
      afterSave: "Kembali ke Dashboard, tampilkan feedback sukses, dan letakkan transaksi baru di urutan teratas.",
    },
    frames: screens.map(({ platform, file, title }) => ({
      platform,
      title,
      svg: `${platform}/${file}.svg`,
      png: `${platform}/${file}.png`,
    })),
    contactSheets: [
      "contact-sheet-mobile-cp1.svg",
      "contact-sheet-mobile-cp1.png",
      "contact-sheet-desktop-cp1.svg",
      "contact-sheet-desktop-cp1.png",
    ],
  };
  await fs.writeFile(path.join(ROOT, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

await run();
