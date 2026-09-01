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
  cropFrame,
  field,
  icon,
  innerSvg,
  layout,
  line,
  pageHeader,
  progressStrip,
  receipt,
  rect,
  statusItem,
  svgDoc,
  textLines,
  txt,
  writeSvgAndPng,
} from "../../local-cp3/tooling/design-core.mjs";

const TOOLING_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(TOOLING_DIR, "..");
const DESIGN_PROOF = path.resolve(ROOT, "..");
const MOBILE_DIR = path.join(ROOT, "states", "mobile");
const DESKTOP_DIR = path.join(ROOT, "states", "desktop");
const REVIEW_DIR = path.join(ROOT, "review-notes");

await Promise.all([
  fs.mkdir(MOBILE_DIR, { recursive: true }),
  fs.mkdir(DESKTOP_DIR, { recursive: true }),
  fs.mkdir(REVIEW_DIR, { recursive: true }),
]);

const sourcePaths = {
  mobileDashboard: path.join(
    DESIGN_PROOF,
    "local-cp2",
    "mobile",
    "mobile-dashboard-default-cp2-r0.svg",
  ),
  mobileDashboardStates: path.join(
    DESIGN_PROOF,
    "local-cp2",
    "mobile",
    "mobile-dashboard-states-cp2-r0.svg",
  ),
  mobileScanStart: path.join(
    DESIGN_PROOF,
    "local-cp2",
    "mobile",
    "mobile-scan-start-cp2-r0.svg",
  ),
  mobileScanUpload: path.join(
    DESIGN_PROOF,
    "local-cp2",
    "mobile",
    "mobile-scan-upload-cp2-r0.svg",
  ),
  mobileScanProcessing: path.join(
    DESIGN_PROOF,
    "local-cp2",
    "mobile",
    "mobile-scan-processing-cp2-r0.svg",
  ),
  mobileScanReview: path.join(
    DESIGN_PROOF,
    "local-cp2",
    "mobile",
    "mobile-scan-review-cp2-r0.svg",
  ),
  mobileQuota: path.join(
    DESIGN_PROOF,
    "local-cp2",
    "mobile",
    "mobile-scan-quota-error-cp2-r0.svg",
  ),
  mobileTransactions: path.join(
    DESIGN_PROOF,
    "local-cp2",
    "mobile",
    "mobile-transactions-list-cp2-r0.svg",
  ),
  mobileEdit: path.join(
    DESIGN_PROOF,
    "local-cp2",
    "mobile",
    "mobile-transaction-detail-edit-cp2-r0.svg",
  ),
  mobileDestructive: path.join(
    DESIGN_PROOF,
    "local-cp2",
    "mobile",
    "mobile-destructive-confirmation-cp2-r0.svg",
  ),
  desktopDashboard: path.join(
    DESIGN_PROOF,
    "local-cp3",
    "desktop",
    "desktop-dashboard-default-cp3-r0.svg",
  ),
  desktopUpload: path.join(
    DESIGN_PROOF,
    "local-cp3",
    "desktop",
    "desktop-scan-upload-processing-cp3-r0.svg",
  ),
  desktopReview: path.join(
    DESIGN_PROOF,
    "local-cp3",
    "desktop",
    "desktop-scan-review-cp3-r0.svg",
  ),
  desktopTransactions: path.join(
    DESIGN_PROOF,
    "local-cp3",
    "desktop",
    "desktop-transactions-detail-cp3-r0.svg",
  ),
};

const sourceEntries = await Promise.all(
  Object.entries(sourcePaths).map(async ([key, filePath]) => [
    key,
    await fs.readFile(filePath, "utf8"),
  ]),
);
const sources = Object.fromEntries(sourceEntries);

const statePalette = {
  loading: {
    bg: C.canvasSubtle,
    ink: C.secondary,
    icon: "spinner-gap",
    label: "Loading",
  },
  empty: {
    bg: C.canvasSubtle,
    ink: C.primary,
    icon: "archive",
    label: "Empty",
  },
  offline: {
    bg: C.primarySoft,
    ink: C.primary,
    icon: "wifi-slash",
    label: "Offline / cached",
  },
  error: {
    bg: C.errorSoft,
    ink: C.error,
    icon: "warning",
    label: "Error",
  },
  quota: {
    bg: C.warningSoft,
    ink: C.warning,
    icon: "clock",
    label: "AI quota",
  },
  review: {
    bg: C.warningSoft,
    ink: C.warning,
    icon: "eye",
    label: "Needs review",
  },
  success: {
    bg: C.signalSoft,
    ink: C.signalInk,
    icon: "check-circle",
    label: "Success",
  },
  destructive: {
    bg: C.errorSoft,
    ink: C.error,
    icon: "trash",
    label: "Destructive",
  },
};

function overlayScrim(width, height, opacity = 0.28) {
  return rect(0, 0, width, height, { fill: C.ink, opacity });
}

function mobileRecoverySheet({
  title,
  body,
  meta,
  state = "error",
  primaryLabel,
  secondaryLabel,
  y = 486,
}) {
  const palette = statePalette[state];
  const h = 844 - y;
  return [
    overlayScrim(390, 844, 0.26),
    rect(0, y, 390, h, {
      fill: C.surface,
      stroke: C.border,
      strokeWidth: 1,
      radius: 20,
    }),
    rect(169, y + 12, 52, 4, { fill: C.border, radius: 2 }),
    circle(42, y + 58, 20, { fill: palette.bg }),
    icon(palette.icon, 32, y + 48, 20, { color: palette.ink }),
    ...badge(278, y + 42, palette.label.toUpperCase(), {
      fill: palette.bg,
      color: palette.ink,
      width: 96,
      height: 28,
    }),
    txt(16, y + 100, title, {
      size: 22,
      weight: 600,
      family: DISPLAY,
    }),
    ...textLines(16, y + 130, body, {
      size: 14,
      fill: C.secondary,
      lineHeight: 21,
      weight: 400,
    }),
    rect(16, y + 184, 358, 54, {
      fill: palette.bg,
      radius: 10,
    }),
    icon("shield-check", 30, y + 201, 20, { color: palette.ink }),
    txt(60, y + 208, meta, {
      size: 13,
      fill: palette.ink,
      weight: 600,
    }),
    ...button(16, y + 254, 358, primaryLabel, {
      iconName: state === "offline" ? "note-pencil" : "arrow-right",
    }),
    ...button(16, y + 306, 358, secondaryLabel, {
      kind: "secondary",
      iconName: "arrow-left",
    }),
  ];
}

function mobileInlineSaveError() {
  return [
    rect(0, 520, 390, 324, {
      fill: C.surface,
      stroke: C.border,
      strokeWidth: 1,
    }),
    rect(16, 538, 358, 116, {
      fill: C.errorSoft,
      stroke: C.error,
      strokeWidth: 1,
      radius: 12,
    }),
    icon("warning", 30, 556, 20, { color: C.error }),
    txt(60, 571, "Perubahan belum tersimpan", {
      size: 15,
      fill: C.error,
      weight: 600,
    }),
    ...textLines(
      60,
      594,
      ["Koreksimu tetap ada di layar.", "Periksa koneksi lalu coba lagi."],
      { size: 13, fill: C.secondary, lineHeight: 19 },
    ),
    ...button(16, 690, 358, "Coba simpan lagi", {
      iconName: "arrow-right",
    }),
    txt(195, 786, "Kembali tanpa menyimpan", {
      size: 13,
      fill: C.primary,
      anchor: "middle",
      weight: 600,
    }),
  ];
}

function mobileSuccessToast() {
  return [
    rect(16, 650, 358, 98, {
      fill: C.surface,
      stroke: C.signalInk,
      strokeWidth: 1,
      radius: 14,
    }),
    rect(16, 650, 5, 98, { fill: C.signal, radius: 3 }),
    circle(48, 682, 18, { fill: C.signalSoft }),
    icon("check", 39, 673, 18, { color: C.signalInk }),
    txt(76, 677, "Transaksi tersimpan", {
      size: 15,
      fill: C.signalInk,
      weight: 600,
    }),
    txt(76, 700, "Superindo · Rp326.500", {
      size: 13,
      fill: C.secondary,
      weight: 500,
    }),
    txt(76, 723, "Dashboard sudah diperbarui.", {
      size: 12,
      fill: C.secondary,
    }),
    txt(348, 682, "Tutup", {
      size: 12,
      fill: C.primary,
      anchor: "end",
      weight: 600,
    }),
  ];
}

function desktopDialog({
  title,
  body,
  state = "error",
  primaryLabel,
  secondaryLabel,
  destructive = false,
  meta,
}) {
  const palette = statePalette[state];
  const x = 500;
  const y = 254;
  const w = 680;
  const h = 422;
  return [
    overlayScrim(1440, 1024, 0.34),
    rect(x, y, w, h, {
      fill: C.surface,
      stroke: destructive ? C.error : C.border,
      strokeWidth: destructive ? 1.5 : 1,
      radius: 18,
    }),
    circle(x + 52, y + 56, 24, { fill: palette.bg }),
    icon(palette.icon, x + 40, y + 44, 24, { color: palette.ink }),
    ...badge(x + w - 142, y + 42, palette.label.toUpperCase(), {
      fill: palette.bg,
      color: palette.ink,
      width: 112,
      height: 28,
    }),
    txt(x + 32, y + 112, title, {
      size: 28,
      weight: 600,
      family: DISPLAY,
    }),
    ...textLines(x + 32, y + 146, body, {
      size: 15,
      fill: C.secondary,
      lineHeight: 23,
    }),
    rect(x + 32, y + 218, w - 64, 70, {
      fill: palette.bg,
      radius: 10,
    }),
    icon("shield-check", x + 50, y + 242, 20, { color: palette.ink }),
    txt(x + 80, y + 255, meta, {
      size: 14,
      fill: palette.ink,
      weight: 600,
    }),
    ...button(x + 32, y + 326, 276, secondaryLabel, {
      kind: "secondary",
    }),
    ...button(x + 324, y + 326, 324, primaryLabel, {
      kind: destructive ? "destructive" : "primary",
      iconName: destructive ? "trash" : "arrow-right",
    }),
  ];
}

function desktopToast() {
  return [
    rect(1032, 132, 360, 96, {
      fill: C.surface,
      stroke: C.signalInk,
      strokeWidth: 1,
      radius: 14,
    }),
    rect(1032, 132, 5, 96, { fill: C.signal, radius: 3 }),
    circle(1066, 164, 18, { fill: C.signalSoft }),
    icon("check", 1057, 155, 18, { color: C.signalInk }),
    txt(1094, 160, "Perubahan tersimpan", {
      size: 15,
      fill: C.signalInk,
      weight: 600,
    }),
    txt(1094, 184, "Kategori Superindo diperbarui.", {
      size: 13,
      fill: C.secondary,
    }),
    txt(1364, 207, "Tutup", {
      size: 12,
      fill: C.primary,
      anchor: "end",
      weight: 600,
    }),
  ];
}

function mobileManualEntry() {
  return svgDoc(390, 844, "Fintrack AI mobile manual transaction fallback", [
    rect(0, 0, 390, 844, { fill: C.canvas }),
    txt(16, 18, "09:41", { size: 11, weight: 600 }),
    rect(322, 10, 16, 8, {
      fill: "none",
      stroke: C.ink,
      strokeWidth: 1,
      radius: 3,
    }),
    rect(342, 10, 16, 8, {
      fill: "none",
      stroke: C.ink,
      strokeWidth: 1,
      radius: 3,
    }),
    rect(362, 10, 16, 8, {
      fill: "none",
      stroke: C.ink,
      strokeWidth: 1,
      radius: 3,
    }),
    icon("arrow-left", 16, 42, 20, { color: C.ink }),
    txt(46, 58, "Tambah transaksi", {
      size: 20,
      weight: 600,
      family: DISPLAY,
    }),
    txt(374, 57, "Batal", {
      size: 14,
      fill: C.primary,
      weight: 600,
      anchor: "end",
    }),
    rect(16, 86, 358, 76, {
      fill: C.surface,
      stroke: C.border,
      strokeWidth: 1,
      radius: 16,
    }),
    ...badge(30, 100, "MANUAL", {
      fill: C.primarySoft,
      color: C.primary,
      width: 82,
      height: 26,
    }),
    txt(30, 148, "Isi sesuai strukmu", {
      size: 18,
      weight: 600,
      family: DISPLAY,
    }),
    ...field(16, 202, 358, "Merchant", "Contoh: Superindo", {
      height: 48,
      iconName: "storefront",
    }),
    ...field(16, 286, 358, "Total pengeluaran", "Rp0", {
      height: 48,
      suffix: "IDR",
    }),
    ...field(16, 370, 172, "Tanggal", "12 Jul 2026", {
      height: 48,
      iconName: "calendar",
    }),
    ...field(202, 370, 172, "Kategori", "Pilih kategori", {
      height: 48,
      iconName: "tag",
    }),
    ...field(16, 454, 358, "Catatan", "Opsional", {
      height: 64,
      iconName: "note-pencil",
    }),
    rect(16, 548, 358, 74, {
      fill: C.primarySoft,
      radius: 12,
    }),
    icon("info", 30, 568, 20, { color: C.primary }),
    txt(60, 578, "Mode input manual", {
      size: 14,
      fill: C.primary,
      weight: 600,
    }),
    txt(60, 600, "Tidak ada hasil AI yang diterapkan.", {
      size: 13,
      fill: C.secondary,
    }),
    rect(0, 674, 390, 170, {
      fill: C.surface,
      stroke: C.border,
      strokeWidth: 1,
    }),
    ...button(16, 696, 358, "Simpan transaksi", {
      iconName: "check",
      height: 52,
    }),
    txt(195, 782, "Semua field dapat diperiksa sebelum disimpan.", {
      size: 12,
      fill: C.secondary,
      anchor: "middle",
    }),
  ]);
}

function desktopManualEntry() {
  const { contentX, contentRight } = layout(1440);
  const formX = contentX;
  const formW = 640;
  const sideX = formX + formW + 24;
  const sideW = contentRight - sideX;
  return svgDoc(1440, 1024, "Fintrack AI desktop manual transaction fallback", [
    ...pageHeader(
      "Tambah transaksi",
      "Fallback manual · tidak ada hasil AI yang diterapkan",
      "Transaksi",
      1440,
      { showScan: false },
    ),
    rect(formX, 152, formW, 736, {
      fill: C.surface,
      stroke: C.border,
      strokeWidth: 1,
      radius: 16,
    }),
    ...badge(formX + 24, 176, "MANUAL", {
      fill: C.primarySoft,
      color: C.primary,
      width: 86,
    }),
    txt(formX + 24, 236, "Detail transaksi", {
      size: 22,
      weight: 600,
      family: DISPLAY,
    }),
    txt(formX + 24, 262, "Isi data dari struk atau catatanmu.", {
      size: 14,
      fill: C.secondary,
    }),
    ...field(formX + 24, 314, formW - 48, "Merchant", "Contoh: Superindo", {
      iconName: "storefront",
    }),
    ...field(formX + 24, 398, formW - 48, "Total pengeluaran", "Rp0", {
      suffix: "IDR",
    }),
    ...field(formX + 24, 482, 278, "Tanggal", "12 Jul 2026", {
      iconName: "calendar",
    }),
    ...field(formX + 326, 482, 290, "Kategori", "Pilih kategori", {
      iconName: "tag",
    }),
    ...field(formX + 24, 566, formW - 48, "Catatan", "Opsional", {
      height: 76,
      iconName: "note-pencil",
    }),
    line(formX + 24, 684, formX + formW - 24, 684, { stroke: C.divider }),
    ...button(formX + formW - 244, 720, 220, "Simpan transaksi", {
      iconName: "check",
    }),
    ...button(formX + formW - 376, 720, 116, "Batal", {
      kind: "secondary",
    }),
    rect(sideX, 152, sideW, 300, {
      fill: C.primarySoft,
      radius: 16,
    }),
    icon("info", sideX + 24, 180, 22, { color: C.primary }),
    txt(sideX + 24, 234, "Fallback yang jujur", {
      size: 20,
      fill: C.primary,
      weight: 600,
      family: DISPLAY,
    }),
    ...textLines(
      sideX + 24,
      270,
      [
        "Foto belum dibaca AI.",
        "Tidak ada merchant, total, atau",
        "kategori yang diisi secara otomatis.",
      ],
      { size: 14, fill: C.secondary, lineHeight: 24 },
    ),
    rect(sideX, 476, sideW, 210, {
      fill: C.canvasSubtle,
      stroke: C.border,
      strokeWidth: 1,
      radius: 14,
    }),
    txt(sideX + 24, 518, "Sebelum menyimpan", {
      size: 16,
      weight: 600,
    }),
    ...[
      "Merchant atau catatan utama terisi",
      "Nominal menggunakan format Rupiah",
      "Tanggal dan kategori sudah benar",
    ].flatMap((label, index) => [
      circle(sideX + 34, 558 + index * 38, 10, { fill: C.signalSoft }),
      icon("check", sideX + 28, 552 + index * 38, 12, {
        color: C.signalInk,
      }),
      txt(sideX + 54, 563 + index * 38, label, {
        size: 13,
        fill: C.secondary,
        weight: 500,
      }),
    ]),
  ]);
}

function desktopUploadReady() {
  const { contentX, contentRight, contentWidth } = layout(1440);
  const mainW = 720;
  const sideX = contentX + mainW + 24;
  const sideW = contentRight - sideX;
  return svgDoc(1440, 1024, "Fintrack AI desktop receipt upload ready", [
    ...pageHeader(
      "Scan struk",
      "Foto belum menjadi transaksi sebelum kamu meninjau dan menyimpannya",
      "Scan struk",
      1440,
      { showScan: false },
    ),
    ...progressStrip(contentX, 142, contentWidth, 0),
    rect(contentX, 196, mainW, 742, {
      fill: C.surface,
      stroke: C.border,
      strokeWidth: 1,
      radius: 18,
    }),
    txt(contentX + 24, 236, "Pilih foto struk", {
      size: 22,
      weight: 600,
      family: DISPLAY,
    }),
    txt(contentX + 24, 262, "Seluruh struk harus terlihat dan mudah dibaca.", {
      size: 14,
      fill: C.secondary,
    }),
    rect(contentX + 24, 294, mainW - 48, 374, {
      fill: C.canvasSubtle,
      stroke: C.border,
      strokeWidth: 1,
      radius: 14,
    }),
    ...cropFrame(contentX + 44, 314, mainW - 88, 334, C.primary),
    circle(contentX + mainW / 2, 444, 34, { fill: C.primarySoft }),
    icon("camera", contentX + mainW / 2 - 13, 431, 26, {
      color: C.primary,
    }),
    txt(contentX + mainW / 2, 500, "Belum ada foto dipilih", {
      size: 15,
      fill: C.secondary,
      weight: 600,
      anchor: "middle",
    }),
    txt(contentX + mainW / 2, 528, "JPG atau PNG · foto dikompres sebelum upload", {
      size: 13,
      fill: C.secondary,
      anchor: "middle",
    }),
    ...button(contentX + 24, 698, 324, "Ambil foto", {
      iconName: "camera",
    }),
    ...button(contentX + 364, 698, 332, "Pilih dari perangkat", {
      kind: "secondary",
      iconName: "upload-simple",
    }),
    rect(contentX + 24, 770, mainW - 48, 72, {
      fill: C.primarySoft,
      radius: 12,
    }),
    icon("shield-check", contentX + 42, 792, 22, { color: C.primary }),
    ...textLines(
      contentX + 78,
      802,
      [
        "Pastikan struk tidak menampilkan nomor kartu lengkap",
        "sebelum upload.",
      ],
      { size: 13, fill: C.primary, weight: 600, lineHeight: 20 },
    ),
    rect(sideX, 196, sideW, 352, {
      fill: C.canvasSubtle,
      stroke: C.border,
      strokeWidth: 1,
      radius: 16,
    }),
    txt(sideX + 24, 238, "Urutan proses", {
      size: 18,
      weight: 600,
      family: DISPLAY,
    }),
    ...[
      ["Pilih foto", "active"],
      ["Kompres di perangkat", "waiting"],
      ["Unggah dengan aman", "waiting"],
      ["Tinjau hasil", "waiting"],
      ["Simpan transaksi", "waiting"],
    ].flatMap(([label, state], index) =>
      statusItem(sideX + 24, 276 + index * 48, label, state),
    ),
    rect(sideX, 572, sideW, 210, {
      fill: C.primarySoft,
      radius: 16,
    }),
    icon("info", sideX + 24, 600, 22, { color: C.primary }),
    txt(sideX + 24, 654, "Foto tetap milikmu", {
      size: 18,
      fill: C.primary,
      weight: 600,
      family: DISPLAY,
    }),
    ...textLines(
      sideX + 24,
      688,
      [
        "Belum ada upload atau transaksi",
        "sebelum kamu memilih foto.",
      ],
      { size: 14, fill: C.secondary, lineHeight: 24 },
    ),
  ]);
}

function desktopProcessing() {
  const { contentX, contentRight, contentWidth } = layout(1440);
  return svgDoc(1440, 1024, "Fintrack AI desktop receipt processing", [
    ...pageHeader(
      "Memeriksa struk",
      "Focused inspection · hasil selalu dapat ditinjau dan dikoreksi",
      "Scan struk",
      1440,
      { showScan: false },
    ),
    ...progressStrip(contentX, 142, contentWidth, 2),
    rect(contentX, 196, contentWidth, 742, {
      fill: C.ink,
      stroke: C.darkBorder,
      strokeWidth: 1,
      radius: 18,
    }),
    txt(contentX + 32, 244, "AI sedang menyusun hasil", {
      size: 26,
      fill: C.surface,
      weight: 600,
      family: DISPLAY,
    }),
    txt(
      contentX + 32,
      274,
      "Kamu akan meninjau merchant, total, tanggal, dan kategori sebelum transaksi disimpan.",
      { size: 14, fill: C.darkMuted },
    ),
    rect(contentX + 32, 314, 610, 486, {
      fill: C.darkSurface,
      stroke: C.darkBorder,
      strokeWidth: 1,
      radius: 16,
    }),
    ...cropFrame(contentX + 56, 338, 562, 438, C.signal),
    ...receipt(contentX + 252, 360, 190, 342),
    line(contentX + 92, 536, contentX + 582, 536, {
      stroke: C.signal,
      width: 2,
    }),
    ...badge(contentX + 286, 718, "MEMBACA STRUK", {
      fill: C.signalSoft,
      color: C.signalInk,
      width: 146,
    }),
    txt(contentX + 684, 348, "Status pemeriksaan", {
      size: 17,
      fill: C.surface,
      weight: 600,
      family: DISPLAY,
    }),
    ...statusItem(contentX + 684, 392, "Foto dikompres", "done", true),
    ...statusItem(contentX + 684, 450, "Diunggah dengan aman", "done", true),
    ...statusItem(
      contentX + 684,
      508,
      "Membaca dan mengelompokkan data",
      "active",
      true,
    ),
    rect(contentX + 684, 596, 372, 112, {
      fill: C.darkSurface,
      stroke: C.darkBorder,
      strokeWidth: 1,
      radius: 12,
    }),
    icon("shield-check", contentX + 706, 620, 20, { color: C.signal }),
    ...textLines(
      contentX + 740,
      632,
      [
        "Foto belum menjadi transaksi.",
        "Kamu masih dapat membatalkan.",
      ],
      { size: 13, fill: C.darkMuted, lineHeight: 22 },
    ),
    txt(
      contentRight - 32,
      884,
      "Tidak ada persentase atau confidence palsu.",
      { size: 12, fill: C.darkMuted, anchor: "end", weight: 500 },
    ),
  ]);
}

const desktopUploadReadySvg = desktopUploadReady();
const desktopProcessingSvg = desktopProcessing();

const frames = [
  {
    slug: "mobile-scan-upload-error-cp4-r0",
    platform: "mobile",
    title: "Upload error — context preserved",
    state: "error",
    svg: svgDoc(390, 844, "Fintrack AI mobile upload error state", [
      innerSvg(sources.mobileScanUpload),
      mobileRecoverySheet({
        title: "Foto belum berhasil diunggah",
        body: [
          "Foto masih ada di perangkat ini dan",
          "belum dibuat menjadi transaksi.",
        ],
        meta: "Tidak ada data yang hilang.",
        state: "error",
        primaryLabel: "Coba unggah lagi",
        secondaryLabel: "Kembali ke foto",
      }),
    ]),
  },
  {
    slug: "mobile-scan-offline-cp4-r0",
    platform: "mobile",
    title: "Offline — manual fallback",
    state: "offline",
    svg: svgDoc(390, 844, "Fintrack AI mobile offline scan state", [
      innerSvg(sources.mobileScanStart),
      mobileRecoverySheet({
        title: "Scan perlu koneksi",
        body: [
          "Kamu sedang offline. Foto belum diunggah",
          "dan tetap berada di perangkat ini.",
        ],
        meta: "Data tersimpan masih bisa dilihat.",
        state: "offline",
        primaryLabel: "Masukkan data manual",
        secondaryLabel: "Coba sambungkan lagi",
      }),
    ]),
  },
  {
    slug: "mobile-transaction-save-error-cp4-r0",
    platform: "mobile",
    title: "Save error — edits preserved",
    state: "error",
    svg: svgDoc(390, 844, "Fintrack AI mobile save error state", [
      innerSvg(sources.mobileEdit),
      mobileInlineSaveError(),
    ]),
  },
  {
    slug: "mobile-scan-saved-success-cp4-r0",
    platform: "mobile",
    title: "Success — non-blocking confirmation",
    state: "success",
    svg: svgDoc(390, 844, "Fintrack AI mobile saved transaction success", [
      innerSvg(sources.mobileDashboard),
      mobileSuccessToast(),
    ]),
  },
  {
    slug: "mobile-manual-entry-fallback-cp4-r0",
    platform: "mobile",
    title: "Manual fallback — clean form",
    state: "review",
    svg: mobileManualEntry(),
  },
  {
    slug: "desktop-scan-upload-ready-cp4-r0",
    platform: "desktop",
    title: "Upload ready — runtime state",
    state: "loading",
    svg: desktopUploadReadySvg,
  },
  {
    slug: "desktop-scan-processing-cp4-r0",
    platform: "desktop",
    title: "Processing — event driven",
    state: "loading",
    svg: desktopProcessingSvg,
  },
  {
    slug: "desktop-scan-upload-error-cp4-r0",
    platform: "desktop",
    title: "Upload error — retry or return",
    state: "error",
    svg: svgDoc(1440, 1024, "Fintrack AI desktop upload error state", [
      innerSvg(desktopUploadReadySvg),
      desktopDialog({
        title: "Foto belum berhasil diunggah",
        body: [
          "Foto masih tersedia di perangkat ini. Belum ada transaksi",
          "atau data struk yang disimpan ke akunmu.",
        ],
        state: "error",
        primaryLabel: "Coba unggah lagi",
        secondaryLabel: "Kembali ke foto",
        meta: "Pilihan foto dan konteks scan tetap dipertahankan.",
      }),
    ]),
  },
  {
    slug: "desktop-scan-quota-fallback-cp4-r0",
    platform: "desktop",
    title: "AI quota — graceful degradation",
    state: "quota",
    svg: svgDoc(1440, 1024, "Fintrack AI desktop AI quota fallback", [
      innerSvg(desktopProcessingSvg),
      desktopDialog({
        title: "Pemindaian AI sedang sibuk",
        body: [
          "Foto sudah disiapkan, tetapi AI belum dapat memprosesnya.",
          "Kamu bisa mencatat manual atau mencoba scan lagi nanti.",
        ],
        state: "quota",
        primaryLabel: "Masukkan data manual",
        secondaryLabel: "Coba lagi nanti",
        meta: "Foto belum disimpan sebagai transaksi.",
      }),
    ]),
  },
  {
    slug: "desktop-transaction-save-success-cp4-r0",
    platform: "desktop",
    title: "Success — context remains visible",
    state: "success",
    svg: svgDoc(1440, 1024, "Fintrack AI desktop transaction saved success", [
      innerSvg(sources.desktopTransactions),
      desktopToast(),
    ]),
  },
  {
    slug: "desktop-transaction-delete-confirmation-cp4-r0",
    platform: "desktop",
    title: "Destructive — explicit confirmation",
    state: "destructive",
    svg: svgDoc(1440, 1024, "Fintrack AI desktop delete transaction confirmation", [
      innerSvg(sources.desktopTransactions),
      desktopDialog({
        title: "Hapus transaksi Superindo?",
        body: [
          "Transaksi Rp326.500 akan dihapus dari riwayat pengeluaran.",
          "Tindakan ini tidak dapat dibatalkan.",
        ],
        state: "destructive",
        primaryLabel: "Hapus transaksi",
        secondaryLabel: "Batal",
        destructive: true,
        meta: "Fokus awal berada pada Batal; Escape menutup dialog.",
      }),
    ]),
  },
  {
    slug: "desktop-manual-entry-fallback-cp4-r0",
    platform: "desktop",
    title: "Manual fallback — contextual form",
    state: "review",
    svg: desktopManualEntry(),
  },
];

const generated = [];
for (const frame of frames) {
  const dir = frame.platform === "mobile" ? MOBILE_DIR : DESKTOP_DIR;
  generated.push(
    ...(await writeSvgAndPng(path.join(dir, frame.slug), frame.svg)),
  );
}

function arrow(x1, y1, x2, y2, options = {}) {
  const {
    color = C.primary,
    width = 2,
    dash = "",
    label = "",
    labelY = -10,
  } = options;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size = 9;
  const a1 = angle + Math.PI * 0.82;
  const a2 = angle - Math.PI * 0.82;
  const points = [
    [x2, y2],
    [x2 + Math.cos(a1) * size, y2 + Math.sin(a1) * size],
    [x2 + Math.cos(a2) * size, y2 + Math.sin(a2) * size],
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(" ");
  return [
    line(x1, y1, x2, y2, { stroke: color, width, dash }),
    `<polygon points="${points}" fill="${color}"/>`,
    label
      ? txt((x1 + x2) / 2, (y1 + y2) / 2 + labelY, label, {
          size: 12,
          fill: color,
          weight: 600,
          anchor: "middle",
        })
      : "",
  ];
}

function nodeCard(x, y, width, title, subtitle, options = {}) {
  const {
    state = "default",
    selected = false,
    step = "",
    height = 118,
  } = options;
  const palette = statePalette[state] ?? {
    bg: C.primarySoft,
    ink: C.primary,
    icon: "arrow-right",
    label: "Default",
  };
  return [
    rect(x, y, width, height, {
      fill: C.surface,
      stroke: selected ? C.primary : C.border,
      strokeWidth: selected ? 2 : 1,
      radius: 14,
    }),
    step
      ? circle(x + 28, y + 28, 16, {
          fill: selected ? C.primary : C.canvasSubtle,
          stroke: selected ? C.primary : C.border,
          strokeWidth: 1,
        })
      : "",
    step
      ? txt(x + 28, y + 33, step, {
          size: 12,
          fill: selected ? C.surface : C.secondary,
          weight: 600,
          anchor: "middle",
        })
      : "",
    txt(x + (step ? 54 : 20), y + 34, title, {
      size: 16,
      weight: 600,
    }),
    ...textLines(x + 20, y + 62, subtitle, {
      size: 13,
      fill: C.secondary,
      lineHeight: 19,
    }),
    ...badge(x + width - 112, y + height - 34, palette.label, {
      fill: palette.bg,
      color: palette.ink,
      width: 96,
      height: 24,
    }),
  ];
}

function boardHeader(title, subtitle, status = "FINAL / LOCKED") {
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
    ...badge(1570, 44, status, {
      fill: C.primarySoft,
      color: C.primary,
      width: 182,
      height: 30,
    }),
    line(48, 126, 1752, 126, { stroke: C.border }),
  ];
}

function interactionStrategyBoard() {
  const cards = [
    {
      key: "A",
      title: "Guided Linear",
      subtitle: "Satu tugas, satu tahap aktif",
      bullets: [
        "Cocok untuk scan struk",
        "Back/cancel selalu tersedia",
        "AI dipicu event, bukan timer",
        "Tidak cocok untuk edit cepat",
      ],
      verdict: "DIPILIH · SCAN",
      selected: true,
    },
    {
      key: "B",
      title: "Contextual Inline",
      subtitle: "Konteks list tetap terlihat",
      bullets: [
        "Cocok untuk koreksi transaksi",
        "Side panel pada desktop",
        "Focused page pada mobile",
        "Tidak dipakai untuk scan panjang",
      ],
      verdict: "DIPILIH · EDIT",
      selected: true,
    },
    {
      key: "C",
      title: "Recovery First",
      subtitle: "Kegagalan punya jalan keluar",
      bullets: [
        "Retry tanpa kehilangan input",
        "Manual fallback saat AI gagal",
        "Offline tetap menampilkan cache",
        "Cabang, bukan default flow",
      ],
      verdict: "DIPILIH · BRANCH",
      selected: true,
    },
  ];
  return svgDoc(1800, 1000, "Fintrack AI CP4 interaction strategy study", [
    ...boardHeader(
      "CP4-R0 · Interaction Strategy",
      "Tiga pola diuji; kombinasi dipakai sesuai jenis tugas, bukan satu pola universal.",
    ),
    ...cards.flatMap((card, index) => {
      const x = 48 + index * 568;
      return [
        rect(x, 176, 520, 590, {
          fill: C.surface,
          stroke: C.primary,
          strokeWidth: 1.5,
          radius: 18,
        }),
        circle(x + 44, 224, 24, { fill: C.primary }),
        txt(x + 44, 231, card.key, {
          size: 18,
          fill: C.surface,
          weight: 600,
          anchor: "middle",
        }),
        txt(x + 84, 220, card.title, {
          size: 24,
          weight: 600,
          family: DISPLAY,
        }),
        txt(x + 84, 248, card.subtitle, {
          size: 14,
          fill: C.secondary,
          weight: 500,
        }),
        rect(x + 24, 282, 472, 1, { fill: C.divider }),
        ...card.bullets.flatMap((bullet, bulletIndex) => {
          const y = 332 + bulletIndex * 76;
          return [
            circle(x + 48, y - 5, 12, { fill: C.signalSoft }),
            icon("check", x + 42, y - 11, 12, { color: C.signalInk }),
            txt(x + 76, y, bullet, {
              size: 15,
              fill: C.ink,
              weight: 500,
            }),
          ];
        }),
        ...badge(x + 24, 704, card.verdict, {
          fill: C.primarySoft,
          color: C.primary,
          width: 190,
          height: 32,
        }),
      ];
    }),
    rect(48, 814, 1704, 120, {
      fill: C.canvasSubtle,
      stroke: C.border,
      strokeWidth: 1,
      radius: 14,
    }),
    icon("info", 76, 846, 22, { color: C.primary }),
    txt(112, 860, "Keputusan R0", {
      size: 16,
      fill: C.primary,
      weight: 600,
    }),
    ...textLines(
      112,
      888,
      [
        "Scan memakai Guided Linear; koreksi memakai Contextual Inline; semua kegagalan masuk Recovery First.",
        "Pola ini menjaga alur tenang tanpa menyembunyikan jalan keluar atau mengubah error menjadi halaman buntu.",
      ],
      { size: 14, fill: C.secondary, lineHeight: 22 },
    ),
  ]);
}

const stateRows = [
  [
    "Loading",
    "Data belum tersedia",
    "Ringkasan sedang dimuat",
    "Tunggu · gunakan cache",
    "Data · error · offline",
  ],
  [
    "Empty",
    "Belum ada transaksi",
    "Belum ada transaksi bulan ini",
    "Tambah manual · scan",
    "Transaksi pertama",
  ],
  [
    "Offline",
    "Koneksi terputus",
    "Data cache masih bisa dilihat",
    "Manual · coba lagi",
    "Online · draft lokal",
  ],
  [
    "Error",
    "Upload / simpan gagal",
    "Input dan foto tetap aman",
    "Retry · kembali",
    "Berhasil · batal",
  ],
  [
    "AI quota",
    "Kuota / rate limit",
    "Pemindaian AI sedang sibuk",
    "Manual · nanti",
    "Manual · scan ulang",
  ],
  [
    "Review",
    "Field perlu diperiksa",
    "Kategori perlu diperiksa",
    "Edit field · simpan",
    "Valid · save error",
  ],
  [
    "Success",
    "Mutation berhasil",
    "Transaksi tersimpan",
    "Tutup opsional",
    "Data terbaru",
  ],
  [
    "Destructive",
    "Hapus dipilih",
    "Objek dan dampak disebut",
    "Batal · hapus",
    "Kembali · deleted",
  ],
];

function stateMatrixBoard() {
  const headers = ["STATE", "TRIGGER", "PESAN UTAMA", "AKSI", "EXIT"];
  const widths = [184, 286, 410, 330, 286];
  const starts = widths.reduce(
    (acc, width, index) => [
      ...acc,
      (acc[index] ?? 48) + (index === 0 ? 0 : widths[index - 1]),
    ],
    [],
  );
  const xPositions = [48, 232, 518, 928, 1258];
  return svgDoc(1800, 1260, "Fintrack AI CP4 state inventory", [
    ...boardHeader(
      "CP4-R0 · State Inventory",
      "Setiap state menjelaskan apa yang terjadi, dampaknya, tindakan berikut, dan exit yang aman.",
    ),
    rect(48, 162, 1704, 54, {
      fill: C.ink,
      radius: 12,
    }),
    ...headers.map((header, index) =>
      txt(xPositions[index] + 16, 195, header, {
        size: 12,
        fill: C.surface,
        weight: 600,
        letterSpacing: 1.1,
      }),
    ),
    ...stateRows.flatMap((row, rowIndex) => {
      const y = 228 + rowIndex * 106;
      const key = [
        "loading",
        "empty",
        "offline",
        "error",
        "quota",
        "review",
        "success",
        "destructive",
      ][rowIndex];
      const palette = statePalette[key];
      return [
        rect(48, y, 1704, 92, {
          fill: rowIndex % 2 === 0 ? C.surface : C.canvasSubtle,
          stroke: C.divider,
          strokeWidth: 1,
          radius: 10,
        }),
        circle(76, y + 46, 16, { fill: palette.bg }),
        icon(palette.icon, 68, y + 38, 16, { color: palette.ink }),
        txt(104, y + 51, row[0], {
          size: 15,
          fill: palette.ink,
          weight: 600,
        }),
        ...row.slice(1).map((cell, cellIndex) =>
          txt(xPositions[cellIndex + 1] + 16, y + 51, cell, {
            size: 14,
            fill: C.ink,
            weight: cellIndex === 1 ? 600 : 500,
          }),
        ),
      ];
    }),
    rect(48, 1102, 1704, 104, {
      fill: C.primarySoft,
      radius: 12,
    }),
    icon("shield-check", 76, 1136, 22, { color: C.primary }),
    txt(112, 1147, "Async announcement", {
      size: 15,
      fill: C.primary,
      weight: 600,
    }),
    ...textLines(
      112,
      1174,
      [
        "Loading, error, dan success diumumkan melalui live region yang sesuai. Error field tetap terhubung ke input.",
        "Success tidak mengambil fokus; destructive dialog mengambil fokus, menjebaknya, lalu mengembalikan ke pemicu.",
      ],
      { size: 13, fill: C.secondary, lineHeight: 20 },
    ),
  ]);
}

function scanFlowBoard() {
  const nodeY = 208;
  const nodeW = 206;
  const gap = 30;
  const xs = Array.from({ length: 7 }, (_, i) => 48 + i * (nodeW + gap));
  const nodes = [
    ["Dashboard", ["Aksi Scan struk"], "1", "default"],
    ["Pilih foto", ["Ambil / galeri", "Tips privasi"], "2", "default"],
    ["Persiapan", ["Kompresi lokal", "Upload aman"], "3", "loading"],
    ["Pemeriksaan AI", ["Event-driven", "Tanpa persen palsu"], "4", "loading"],
    ["Tinjau", ["Field editable", "Warning dekat field"], "5", "review"],
    ["Simpan", ["Mutation nyata", "Input terkunci sementara"], "6", "loading"],
    ["Dashboard", ["Data diperbarui", "Toast non-blocking"], "7", "success"],
  ];
  const branchCards = [
    [48, 548, "Izin kamera ditolak", ["Pilih galeri · kembali", "Tidak memblokir manual"], "error"],
    [374, 548, "Offline sebelum upload", ["Foto tetap lokal", "Manual · retry"], "offline"],
    [700, 548, "Upload gagal", ["Foto + pilihan dipertahankan", "Retry · kembali"], "error"],
    [1026, 548, "AI quota / rate limit", ["Tidak ada detail teknis", "Manual · coba nanti"], "quota"],
    [1352, 548, "Simpan gagal", ["Edit tetap ada", "Retry · batal"], "error"],
  ];
  return svgDoc(1800, 1020, "Fintrack AI CP4 scan flow map", [
    ...boardHeader(
      "CP4-R0 · Scan Flow",
      "Happy path tetap linear; recovery bercabang tanpa kehilangan foto, input, atau konteks.",
    ),
    ...nodes.flatMap(([title, subtitle, step, state], index) => [
      ...nodeCard(xs[index], nodeY, nodeW, title, subtitle, {
        state,
        step,
        selected: index === 3 || index === 4,
        height: 132,
      }),
      index < nodes.length - 1
        ? arrow(
            xs[index] + nodeW,
            nodeY + 66,
            xs[index + 1] - 8,
            nodeY + 66,
          )
        : "",
    ]),
    ...branchCards.flatMap(([x, y, title, subtitle, state]) => [
      ...nodeCard(x, y, 278, title, subtitle, {
        state,
        height: 132,
      }),
    ]),
    ...arrow(xs[1] + 80, nodeY + 132, 187, 540, {
      color: C.error,
      dash: "7 7",
    }),
    ...arrow(xs[2] + 74, nodeY + 132, 513, 540, {
      color: C.primary,
      dash: "7 7",
    }),
    ...arrow(xs[2] + 146, nodeY + 132, 839, 540, {
      color: C.error,
      dash: "7 7",
    }),
    ...arrow(xs[3] + 140, nodeY + 132, 1165, 540, {
      color: C.warning,
      dash: "7 7",
    }),
    ...arrow(xs[5] + 110, nodeY + 132, 1491, 540, {
      color: C.error,
      dash: "7 7",
    }),
    rect(48, 780, 1704, 178, {
      fill: C.canvasSubtle,
      stroke: C.border,
      strokeWidth: 1,
      radius: 14,
    }),
    txt(76, 820, "Responsive behavior", {
      size: 16,
      fill: C.primary,
      weight: 600,
    }),
    ...textLines(
      76,
      852,
      [
        "Mobile: satu tahap aktif per layar; recovery memakai inline state atau bottom sheet; aksi utama tetap 48 px.",
        "Desktop: upload, processing, dan review memakai split workspace; error berada di panel aktif atau dialog terfokus.",
        "Tablet: preview ditumpuk di atas form; full sidebar dan bottom navigation tidak pernah tampil bersamaan.",
      ],
      { size: 14, fill: C.secondary, lineHeight: 28 },
    ),
  ]);
}

function correctionFlowBoard() {
  const mainNodes = [
    [64, 220, "Daftar transaksi", ["Pilih Superindo", "Konteks periode tetap"], "1", "default"],
    [354, 220, "Detail", ["Field terbaca", "Edit / hapus terlihat"], "2", "default"],
    [644, 220, "Koreksi kategori", ["Pilih Belanja", "Nilai berubah"], "3", "review"],
    [934, 220, "Simpan", ["Mutation nyata", "Disabled saat request"], "4", "loading"],
    [1224, 220, "List diperbarui", ["Selection tetap", "Toast success"], "5", "success"],
  ];
  return svgDoc(1800, 1000, "Fintrack AI CP4 correction flow map", [
    ...boardHeader(
      "CP4-R0 · Transaction Correction",
      "Koreksi singkat mempertahankan konteks list; destructive branch tetap disengaja dan terpisah.",
    ),
    ...mainNodes.flatMap(([x, y, title, subtitle, step, state], index) => [
      ...nodeCard(x, y, 242, title, subtitle, {
        state,
        step,
        selected: index === 2,
        height: 132,
      }),
      index < mainNodes.length - 1
        ? arrow(x + 242, y + 66, mainNodes[index + 1][0] - 10, y + 66)
        : "",
    ]),
    ...nodeCard(934, 498, 300, "Simpan gagal", ["Edit tidak hilang", "Retry · kembali"], {
      state: "error",
      height: 132,
    }),
    ...arrow(1055, 352, 1084, 488, {
      color: C.error,
      dash: "7 7",
    }),
    ...arrow(934, 564, 814, 564, {
      color: C.primary,
      dash: "7 7",
      label: "retry",
      labelY: -12,
    }),
    ...nodeCard(354, 498, 300, "Konfirmasi hapus", ["Fokus awal: Batal", "Objek + dampak jelas"], {
      state: "destructive",
      height: 132,
    }),
    ...nodeCard(64, 716, 300, "Transaksi dihapus", ["List diperbarui", "Announcement success"], {
      state: "success",
      height: 132,
    }),
    ...arrow(475, 352, 504, 488, {
      color: C.error,
      dash: "7 7",
      label: "hapus",
      labelY: -12,
    }),
    ...arrow(354, 564, 214, 706, {
      color: C.error,
      dash: "7 7",
      label: "confirm",
      labelY: -12,
    }),
    rect(1280, 476, 472, 372, {
      fill: C.canvasSubtle,
      stroke: C.border,
      strokeWidth: 1,
      radius: 14,
    }),
    txt(1308, 518, "Breakpoint decision", {
      size: 16,
      fill: C.primary,
      weight: 600,
    }),
    ...badge(1308, 548, "MOBILE", {
      fill: C.primarySoft,
      color: C.primary,
      width: 90,
    }),
    ...textLines(
      1308,
      604,
      [
        "Detail menjadi focused page.",
        "Kategori dapat memakai sheet singkat.",
        "Save action tetap mudah dijangkau.",
      ],
      { size: 14, fill: C.secondary, lineHeight: 24 },
    ),
    ...badge(1308, 692, "DESKTOP", {
      fill: C.primarySoft,
      color: C.primary,
      width: 90,
    }),
    ...textLines(
      1308,
      748,
      [
        "List dan side panel tetap sejajar.",
        "Fokus kembali ke row yang dipilih.",
        "Success tidak menutup konteks.",
      ],
      { size: 14, fill: C.secondary, lineHeight: 24 },
    ),
  ]);
}

function focusMotionBoard() {
  const motionRows = [
    ["Hover / press", "opacity / color", "120 ms", "tanpa transform"],
    ["Field validation", "border + message", "180 ms", "langsung"],
    ["Sheet / dialog enter", "opacity + 8 px", "260 ms", "langsung"],
    ["Toast success", "opacity + 6 px", "180 ms", "langsung"],
    ["Screen transition", "opacity + 8 px", "180 ms", "langsung"],
    ["Scanning line", "posisi linear", "selama request", "garis statis"],
  ];
  return svgDoc(1800, 1120, "Fintrack AI CP4 focus and motion board", [
    ...boardHeader(
      "CP4-R0 · Focus & Motion",
      "Focus mengikuti tugas; motion menjelaskan perubahan dan berhenti saat event selesai.",
    ),
    rect(48, 166, 782, 410, {
      fill: C.surface,
      stroke: C.border,
      strokeWidth: 1,
      radius: 16,
    }),
    txt(76, 208, "Mobile review · focus order", {
      size: 18,
      weight: 600,
      family: DISPLAY,
    }),
    ...[
      ["1", "Back"],
      ["2", "Merchant"],
      ["3", "Total"],
      ["4", "Tanggal"],
      ["5", "Kategori · warning"],
      ["6", "Item terdeteksi"],
      ["7", "Simpan transaksi"],
    ].flatMap(([number, label], index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = 76 + col * 354;
      const y = 250 + row * 70;
      return [
        circle(x + 18, y + 18, 18, {
          fill: number === "5" ? C.warningSoft : C.primarySoft,
          stroke: number === "5" ? C.warning : C.primary,
          strokeWidth: 1.5,
        }),
        txt(x + 18, y + 23, number, {
          size: 13,
          fill: number === "5" ? C.warning : C.primary,
          weight: 600,
          anchor: "middle",
        }),
        txt(x + 50, y + 23, label, {
          size: 14,
          weight: number === "5" ? 600 : 500,
        }),
      ];
    }),
    rect(866, 166, 886, 410, {
      fill: C.surface,
      stroke: C.border,
      strokeWidth: 1,
      radius: 16,
    }),
    txt(894, 208, "Desktop detail / dialog · focus rules", {
      size: 18,
      weight: 600,
      family: DISPLAY,
    }),
    ...[
      ["A", "Selected row membuka panel; fokus menuju heading detail."],
      ["B", "Field mengikuti urutan visual atas-ke-bawah."],
      ["C", "Dialog: fokus awal Batal; Tab terperangkap di dalam."],
      ["D", "Escape menutup dialog; fokus kembali ke pemicu."],
      ["E", "Success toast tidak mengambil fokus."],
    ].flatMap(([key, label], index) => {
      const y = 252 + index * 58;
      return [
        circle(916, y, 16, { fill: C.primarySoft }),
        txt(916, y + 5, key, {
          size: 12,
          fill: C.primary,
          anchor: "middle",
          weight: 600,
        }),
        txt(948, y + 5, label, {
          size: 14,
          fill: C.ink,
          weight: 500,
        }),
      ];
    }),
    txt(48, 628, "Motion contract", {
      size: 20,
      weight: 600,
      family: DISPLAY,
    }),
    rect(48, 654, 1704, 48, { fill: C.ink, radius: 10 }),
    ...["EVENT", "DEFAULT", "DURATION", "REDUCED MOTION"].map((header, index) =>
      txt([68, 450, 858, 1164][index], 684, header, {
        size: 12,
        fill: C.surface,
        weight: 600,
        letterSpacing: 1,
      }),
    ),
    ...motionRows.flatMap((row, rowIndex) => {
      const y = 714 + rowIndex * 56;
      return [
        rect(48, y, 1704, 48, {
          fill: rowIndex % 2 === 0 ? C.surface : C.canvasSubtle,
          stroke: C.divider,
          strokeWidth: 1,
          radius: 8,
        }),
        ...row.map((cell, cellIndex) =>
          txt([68, 450, 858, 1164][cellIndex], y + 30, cell, {
            size: 14,
            fill: cellIndex === 3 ? C.primary : C.ink,
            weight: cellIndex === 0 || cellIndex === 3 ? 600 : 500,
          }),
        ),
      ];
    }),
    rect(48, 1060, 1704, 34, { fill: C.warningSoft, radius: 8 }),
    txt(
      64,
      1082,
      "Tidak ada auto-advance berbasis timer untuk proses AI; prototype maju hanya melalui event simulator.",
      { size: 13, fill: C.warning, weight: 600 },
    ),
  ]);
}

function responsiveStateBoard() {
  const rows = [
    [
      "Error / offline",
      "Inline state atau bottom sheet; foto dan input tetap terlihat.",
      "Status berada pada panel aktif; dialog hanya jika keputusan memblokir.",
      "Stack panel; recovery action tetap berdekatan dengan konteks.",
    ],
    [
      "Success",
      "Toast non-blocking di atas nav; data utama sudah diperbarui.",
      "Toast di kanan atas; list/panel tetap terlihat.",
      "Toast mengikuti safe area dan tidak menutup aksi utama.",
    ],
    [
      "Destructive",
      "Dialog terfokus; bukan gesture sheet; Batal menjadi fokus awal.",
      "Centered modal dengan scrim; fokus kembali ke tombol pemicu.",
      "Dialog maksimum 560 px; tidak berubah menjadi full-screen tanpa alasan.",
    ],
  ];
  return svgDoc(1800, 900, "Fintrack AI CP4 responsive state rules", [
    ...boardHeader(
      "CP4-R0 · Responsive States",
      "State yang sama mempertahankan makna, tetapi pola surface berubah sesuai ruang dan risiko.",
    ),
    rect(48, 170, 1704, 54, { fill: C.ink, radius: 10 }),
    ...["STATE", "MOBILE <768", "DESKTOP ≥1024", "TABLET 768–1023"].map(
      (header, index) =>
        txt([68, 306, 818, 1336][index], 203, header, {
          size: 12,
          fill: C.surface,
          weight: 600,
          letterSpacing: 1,
        }),
    ),
    ...rows.flatMap((row, rowIndex) => {
      const y = 240 + rowIndex * 174;
      return [
        rect(48, y, 1704, 154, {
          fill: rowIndex % 2 === 0 ? C.surface : C.canvasSubtle,
          stroke: C.divider,
          strokeWidth: 1,
          radius: 12,
        }),
        txt(68, y + 40, row[0], {
          size: 16,
          fill: rowIndex === 2 ? C.error : C.primary,
          weight: 600,
        }),
        ...textLines(306, y + 38, row[1].match(/.{1,44}(?:\s|$)/gu) ?? [row[1]], {
          size: 14,
          fill: C.ink,
          lineHeight: 22,
        }),
        ...textLines(818, y + 38, row[2].match(/.{1,46}(?:\s|$)/gu) ?? [row[2]], {
          size: 14,
          fill: C.ink,
          lineHeight: 22,
        }),
        ...textLines(1336, y + 38, row[3].match(/.{1,36}(?:\s|$)/gu) ?? [row[3]], {
          size: 14,
          fill: C.ink,
          lineHeight: 22,
        }),
      ];
    }),
    rect(48, 784, 1704, 70, {
      fill: C.primarySoft,
      radius: 12,
    }),
    icon("info", 74, 809, 20, { color: C.primary }),
    txt(
      108,
      824,
      "Meaning, copy, focus outcome, and recovery options stay consistent across breakpoints; only composition changes.",
      { size: 14, fill: C.primary, weight: 600 },
    ),
  ]);
}

function contactSheet() {
  const mobileFrames = frames.filter((frame) => frame.platform === "mobile");
  const desktopFrames = frames.filter((frame) => frame.platform === "desktop");
  return svgDoc(1800, 1900, "Fintrack AI CP4 state contact sheet", [
    ...boardHeader(
      "CP4-R0 · State Proof",
      "Dua belas state dan runtime frame melengkapi proof CP2/CP3 tanpa mengubah fondasi visual.",
    ),
    ...mobileFrames.flatMap((frame, index) => {
      const x = 48 + index * 342;
      const y = 180;
      return [
        txt(x, y, `${String(index + 1).padStart(2, "0")} · ${frame.title}`, {
          size: 14,
          weight: 600,
        }),
        rect(x, y + 24, 390 * 0.37 + 12, 844 * 0.37 + 12, {
          fill: C.surface,
          stroke: C.border,
          strokeWidth: 1,
          radius: 14,
        }),
        `<g transform="translate(${x + 6} ${y + 30}) scale(0.37)">${innerSvg(frame.svg)}</g>`,
      ];
    }),
    ...desktopFrames.flatMap((frame, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const x = 48 + col * 570;
      const y = 610 + row * 420;
      return [
        txt(
          x,
          y,
          `${String(index + mobileFrames.length + 1).padStart(2, "0")} · ${frame.title}`,
          {
          size: 14,
          weight: 600,
          },
        ),
        rect(x, y + 24, 1440 * 0.37 + 12, 1024 * 0.37 + 12, {
          fill: C.surface,
          stroke: C.border,
          strokeWidth: 1,
          radius: 14,
        }),
        `<g transform="translate(${x + 6} ${y + 30}) scale(0.37)">${innerSvg(frame.svg)}</g>`,
      ];
    }),
  ]);
}

const boards = [
  ["CP4_R0_INTERACTION_STRATEGY", interactionStrategyBoard()],
  ["CP4_R0_STATE_INVENTORY", stateMatrixBoard()],
  ["CP4_R0_SCAN_FLOW", scanFlowBoard()],
  ["CP4_R0_CORRECTION_FLOW", correctionFlowBoard()],
  ["CP4_R0_FOCUS_MOTION", focusMotionBoard()],
  ["CP4_R0_RESPONSIVE_STATES", responsiveStateBoard()],
  ["CP4_R0_STATE_CONTACT_SHEET", contactSheet()],
];

for (const [name, svg] of boards) {
  generated.push(...(await writeSvgAndPng(path.join(ROOT, name), svg)));
}

const interactionModel = {
  checkpoint: "CP4-R0",
  direction: "Quiet Signal — Refined",
  status: "Final / Locked",
  strategies: {
    scan: "Guided Linear",
    correction: "Contextual Inline",
    recovery: "Recovery First branching",
  },
  states: [
    {
      id: "loading",
      announcement: "Ringkasan sedang dimuat.",
      actions: ["wait", "use-cache-if-available"],
    },
    {
      id: "empty",
      announcement: "Belum ada transaksi bulan ini.",
      actions: ["add-manual", "scan-receipt"],
    },
    {
      id: "offline",
      announcement: "Kamu sedang offline. Data tersimpan masih bisa dilihat.",
      actions: ["manual-entry", "retry-connection"],
    },
    {
      id: "error",
      announcement: "Tindakan belum berhasil. Input tetap dipertahankan.",
      actions: ["retry", "back"],
    },
    {
      id: "quota",
      announcement: "Pemindaian AI sedang sibuk.",
      actions: ["manual-entry", "try-later"],
    },
    {
      id: "review",
      announcement: "Kategori perlu diperiksa.",
      actions: ["edit-field", "save-when-valid"],
    },
    {
      id: "success",
      announcement: "Transaksi tersimpan.",
      actions: ["dismiss-optional"],
    },
    {
      id: "destructive",
      announcement: "Konfirmasi penghapusan transaksi.",
      actions: ["cancel-default", "confirm-delete"],
    },
  ],
  flows: {
    scan: {
      happyPath: [
        "dashboard",
        "scan-start",
        "preparation",
        "processing",
        "review",
        "save",
        "dashboard-updated",
      ],
      recovery: [
        "permission-denied",
        "offline",
        "upload-error",
        "quota",
        "validation",
        "save-error",
      ],
    },
    correction: {
      happyPath: [
        "transactions",
        "detail",
        "edit-category",
        "save",
        "list-updated",
      ],
      recovery: ["save-error", "delete-confirmation"],
    },
  },
  focus: {
    mobileReview: [
      "back",
      "merchant",
      "amount",
      "date",
      "category-warning",
      "items",
      "save",
    ],
    destructiveDialog: {
      initial: "cancel",
      trapped: true,
      escapeCloses: true,
      returnsToTrigger: true,
    },
    successToastTakesFocus: false,
  },
  motion: {
    fast: 120,
    base: 180,
    slow: 260,
    asyncAutoAdvance: false,
    fakeProgress: false,
    reducedMotion: "remove transforms and scanning animation; preserve state change",
  },
  responsive: {
    mobile: "Focused page, inline state, or bottom sheet by complexity",
    tablet: "Compact rail; stack context and form when needed",
    desktop: "Contextual side panel or dialog; preserve list/workspace context",
  },
  inheritedFrom: [
    "../local-cp2/CP2_R0_FINAL_LOCK.md",
    "../local-cp3/CP3_R0_FINAL_LOCK.md",
    "../logo-r1/LOGO_R1_FINAL_LOCK.md",
  ],
};
await fs.writeFile(
  path.join(ROOT, "cp4-interaction-model.json"),
  `${JSON.stringify(interactionModel, null, 2)}\n`,
  "utf8",
);

const manifest = {
  project: "Fintrack AI",
  checkpoint: "CP4",
  revision: "R0",
  direction: "Quiet Signal — Refined",
  status: "Final / Locked",
  generatedAt: "2026-07-29",
  sourceLocks: {
    content: "../local-cp1/review-notes/CP1_FINAL_LOCK.md",
    mobile: "../local-cp2/CP2_R0_FINAL_LOCK.md",
    desktop: "../local-cp3/CP3_R0_FINAL_LOCK.md",
    logo: "../logo-r1/LOGO_R1_FINAL_LOCK.md",
  },
  designSystem: "../../DESIGN_SYSTEM.md",
  stateFrames: frames.map((frame) => ({
    platform: frame.platform,
    title: frame.title,
    state: frame.state,
    svg: `states/${frame.platform}/${frame.slug}.svg`,
    png: `states/${frame.platform}/${frame.slug}.png`,
  })),
  reviewBoards: boards.flatMap(([name]) => [`${name}.svg`, `${name}.png`]),
  prototype: [
    "prototype/index.html",
    "prototype/styles.css",
    "prototype/app.js",
    "prototype/README.md",
  ],
  documentation: [
    "README.md",
    "CP4_R0_SPEC.md",
    "CP4_R0_FINAL_LOCK.md",
    "cp4-interaction-model.json",
    "review-notes/CP4_R0_BROWSER_QA.md",
    "review-notes/CP4_R0_SELF_CRITIQUE.md",
  ],
  generatedFiles: generated.map((filePath) =>
    path.relative(ROOT, filePath).replaceAll("\\", "/"),
  ),
};
await fs.writeFile(
  path.join(ROOT, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);

console.log(
  JSON.stringify(
    {
      root: ROOT,
      status: manifest.status,
      stateFrames: frames.length,
      reviewBoards: boards.length,
      generatedFiles: generated.length,
    },
    null,
    2,
  ),
);
