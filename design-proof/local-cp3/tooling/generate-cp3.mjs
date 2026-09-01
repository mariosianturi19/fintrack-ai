import fs from "node:fs/promises";
import path from "node:path";
import {
  BODY,
  C,
  DESKTOP_DIR,
  DISPLAY,
  PROJECT_ROOT,
  ROOT,
  TESTS_DIR,
  badge,
  button,
  circle,
  cropFrame,
  field,
  icon,
  innerSvg,
  labelText,
  layout,
  line,
  pageHeader,
  progressStrip,
  receipt,
  rect,
  statusItem,
  svgDoc,
  textLines,
  transactionRow,
  txt,
  writeSvgAndPng,
} from "./design-core.mjs";

function dashboard(width = 1440) {
  const { contentX, contentRight, contentWidth } = layout(width);
  const gap = 24;
  const topY = 144;
  const topH = 198;
  const summaryW = Math.round(contentWidth * 0.64);
  const insightW = contentWidth - summaryW - gap;
  const bottomY = topY + topH + gap;
  const bottomH = 1024 - bottomY - 44;
  const chartW = Math.round(contentWidth * 0.64);
  const listW = contentWidth - chartW - gap;
  const chartData = [
    ["Makan & minum", "Rp1.214.000", 0.86, C.expense],
    ["Belanja", "Rp824.500", 0.58, C.chartPurple],
    ["Tagihan", "Rp760.000", 0.54, C.chartGold],
    ["Transportasi", "Rp384.000", 0.28, C.primary],
    ["Lainnya", "Rp300.000", 0.22, C.chartSlate],
  ];
  const recent = [
    ["Superindo", "12 Jul · Belanja · AI · Struk", "Hari ini", "−Rp326.500", C.primarySoft, "storefront"],
    ["Kedai Sela", "11 Jul · Makan · AI · Struk", "Kemarin", "−Rp48.000", C.expenseSoft, "fork-knife"],
    ["KRL", "10 Jul · Transportasi · Manual", "10 Jul", "−Rp20.000", C.primarySoft, "train"],
    ["PLN", "08 Jul · Tagihan · AI · Struk", "08 Jul", "−Rp350.000", C.signalSoft, "file-text"],
    ["Superindo", "05 Jul · Belanja · AI · Struk", "05 Jul", "−Rp284.000", C.primarySoft, "storefront"],
  ];
  return svgDoc(
    width,
    1024,
    "Fintrack AI desktop dashboard high fidelity CP3 R0",
    [
      pageHeader(
        "Dashboard",
        "Ringkasan pengeluaran pribadi · Juli 2026",
        "Dashboard",
        width,
        {
          extraButton: {
            width: 132,
            label: "Juli 2026",
            iconName: "calendar",
          },
        },
      ),
      rect(contentX, topY, summaryW, topH, {
        fill: C.surface,
        stroke: C.border,
        strokeWidth: 1,
        radius: 18,
      }),
      labelText(contentX + 28, topY + 35, "Total pengeluaran"),
      txt(contentX + 28, topY + 93, "Rp3.482.500", {
        size: 42,
        weight: 600,
        family: DISPLAY,
        numeric: true,
      }),
      icon("trend-up", contentX + 30, topY + 119, 18, {
        color: C.expenseInk,
      }),
      txt(contentX + 54, topY + 133, "Sedikit lebih tinggi dari Juni", {
        size: 14,
        fill: C.secondary,
        weight: 500,
      }),
      line(
        contentX + summaryW - 206,
        topY + 30,
        contentX + summaryW - 206,
        topY + topH - 30,
        { stroke: C.divider },
      ),
      labelText(contentX + summaryW - 178, topY + 35, "Pengeluaran minggu ini"),
      txt(contentX + summaryW - 178, topY + 80, "Rp846.000", {
        size: 24,
        family: DISPLAY,
        weight: 600,
        numeric: true,
      }),
      txt(contentX + summaryW - 178, topY + 108, "24% dari total bulan ini", {
        size: 13,
        fill: C.secondary,
        weight: 500,
      }),
      button(
        contentX + summaryW - 178,
        topY + 130,
        150,
        "Tambah manual",
        { kind: "secondary", iconName: "plus" },
      ),
      rect(contentX + summaryW + gap, topY, insightW, topH, {
        fill: C.primarySoft,
        radius: 18,
      }),
      rect(contentX + summaryW + gap, topY + 24, 4, topH - 48, {
        fill: C.primary,
        radius: 2,
      }),
      badge(contentX + summaryW + gap + 28, topY + 24, "Insight mingguan", {
        fill: C.surface,
        color: C.primary,
        width: 128,
      }),
      txt(
        contentX + summaryW + gap + 28,
        topY + 86,
        "Makan naik sedikit",
        { size: 21, weight: 600, family: DISPLAY },
      ),
      ...textLines(
        contentX + summaryW + gap + 28,
        topY + 116,
        ["Naik Rp84.000 dibanding minggu lalu.", "Masih sejalan dengan pola bulan ini."],
        { size: 14, fill: C.secondary, weight: 500, lineHeight: 22 },
      ),
      txt(
        contentX + summaryW + gap + 28,
        topY + 176,
        "Lihat rincian kategori →",
        { size: 13, fill: C.primary, weight: 600 },
      ),
      rect(contentX, bottomY, chartW, bottomH, {
        fill: C.surface,
        stroke: C.border,
        strokeWidth: 1,
        radius: 16,
      }),
      txt(contentX + 28, bottomY + 40, "Distribusi kategori", {
        size: 20,
        weight: 600,
        family: DISPLAY,
      }),
      txt(contentX + 28, bottomY + 65, "Juli 2026 · seluruh transaksi", {
        size: 13,
        fill: C.secondary,
        weight: 500,
      }),
      rect(contentX + 28, bottomY + 92, chartW - 56, 18, {
        fill: C.disabled,
        radius: 5,
      }),
      rect(contentX + 28, bottomY + 92, (chartW - 56) * 0.35, 18, {
        fill: C.expense,
        radius: 5,
      }),
      rect(
        contentX + 28 + (chartW - 56) * 0.35,
        bottomY + 92,
        (chartW - 56) * 0.24,
        18,
        { fill: C.chartPurple },
      ),
      rect(
        contentX + 28 + (chartW - 56) * 0.59,
        bottomY + 92,
        (chartW - 56) * 0.22,
        18,
        { fill: C.chartGold },
      ),
      rect(
        contentX + 28 + (chartW - 56) * 0.81,
        bottomY + 92,
        (chartW - 56) * 0.11,
        18,
        { fill: C.primary },
      ),
      ...chartData.map(([label, amount, ratio, color], index) => {
        const y = bottomY + 146 + index * 66;
        return [
          circle(contentX + 34, y - 4, 5, { fill: color }),
          txt(contentX + 50, y, label, { size: 14, weight: 500 }),
          txt(contentX + chartW - 28, y, amount, {
            size: 14,
            weight: 600,
            anchor: "end",
            numeric: true,
          }),
          rect(contentX + 50, y + 14, chartW - 106, 8, {
            fill: C.disabled,
            radius: 4,
          }),
          rect(contentX + 50, y + 14, (chartW - 106) * ratio, 8, {
            fill: color,
            radius: 4,
          }),
        ];
      }),
      rect(contentX + 28, bottomY + bottomH - 76, chartW - 56, 48, {
        fill: C.canvasSubtle,
        radius: 10,
      }),
      icon("info", contentX + 44, bottomY + bottomH - 62, 18, {
        color: C.primary,
      }),
      txt(
        contentX + 70,
        bottomY + bottomH - 49,
        "Makan & minum adalah kategori terbesar—35% dari total Juli.",
        { size: 13, fill: C.secondary, weight: 500 },
      ),
      rect(contentX + chartW + gap, bottomY, listW, bottomH, {
        fill: C.surface,
        stroke: C.border,
        strokeWidth: 1,
        radius: 16,
      }),
      txt(contentX + chartW + gap + 24, bottomY + 40, "Transaksi terbaru", {
        size: 20,
        weight: 600,
        family: DISPLAY,
      }),
      txt(contentRight - 24, bottomY + 40, "Lihat semua", {
        size: 13,
        fill: C.primary,
        weight: 600,
        anchor: "end",
      }),
      ...recent.map((row, index) =>
        transactionRow(
          contentX + chartW + gap + 8,
          bottomY + 70 + index * 82,
          listW - 16,
          row[0],
          row[1],
          width >= 1400 ? row[2] : "",
          row[3],
          { color: row[4], iconName: row[5], height: 76 },
        ),
      ),
      txt(contentX + chartW + gap + 24, bottomY + bottomH - 26, "22 transaksi · Juli 2026", {
        size: 12,
        fill: C.secondary,
        weight: 500,
      }),
    ],
  );
}

function dashboardStates(width = 1440) {
  const { contentX, contentRight, contentWidth } = layout(width);
  const gap = 20;
  const cardW = (contentWidth - gap * 2) / 3;
  const y = 158;
  const h = 760;
  const card = (index, title, subtitle) => {
    const x = contentX + index * (cardW + gap);
    return [
      rect(x, y, cardW, h, {
        fill: C.surface,
        stroke: C.border,
        strokeWidth: 1,
        radius: 16,
      }),
      txt(x + 24, y + 38, title, {
        size: 18,
        weight: 600,
        family: DISPLAY,
      }),
      txt(x + 24, y + 62, subtitle, {
        size: 12,
        fill: C.secondary,
        weight: 500,
      }),
      line(x + 24, y + 84, x + cardW - 24, y + 84),
    ];
  };
  const loadingX = contentX;
  const emptyX = contentX + cardW + gap;
  const offlineX = contentX + (cardW + gap) * 2;
  return svgDoc(
    width,
    1024,
    "Fintrack AI desktop dashboard states high fidelity CP3 R0",
    [
      pageHeader(
        "Kondisi dashboard",
        "Loading, empty, dan offline mempertahankan struktur yang sama",
        "Dashboard",
        width,
        { showScan: false },
      ),
      card(0, "Loading", "Struktur stabil, tanpa spinner layar penuh"),
      card(1, "Empty", "Satu langkah berikutnya, tanpa ilustrasi besar"),
      card(2, "Offline / cached", "Data tersimpan tetap berguna"),
      labelText(loadingX + 24, y + 124, "Ringkasan bulan"),
      rect(loadingX + 24, y + 148, cardW * 0.46, 12, {
        fill: C.disabled,
        radius: 5,
      }),
      rect(loadingX + 24, y + 176, cardW * 0.72, 22, {
        fill: "#E7E3DA",
        radius: 6,
      }),
      rect(loadingX + 24, y + 224, cardW - 48, 118, {
        fill: C.canvasSubtle,
        stroke: C.divider,
        strokeWidth: 1,
        radius: 12,
      }),
      ...Array.from({ length: 4 }, (_, index) =>
        rect(
          loadingX + 42,
          y + 246 + index * 22,
          cardW * (index % 2 === 0 ? 0.64 : 0.48),
          8,
          { fill: C.disabled, radius: 4 },
        ),
      ),
      labelText(loadingX + 24, y + 386, "Transaksi terbaru"),
      ...Array.from({ length: 4 }, (_, index) => [
        circle(loadingX + 42, y + 422 + index * 66, 14, {
          fill: C.disabled,
        }),
        rect(loadingX + 66, y + 410 + index * 66, cardW * 0.38, 9, {
          fill: C.disabled,
          radius: 4,
        }),
        rect(loadingX + 66, y + 430 + index * 66, cardW * 0.54, 7, {
          fill: C.canvas,
          radius: 4,
        }),
      ]),
      rect(loadingX + 24, y + h - 82, cardW - 48, 48, {
        fill: C.canvasSubtle,
        radius: 10,
      }),
      icon("info", loadingX + 40, y + h - 67, 17, { color: C.secondary }),
      txt(loadingX + 66, y + h - 54, "Layout tidak bergeser saat data masuk.", {
        size: 12,
        fill: C.secondary,
        weight: 500,
      }),
      badge(emptyX + 24, y + 116, "Awal yang jelas", {
        fill: C.signalSoft,
        color: C.signalInk,
        width: 126,
      }),
      icon("receipt", emptyX + cardW / 2 - 20, y + 192, 40, {
        color: C.primary,
      }),
      txt(emptyX + cardW / 2, y + 262, "Belum ada transaksi bulan ini", {
        size: 18,
        weight: 600,
        anchor: "middle",
        family: DISPLAY,
      }),
      ...textLines(
        emptyX + cardW / 2,
        y + 294,
        ["Tambahkan secara manual atau scan", "struk pertamamu."],
        {
          size: 13,
          fill: C.secondary,
          weight: 500,
          anchor: "middle",
          lineHeight: 20,
        },
      ),
      button(emptyX + 24, y + 350, cardW - 48, "Tambah transaksi", {
        iconName: "plus",
      }),
      rect(emptyX + 24, y + 430, cardW - 48, 170, {
        fill: C.canvasSubtle,
        radius: 12,
      }),
      labelText(emptyX + 42, y + 466, "Yang tetap tampil"),
      ...textLines(
        emptyX + 42,
        y + 500,
        [
          "• Periode aktif",
          "• Akses scan struk",
          "• Penjelasan langkah berikutnya",
          "• Navigasi aplikasi",
        ],
        { size: 13, fill: C.secondary, weight: 500, lineHeight: 28 },
      ),
      txt(emptyX + 24, y + h - 48, "Tidak ada upsell atau ilustrasi dekoratif.", {
        size: 12,
        fill: C.secondary,
        weight: 500,
      }),
      badge(offlineX + 24, y + 116, "Offline", {
        fill: C.primarySoft,
        color: C.primary,
        width: 92,
        iconName: "wifi-slash",
      }),
      rect(offlineX + 24, y + 164, cardW - 48, 94, {
        fill: C.primarySoft,
        radius: 12,
      }),
      icon("cloud-check", offlineX + 42, y + 186, 20, {
        color: C.primary,
      }),
      txt(offlineX + 72, y + 201, "Data tersimpan masih bisa dilihat", {
        size: 14,
        weight: 600,
      }),
      ...textLines(
        offlineX + 72,
        y + 226,
        ["Perubahan baru disinkronkan saat", "koneksi kembali."],
        { size: 12, fill: C.secondary, weight: 500, lineHeight: 18 },
      ),
      labelText(offlineX + 24, y + 302, "Tersimpan di perangkat"),
      transactionRow(
        offlineX + 16,
        y + 330,
        cardW - 32,
        "PLN",
        "Tagihan · AI · Struk",
        "08 Jul",
        "−Rp350.000",
        { color: C.signalSoft, iconName: "file-text", height: 82 },
      ),
      transactionRow(
        offlineX + 16,
        y + 414,
        cardW - 32,
        "KRL",
        "Transportasi · Manual",
        "10 Jul",
        "−Rp20.000",
        { color: C.primarySoft, iconName: "train", height: 82 },
      ),
      rect(offlineX + 24, y + 538, cardW - 48, 124, {
        fill: C.canvasSubtle,
        radius: 12,
      }),
      labelText(offlineX + 42, y + 574, "Batas saat offline"),
      ...textLines(
        offlineX + 42,
        y + 606,
        ["Data dapat dibaca.", "Scan baru menunggu koneksi.", "Tidak ada layar error kosong."],
        { size: 13, fill: C.secondary, weight: 500, lineHeight: 24 },
      ),
      txt(contentRight, 958, "Comparison board · bukan satu halaman runtime", {
        size: 12,
        fill: C.secondary,
        weight: 500,
        anchor: "end",
      }),
    ],
  );
}

function transactions(width = 1440) {
  const { contentX, contentRight, contentWidth } = layout(width);
  const gap = 24;
  const panelW = width >= 1400 ? 400 : 356;
  const listW = contentWidth - panelW - gap;
  const topY = 148;
  const panelY = 222;
  const panelH = 750;
  const rows = [
    ["Superindo", "Belanja · AI · Struk", "12 Jul 2026", "−Rp326.500", C.primarySoft, "storefront"],
    ["Kedai Sela", "Makan · AI · Struk", "11 Jul 2026", "−Rp48.000", C.expenseSoft, "fork-knife"],
    ["KRL", "Transportasi · Manual", "10 Jul 2026", "−Rp20.000", C.primarySoft, "train"],
    ["PLN", "Tagihan · AI · Struk", "08 Jul 2026", "−Rp350.000", C.signalSoft, "file-text"],
    ["Kedai Sela", "Makan · AI · Struk", "07 Jul 2026", "−Rp64.000", C.expenseSoft, "fork-knife"],
    ["Superindo", "Belanja · AI · Struk", "05 Jul 2026", "−Rp284.000", C.primarySoft, "storefront"],
    ["Kedai Sela", "Makan · Manual", "03 Jul 2026", "−Rp42.000", C.expenseSoft, "fork-knife"],
  ];
  return svgDoc(
    width,
    1024,
    "Fintrack AI desktop transactions and side panel high fidelity CP3 R0",
    [
      pageHeader(
        "Transaksi",
        "22 transaksi · Juli 2026 · Rp3.482.500",
        "Transaksi",
        width,
        {
          showScan: false,
          extraButton: {
            width: 142,
            label: "Export data",
            iconName: "download-simple",
          },
        },
      ),
      rect(contentX, topY, listW - 154, 48, {
        fill: C.surface,
        stroke: C.border,
        strokeWidth: 1,
        radius: 10,
      }),
      icon("magnifying-glass", contentX + 16, topY + 15, 18, {
        color: C.secondary,
      }),
      txt(contentX + 46, topY + 30, "Cari merchant atau catatan", {
        size: 13,
        fill: C.secondary,
        weight: 500,
      }),
      button(contentX + listW - 138, topY + 2, 138, "Filter", {
        kind: "secondary",
        iconName: "funnel",
      }),
      rect(contentX, panelY, listW, panelH, {
        fill: C.surface,
        stroke: C.border,
        strokeWidth: 1,
        radius: 14,
      }),
      labelText(contentX + 20, panelY + 34, "Merchant / sumber"),
      txt(contentX + listW - 166, panelY + 34, "TANGGAL", {
        size: 11,
        fill: C.secondary,
        weight: 600,
        letterSpacing: 1.4,
        anchor: "end",
      }),
      txt(contentX + listW - 20, panelY + 34, "NOMINAL", {
        size: 11,
        fill: C.secondary,
        weight: 600,
        letterSpacing: 1.4,
        anchor: "end",
      }),
      line(contentX + 20, panelY + 52, contentX + listW - 20, panelY + 52),
      ...rows.map((row, index) =>
        transactionRow(
          contentX + 8,
          panelY + 62 + index * 88,
          listW - 16,
          row[0],
          row[1],
          row[2],
          row[3],
          {
            selected: index === 0,
            color: row[4],
            iconName: row[5],
            height: 82,
          },
        ),
      ),
      txt(contentX + 20, panelY + panelH - 18, "Menampilkan 7 dari 22 transaksi", {
        size: 12,
        fill: C.secondary,
        weight: 500,
      }),
      rect(contentX + listW + gap, panelY, panelW, panelH, {
        fill: C.surface,
        stroke: C.border,
        strokeWidth: 1,
        radius: 14,
      }),
      txt(contentX + listW + gap + 24, panelY + 38, "Detail transaksi", {
        size: 18,
        weight: 600,
        family: DISPLAY,
      }),
      badge(contentRight - 112, panelY + 18, "AI · Struk", {
        width: 88,
      }),
      line(
        contentX + listW + gap + 24,
        panelY + 60,
        contentRight - 24,
        panelY + 60,
      ),
      txt(contentX + listW + gap + 24, panelY + 104, "Superindo", {
        size: 18,
        weight: 600,
      }),
      txt(contentRight - 24, panelY + 104, "−Rp326.500", {
        size: 18,
        fill: C.expenseInk,
        weight: 600,
        anchor: "end",
        numeric: true,
      }),
      field(contentX + listW + gap + 24, panelY + 146, panelW - 48, "Merchant", "Superindo"),
      field(
        contentX + listW + gap + 24,
        panelY + 222,
        panelW - 48,
        "Total pengeluaran",
        "Rp326.500",
        { suffix: "IDR" },
      ),
      field(
        contentX + listW + gap + 24,
        panelY + 298,
        (panelW - 60) / 2,
        "Tanggal",
        "12 Jul 2026",
        { iconName: "calendar" },
      ),
      field(
        contentX + listW + gap + 36 + (panelW - 60) / 2,
        panelY + 298,
        (panelW - 60) / 2,
        "Kategori",
        "Belanja",
        { iconName: "tag" },
      ),
      field(
        contentX + listW + gap + 24,
        panelY + 374,
        panelW - 48,
        "Catatan",
        "Belanja kebutuhan rumah",
        { iconName: "note-pencil" },
      ),
      rect(contentX + listW + gap + 24, panelY + 446, panelW - 48, 64, {
        fill: C.primarySoft,
        radius: 10,
      }),
      icon("shield-check", contentX + listW + gap + 40, panelY + 468, 18, {
        color: C.primary,
      }),
      txt(contentX + listW + gap + 68, panelY + 472, "Hasil scan sudah ditinjau", {
        size: 13,
        fill: C.primary,
        weight: 600,
      }),
      txt(contentX + listW + gap + 68, panelY + 492, "Semua field tetap dapat diedit.", {
        size: 12,
        fill: C.secondary,
        weight: 500,
      }),
      button(
        contentX + listW + gap + 24,
        panelY + 542,
        panelW - 48,
        "Simpan perubahan",
        { iconName: "check" },
      ),
      button(
        contentX + listW + gap + 24,
        panelY + 600,
        panelW - 48,
        "Hapus transaksi",
        { kind: "tertiary", iconName: "trash" },
      ),
      line(
        contentX + listW + gap + 24,
        panelY + 662,
        contentRight - 24,
        panelY + 662,
      ),
      txt(contentX + listW + gap + 24, panelY + 696, "Konteks daftar tetap terlihat", {
        size: 12,
        fill: C.secondary,
        weight: 500,
      }),
    ],
  );
}

function uploadProcessing(width = 1440) {
  const { contentX, contentRight, contentWidth } = layout(width);
  const gap = 24;
  const colW = (contentWidth - gap) / 2;
  const progressY = 146;
  const panelY = 208;
  const panelH = 748;
  const leftX = contentX;
  const rightX = contentX + colW + gap;
  return svgDoc(
    width,
    1024,
    "Fintrack AI desktop upload and processing high fidelity CP3 R0",
    [
      pageHeader(
        "Scan struk",
        "Foto belum menjadi transaksi sebelum kamu meninjau dan menyimpannya",
        "Scan struk",
        width,
        { showScan: false },
      ),
      progressStrip(contentX, progressY, contentWidth, 2),
      rect(leftX, panelY, colW, panelH, {
        fill: C.surface,
        stroke: C.border,
        strokeWidth: 1,
        radius: 18,
      }),
      txt(leftX + 28, panelY + 42, "Pilih foto struk", {
        size: 21,
        weight: 600,
        family: DISPLAY,
      }),
      txt(leftX + 28, panelY + 68, "Seluruh struk harus terlihat dan mudah dibaca.", {
        size: 13,
        fill: C.secondary,
        weight: 500,
      }),
      rect(leftX + 28, panelY + 98, colW - 56, 346, {
        fill: C.canvasSubtle,
        stroke: C.border,
        strokeWidth: 1,
        radius: 14,
      }),
      cropFrame(leftX + 48, panelY + 118, colW - 96, 306, C.primary),
      circle(leftX + colW / 2, panelY + 250, 34, {
        fill: C.primarySoft,
      }),
      icon("camera", leftX + colW / 2 - 14, panelY + 236, 28, {
        color: C.primary,
      }),
      txt(leftX + colW / 2, panelY + 310, "Tarik foto ke sini atau pilih dari perangkat", {
        size: 14,
        weight: 600,
        anchor: "middle",
      }),
      txt(leftX + colW / 2, panelY + 334, "JPG, PNG · akan dikompres sebelum upload", {
        size: 12,
        fill: C.secondary,
        weight: 500,
        anchor: "middle",
      }),
      rect(leftX + 28, panelY + 462, colW - 56, 66, {
        fill: C.primarySoft,
        radius: 10,
      }),
      icon("shield-check", leftX + 44, panelY + 485, 18, {
        color: C.primary,
      }),
      ...textLines(
        leftX + 72,
        panelY + 486,
        [
          "Pastikan struk tidak menampilkan nomor kartu",
          "lengkap sebelum upload.",
        ],
        { size: 12, fill: C.primary, weight: 600, lineHeight: 18 },
      ),
      button(leftX + 28, panelY + 552, (colW - 68) / 2, "Ambil foto", {
        iconName: "camera",
      }),
      button(
        leftX + 40 + (colW - 68) / 2,
        panelY + 552,
        (colW - 68) / 2,
        "Pilih perangkat",
        { kind: "secondary", iconName: "upload-simple" },
      ),
      labelText(leftX + 28, panelY + 640, "Urutan proses"),
      txt(leftX + 28, panelY + 675, "Pilih → Kompres → Unggah → Tinjau → Simpan", {
        size: 13,
        fill: C.secondary,
        weight: 500,
      }),
      rect(leftX + 28, panelY + 704, colW - 56, 28, {
        fill: C.canvas,
        radius: 8,
      }),
      txt(leftX + 42, panelY + 723, "Belum ada data transaksi yang disimpan.", {
        size: 11,
        fill: C.secondary,
        weight: 500,
      }),
      rect(rightX, panelY, colW, panelH, {
        fill: C.ink,
        radius: 18,
      }),
      txt(rightX + 28, panelY + 42, "Focused inspection", {
        size: 21,
        weight: 600,
        family: DISPLAY,
        fill: C.surface,
      }),
      txt(rightX + 28, panelY + 68, "AI sedang membaca struk—hasil tetap perlu ditinjau.", {
        size: 13,
        fill: C.darkMuted,
        weight: 500,
      }),
      progressStrip(rightX + 28, panelY + 100, colW - 56, 2, true),
      rect(rightX + 28, panelY + 158, colW - 56, 338, {
        fill: C.darkSurface,
        stroke: C.darkBorder,
        strokeWidth: 1,
        radius: 14,
      }),
      cropFrame(rightX + 48, panelY + 178, colW - 96, 298, C.signal),
      receipt(rightX + colW / 2 - 88, panelY + 190, 176, 270, {
        compact: true,
      }),
      line(
        rightX + 62,
        panelY + 340,
        rightX + colW - 62,
        panelY + 340,
        { stroke: C.signal, width: 2 },
      ),
      badge(rightX + colW / 2 - 62, panelY + 448, "Membaca struk", {
        fill: C.signalSoft,
        color: C.signalInk,
        width: 124,
      }),
      statusItem(rightX + 28, panelY + 536, "Foto dikompres", "done", true),
      statusItem(rightX + 28, panelY + 580, "Diunggah dengan aman", "done", true),
      statusItem(
        rightX + 28,
        panelY + 624,
        "Membaca dan mengelompokkan data",
        "active",
        true,
      ),
      txt(rightX + 28, panelY + 696, "Kamu akan meninjau merchant, total, tanggal, dan kategori.", {
        size: 12,
        fill: C.darkMuted,
        weight: 500,
      }),
      txt(rightX + colW - 28, panelY + 724, "Tidak ada persentase palsu.", {
        size: 11,
        fill: C.darkMuted,
        weight: 500,
        anchor: "end",
      }),
      txt(contentRight, 982, "Dark mode berada di dalam tugas scan, bukan menjadi tema aplikasi.", {
        size: 12,
        fill: C.secondary,
        weight: 500,
        anchor: "end",
      }),
    ],
  );
}

function receiptReview(width = 1440) {
  const { contentX, contentWidth } = layout(width);
  const gap = 24;
  const previewW = Math.round(contentWidth * 0.46);
  const formW = contentWidth - previewW - gap;
  const y = 208;
  const h = 748;
  const formX = contentX + previewW + gap;
  const fieldGap = 12;
  const halfW = (formW - 56 - fieldGap) / 2;
  return svgDoc(
    width,
    1024,
    "Fintrack AI desktop receipt review high fidelity CP3 R0",
    [
      pageHeader(
        "Tinjau hasil scan",
        "Bandingkan foto dan hasil ekstraksi sebelum menyimpan",
        "Scan struk",
        width,
        { showScan: false },
      ),
      progressStrip(contentX, 146, contentWidth, 3),
      rect(contentX, y, previewW, h, {
        fill: C.surface,
        stroke: C.border,
        strokeWidth: 1,
        radius: 18,
      }),
      txt(contentX + 28, y + 42, "Preview struk", {
        size: 20,
        weight: 600,
        family: DISPLAY,
      }),
      badge(contentX + previewW - 116, y + 20, "412 KB", {
        fill: C.signalSoft,
        color: C.signalInk,
        width: 88,
        iconName: "check-circle",
      }),
      rect(contentX + 28, y + 78, previewW - 56, 588, {
        fill: C.canvasSubtle,
        stroke: C.border,
        strokeWidth: 1,
        radius: 14,
      }),
      cropFrame(contentX + 50, y + 100, previewW - 100, 544, C.primary),
      receipt(contentX + previewW / 2 - 132, y + 122, 264, 496),
      txt(contentX + 28, y + 706, "Foto telah dikompres sebelum upload.", {
        size: 12,
        fill: C.secondary,
        weight: 500,
      }),
      txt(contentX + previewW - 28, y + 706, "Hanya untuk verifikasi", {
        size: 12,
        fill: C.primary,
        weight: 600,
        anchor: "end",
      }),
      rect(formX, y, formW, h, {
        fill: C.surface,
        stroke: C.border,
        strokeWidth: 1,
        radius: 18,
      }),
      txt(formX + 28, y + 42, "Data transaksi", {
        size: 20,
        weight: 600,
        family: DISPLAY,
      }),
      badge(formX + formW - 116, y + 20, "AI · Struk", { width: 88 }),
      txt(formX + 28, y + 68, "Semua field dapat diperiksa dan diedit.", {
        size: 12,
        fill: C.secondary,
        weight: 500,
      }),
      field(formX + 28, y + 108, formW - 56, "Merchant", "Superindo"),
      field(formX + 28, y + 184, formW - 56, "Total pengeluaran", "Rp326.500", {
        suffix: "IDR",
      }),
      field(formX + 28, y + 260, halfW, "Tanggal", "12 Jul 2026", {
        iconName: "calendar",
      }),
      field(formX + 28 + halfW + fieldGap, y + 260, halfW, "Kategori", "Belanja", {
        iconName: "tag",
        warning: true,
      }),
      badge(formX + formW - 132, y + 242, "Perlu diperiksa", {
        fill: C.warningSoft,
        color: C.warning,
        width: 104,
      }),
      rect(formX + 28, y + 332, formW - 56, 54, {
        fill: C.canvasSubtle,
        stroke: C.border,
        strokeWidth: 1,
        radius: 10,
      }),
      icon("list-bullets", formX + 44, y + 350, 18, { color: C.primary }),
      txt(formX + 72, y + 365, "5 item terdeteksi", {
        size: 13,
        weight: 600,
      }),
      txt(formX + formW - 48, y + 365, "Buka", {
        size: 13,
        fill: C.primary,
        weight: 600,
        anchor: "end",
      }),
      rect(formX + 28, y + 404, formW - 56, 74, {
        fill: C.warningSoft,
        radius: 10,
      }),
      icon("warning", formX + 44, y + 426, 20, { color: C.warning }),
      ...textLines(
        formX + 74,
        y + 431,
        [
          "Kategori perlu diperiksa karena beberapa item",
          "tidak terbaca penuh.",
        ],
        { size: 12, fill: C.warning, weight: 500, lineHeight: 18 },
      ),
      field(
        formX + 28,
        y + 514,
        formW - 56,
        "Catatan",
        "Belanja kebutuhan rumah",
        { iconName: "note-pencil" },
      ),
      rect(formX + 28, y + 586, formW - 56, 44, {
        fill: C.primarySoft,
        radius: 10,
      }),
      icon("shield-check", formX + 44, y + 599, 18, { color: C.primary }),
      txt(formX + 72, y + 614, "Data belum disimpan sebagai transaksi.", {
        size: 12,
        fill: C.primary,
        weight: 600,
      }),
      button(formX + 28, y + 654, formW - 56, "Simpan transaksi", {
        iconName: "check",
      }),
      txt(formX + formW / 2, y + 726, "Simpan hanya setelah semua field diperiksa.", {
        size: 11,
        fill: C.secondary,
        weight: 500,
        anchor: "middle",
      }),
    ],
  );
}

function stateBoard(width = 1440) {
  const { contentX, contentRight, contentWidth } = layout(width);
  const gap = 20;
  const y = 146;
  const topH = 112;
  const columnW = (contentWidth - gap * 2) / 3;
  const rowY = 282;
  const rowH = 310;
  const bottomY = 616;
  const bottomH = 340;
  return svgDoc(
    width,
    1024,
    "Fintrack AI desktop app shell and component state board high fidelity CP3 R0",
    [
      pageHeader(
        "App shell & component states",
        "Referensi hierarchy desktop—bukan halaman produksi",
        "Dashboard",
        width,
        { showScan: true },
      ),
      rect(contentX, y, contentWidth, topH, {
        fill: C.surface,
        stroke: C.border,
        strokeWidth: 1,
        radius: 14,
      }),
      labelText(contentX + 24, y + 34, "Shell contract"),
      txt(contentX + 24, y + 68, "Side navigation 240 px", {
        size: 16,
        weight: 600,
      }),
      txt(contentX + 24, y + 92, "Konten tidak mengulang navigation utama.", {
        size: 12,
        fill: C.secondary,
        weight: 500,
      }),
      line(contentX + columnW, y + 20, contentX + columnW, y + topH - 20),
      txt(contentX + columnW + 24, y + 68, "Main content fleksibel", {
        size: 16,
        weight: 600,
      }),
      txt(contentX + columnW + 24, y + 92, "12 kolom · gutter 24 px · padding 32/40 px", {
        size: 12,
        fill: C.secondary,
        weight: 500,
      }),
      line(
        contentX + columnW * 2 + gap,
        y + 20,
        contentX + columnW * 2 + gap,
        y + topH - 20,
      ),
      txt(contentX + columnW * 2 + gap + 24, y + 68, "Satu aksi utama per region", {
        size: 16,
        weight: 600,
      }),
      txt(contentX + columnW * 2 + gap + 24, y + 92, "Scan terlihat tanpa mendominasi shell.", {
        size: 12,
        fill: C.secondary,
        weight: 500,
      }),
      ...["Button states", "Field states", "Badge & status"].map((title, index) => {
        const x = contentX + index * (columnW + gap);
        return [
          rect(x, rowY, columnW, rowH, {
            fill: C.surface,
            stroke: C.border,
            strokeWidth: 1,
            radius: 14,
          }),
          txt(x + 24, rowY + 38, title, {
            size: 18,
            weight: 600,
            family: DISPLAY,
          }),
        ];
      }),
      button(contentX + 24, rowY + 70, columnW - 48, "Primary action", {
        iconName: "check",
      }),
      button(contentX + 24, rowY + 128, columnW - 48, "Secondary action", {
        kind: "secondary",
        iconName: "export",
      }),
      button(contentX + 24, rowY + 186, columnW - 48, "Disabled", {
        disabled: true,
      }),
      rect(contentX + 24, rowY + 246, columnW - 48, 44, {
        fill: C.surface,
        stroke: C.primary,
        strokeWidth: 2,
        radius: 12,
      }),
      txt(contentX + columnW / 2, rowY + 273, "Keyboard focus", {
        size: 14,
        fill: C.primary,
        weight: 600,
        anchor: "middle",
      }),
      field(contentX + columnW + gap + 24, rowY + 82, columnW - 48, "Default", "Superindo"),
      field(
        contentX + columnW + gap + 24,
        rowY + 168,
        columnW - 48,
        "Perlu diperiksa",
        "Belanja",
        { warning: true, iconName: "tag" },
      ),
      field(
        contentX + columnW + gap + 24,
        rowY + 254,
        columnW - 48,
        "Error",
        "Nominal belum diisi",
        { error: true },
      ),
      ...badge(contentX + (columnW + gap) * 2 + 24, rowY + 78, "AI · Struk", {
        width: 88,
      }),
      ...badge(contentX + (columnW + gap) * 2 + 124, rowY + 78, "Offline", {
        fill: C.primarySoft,
        color: C.primary,
        width: 84,
        iconName: "wifi-slash",
      }),
      ...badge(contentX + (columnW + gap) * 2 + 220, rowY + 78, "Selesai", {
        fill: C.signalSoft,
        color: C.signalInk,
        width: 86,
        iconName: "check",
      }),
      ...badge(contentX + (columnW + gap) * 2 + 24, rowY + 124, "Perlu ditinjau", {
        fill: C.warningSoft,
        color: C.warning,
        width: 118,
        iconName: "warning",
      }),
      rect(contentX + (columnW + gap) * 2 + 24, rowY + 178, columnW - 48, 92, {
        fill: C.primarySoft,
        radius: 10,
      }),
      icon("info", contentX + (columnW + gap) * 2 + 42, rowY + 202, 18, {
        color: C.primary,
      }),
      txt(contentX + (columnW + gap) * 2 + 70, rowY + 214, "Status selalu punya label", {
        size: 13,
        fill: C.primary,
        weight: 600,
      }),
      txt(contentX + (columnW + gap) * 2 + 70, rowY + 238, "Warna tidak bekerja sendirian.", {
        size: 12,
        fill: C.secondary,
        weight: 500,
      }),
      rect(contentX, bottomY, contentWidth, bottomH, {
        fill: C.surface,
        stroke: C.border,
        strokeWidth: 1,
        radius: 14,
      }),
      txt(contentX + 24, bottomY + 40, "Transaction row states", {
        size: 18,
        weight: 600,
        family: DISPLAY,
      }),
      transactionRow(
        contentX + 16,
        bottomY + 62,
        contentWidth * 0.58,
        "Superindo",
        "Belanja · AI · Struk",
        "12 Jul 2026",
        "−Rp326.500",
        { color: C.primarySoft, iconName: "storefront", height: 76 },
      ),
      transactionRow(
        contentX + 16,
        bottomY + 142,
        contentWidth * 0.58,
        "Superindo · selected",
        "Belanja · AI · Struk",
        "12 Jul 2026",
        "−Rp326.500",
        {
          selected: true,
          color: C.primarySoft,
          iconName: "storefront",
          height: 76,
        },
      ),
      line(
        contentX + contentWidth * 0.62,
        bottomY + 62,
        contentX + contentWidth * 0.62,
        bottomY + bottomH - 28,
      ),
      labelText(contentX + contentWidth * 0.65, bottomY + 78, "Anti-admin guardrail"),
      ...textLines(
        contentX + contentWidth * 0.65,
        bottomY + 116,
        [
          "• Tidak ada metric-card wall.",
          "• Header tidak mengulang navigation.",
          "• Whitespace membentuk grup.",
          "• Side panel hanya saat konteks dibutuhkan.",
          "• Satu visual utama per area.",
          "• Signal Leaf tetap aksen kecil.",
        ],
        { size: 13, fill: C.secondary, weight: 500, lineHeight: 30 },
      ),
      rect(contentX + 16, bottomY + 238, contentWidth * 0.58, 70, {
        fill: C.canvasSubtle,
        radius: 10,
      }),
      icon("shield-check", contentX + 34, bottomY + 262, 20, {
        color: C.primary,
      }),
      txt(contentX + 64, bottomY + 276, "Komponen mengikuti fungsi; radius dan density tidak diseragamkan.", {
        size: 13,
        fill: C.secondary,
        weight: 500,
      }),
      txt(contentRight, 986, "Design proof board · CP3-R0", {
        size: 12,
        fill: C.secondary,
        weight: 500,
        anchor: "end",
      }),
    ],
  );
}

const frames = [
  {
    number: "11",
    slug: "desktop-dashboard-default-cp3-r0",
    title: "Dashboard — default",
    render: dashboard,
  },
  {
    number: "12",
    slug: "desktop-dashboard-states-cp3-r0",
    title: "Dashboard states",
    render: dashboardStates,
  },
  {
    number: "13",
    slug: "desktop-transactions-detail-cp3-r0",
    title: "Transactions + side panel",
    render: transactions,
  },
  {
    number: "14",
    slug: "desktop-scan-upload-processing-cp3-r0",
    title: "Upload + processing",
    render: uploadProcessing,
  },
  {
    number: "15",
    slug: "desktop-scan-review-cp3-r0",
    title: "Receipt review — two column",
    render: receiptReview,
  },
  {
    number: "16",
    slug: "desktop-app-shell-component-states-cp3-r0",
    title: "App shell + state board",
    render: stateBoard,
  },
];

function layoutStudy() {
  const width = 1600;
  const height = 900;
  const cardW = 480;
  const cardH = 620;
  const startX = 40;
  const gap = 40;
  const titles = [
    ["A · Analytics Grid", "REJECTED", C.errorSoft, C.error],
    ["B · Editorial Ledger", "SELECTED", C.primarySoft, C.primary],
    ["C · Split Workspace", "CONTEXTUAL", C.signalSoft, C.signalInk],
  ];
  const cards = titles.flatMap((item, index) => {
    const x = startX + index * (cardW + gap);
    const selected = index === 1;
    const body = [
      rect(x, 172, cardW, cardH, {
        fill: C.surface,
        stroke: selected ? C.primary : C.border,
        strokeWidth: selected ? 2 : 1,
        radius: 18,
      }),
      txt(x + 24, 214, item[0], {
        size: 21,
        weight: 600,
        family: DISPLAY,
      }),
      badge(x + cardW - 146, 188, item[1], {
        fill: item[2],
        color: item[3],
        width: 122,
      }),
      rect(x + 24, 252, 432, 270, {
        fill: C.canvas,
        stroke: C.border,
        strokeWidth: 1,
        radius: 12,
      }),
      rect(x + 24, 252, 74, 270, { fill: C.ink, radius: 12 }),
      rect(x + 112, 272, 324, 32, { fill: C.surface, radius: 7 }),
    ];
    if (index === 0) {
      body.push(
        ...Array.from({ length: 6 }, (_, idx) =>
          rect(
            x + 112 + (idx % 3) * 104,
            320 + Math.floor(idx / 3) * 92,
            90,
            76,
            { fill: C.surface, stroke: C.border, strokeWidth: 1, radius: 10 },
          ),
        ),
      );
      body.push(
        ...textLines(
          x + 24,
          566,
          [
            "Terlalu banyak metric card.",
            "Hierarchy menjadi datar.",
            "Mudah terasa seperti admin template.",
          ],
          { size: 14, fill: C.secondary, weight: 500, lineHeight: 28 },
        ),
      );
    } else if (index === 1) {
      body.push(
        rect(x + 112, 320, 200, 78, {
          fill: C.surface,
          stroke: C.border,
          strokeWidth: 1,
          radius: 12,
        }),
        rect(x + 324, 320, 112, 78, { fill: C.primarySoft, radius: 12 }),
        rect(x + 112, 414, 202, 88, {
          fill: C.surface,
          stroke: C.border,
          strokeWidth: 1,
          radius: 12,
        }),
        rect(x + 326, 414, 110, 88, {
          fill: C.surface,
          stroke: C.border,
          strokeWidth: 1,
          radius: 12,
        }),
        ...textLines(
          x + 24,
          566,
          [
            "Summary dan insight menjadi anchor.",
            "Whitespace membentuk hierarchy.",
            "Dipakai sebagai pola dashboard.",
          ],
          { size: 14, fill: C.secondary, weight: 500, lineHeight: 28 },
        ),
      );
    } else {
      body.push(
        rect(x + 112, 320, 190, 182, {
          fill: C.surface,
          stroke: C.border,
          strokeWidth: 1,
          radius: 12,
        }),
        rect(x + 314, 320, 122, 182, {
          fill: C.surface,
          stroke: C.primary,
          strokeWidth: 1.5,
          radius: 12,
        }),
        ...textLines(
          x + 24,
          566,
          [
            "Konteks dan detail terlihat bersama.",
            "Dipakai untuk transaksi dan review.",
            "Bukan pola default semua halaman.",
          ],
          { size: 14, fill: C.secondary, weight: 500, lineHeight: 28 },
        ),
      );
    }
    return body;
  });
  return svgDoc(width, height, "Fintrack AI CP3 desktop layout study", [
    txt(40, 62, "CP3-R0 · Desktop Composition Study", {
      size: 36,
      weight: 600,
      family: DISPLAY,
    }),
    txt(40, 96, "Three composition patterns evaluated against Quiet Signal — Refined", {
      size: 15,
      fill: C.secondary,
      weight: 500,
    }),
    ...cards,
    rect(40, 820, 1520, 52, { fill: C.canvasSubtle, radius: 12 }),
    icon("check-circle", 60, 836, 20, { color: C.primary }),
    txt(
      92,
      853,
      "Decision: Editorial Ledger for overview; Split Workspace only where direct comparison improves the task.",
      { size: 14, fill: C.secondary, weight: 600 },
    ),
  ]);
}

function responsiveRulesBoard() {
  const width = 1600;
  const height = 900;
  const items = [
    ["1440 · Wide", 1440, ["240 px sidebar · 40 px padding", "12-column grid"]],
    ["1280 · Desktop", 1280, ["240 px sidebar · 32 px padding", "Content width 976 px"]],
    ["1024 · Compact desktop", 1024, ["Compact rail allowed", "Fewer simultaneous columns"]],
    ["768 · Tablet", 768, ["Compact rail · stacked review", "Never pair bottom nav with sidebar"]],
  ];
  return svgDoc(width, height, "Fintrack AI CP3 responsive rules board", [
    txt(40, 62, "CP3-R0 · Responsive Desktop Rules", {
      size: 36,
      weight: 600,
      family: DISPLAY,
    }),
    txt(40, 96, "Layout changes before typography is reduced", {
      size: 15,
      fill: C.secondary,
      weight: 500,
    }),
    ...items.flatMap((item, index) => {
      const y = 154 + index * 162;
      const diagramX = 360;
      const diagramW = 770 - index * 74;
      const railW = index < 2 ? 126 : 76;
      return [
        txt(40, y + 34, item[0], {
          size: 20,
          weight: 600,
          family: DISPLAY,
        }),
        ...textLines(40, y + 58, item[2], {
          size: 13,
          fill: C.secondary,
          weight: 500,
          lineHeight: 20,
        }),
        rect(diagramX, y, diagramW, 118, {
          fill: C.surface,
          stroke: C.border,
          strokeWidth: 1,
          radius: 12,
        }),
        rect(diagramX, y, railW, 118, { fill: C.ink, radius: 12 }),
        rect(diagramX + railW + 18, y + 18, diagramW - railW - 36, 22, {
          fill: C.canvas,
          radius: 5,
        }),
        rect(
          diagramX + railW + 18,
          y + 54,
          (diagramW - railW - 48) * (index < 2 ? 0.62 : 1),
          46,
          { fill: C.primarySoft, radius: 8 },
        ),
        index < 2
          ? rect(
              diagramX + railW + 30 + (diagramW - railW - 48) * 0.62,
              y + 54,
              (diagramW - railW - 48) * 0.38 - 12,
              46,
              { fill: C.canvasSubtle, radius: 8 },
            )
          : "",
        badge(1220, y + 22, index < 2 ? "FULL SIDEBAR" : "COMPACT RAIL", {
          fill: index < 2 ? C.primarySoft : C.signalSoft,
          color: index < 2 ? C.primary : C.signalInk,
          width: 132,
        }),
      ];
    }),
    rect(40, 814, 1520, 58, { fill: C.canvasSubtle, radius: 12 }),
    icon("info", 62, 832, 20, { color: C.primary }),
    txt(
      94,
      850,
      "Tablet receipt review stacks preview above form; transaction detail becomes a focused page or wide sheet.",
      { size: 14, fill: C.secondary, weight: 600 },
    ),
  ]);
}

function contactSheet(renderedFrames) {
  const width = 1600;
  const height = 1000;
  const columns = 3;
  const cellW = 510;
  const cellH = 400;
  const scale = 0.292;
  return svgDoc(width, height, "Fintrack AI CP3 R0 desktop contact sheet", [
    txt(40, 58, "Fintrack AI · CP3-R0 Desktop", {
      size: 36,
      weight: 600,
      family: DISPLAY,
    }),
    txt(40, 92, "Quiet Signal — Refined · desktop-native adaptation · 1440 × 1024", {
      size: 15,
      fill: C.secondary,
      weight: 500,
    }),
    ...badge(1404, 42, "FINAL / LOCKED", {
      fill: C.primarySoft,
      color: C.primary,
      width: 156,
    }),
    ...renderedFrames.flatMap((frame, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = 40 + col * cellW;
      const y = 132 + row * cellH;
      return [
        txt(x, y + 18, `${frame.number} · ${frame.title}`, {
          size: 14,
          weight: 600,
        }),
        rect(x + 18, y + 46, 1440 * scale + 12, 1024 * scale + 12, {
          fill: C.surface,
          stroke: C.border,
          strokeWidth: 1,
          radius: 10,
        }),
        `<g transform="translate(${x + 24} ${y + 52}) scale(${scale})">${innerSvg(frame.svg)}</g>`,
      ];
    }),
    txt(40, 972, "Six proof frames · comparison boards are documented as design artifacts, not production pages.", {
      size: 12,
      fill: C.secondary,
      weight: 500,
    }),
  ]);
}

function spotcheckBoard(items) {
  const width = 1450;
  const height = 560;
  const scale = 0.31;
  return svgDoc(width, height, "Fintrack AI CP3 1280 pixel spot check", [
    txt(40, 58, "CP3-R0 · 1280 px Spot-check", {
      size: 34,
      weight: 600,
      family: DISPLAY,
    }),
    txt(40, 90, "Sidebar remains 240 px · content width 976 px · typography retained", {
      size: 14,
      fill: C.secondary,
      weight: 500,
    }),
    ...items.flatMap((item, index) => {
      const x = 40 + index * 470;
      return [
        txt(x, 134, item.title, { size: 14, weight: 600 }),
        rect(x + 8, 154, 1280 * scale + 10, 1024 * scale + 10, {
          fill: C.surface,
          stroke: C.border,
          strokeWidth: 1,
          radius: 10,
        }),
        `<g transform="translate(${x + 13} 159) scale(${scale})">${innerSvg(item.svg)}</g>`,
      ];
    }),
    rect(40, 510, 1370, 30, { fill: C.canvasSubtle, radius: 8 }),
    txt(56, 530, "No font-size reduction · split ratios adjust before content becomes cramped.", {
      size: 12,
      fill: C.secondary,
      weight: 600,
    }),
  ]);
}

const generated = [];
const renderedFrames = [];
for (const frame of frames) {
  const svg = frame.render(1440);
  const paths = await writeSvgAndPng(
    path.join(DESKTOP_DIR, frame.slug),
    svg,
  );
  generated.push(...paths);
  renderedFrames.push({ ...frame, svg });
}

const spotDefinitions = [
  ["dashboard-1280-px-cp3-r0", "Dashboard · 1280 px", dashboard],
  ["transactions-1280-px-cp3-r0", "Transactions · 1280 px", transactions],
  ["review-1280-px-cp3-r0", "Review · 1280 px", receiptReview],
];
const renderedSpots = [];
for (const [slug, title, render] of spotDefinitions) {
  const svg = render(1280);
  const paths = await writeSvgAndPng(path.join(TESTS_DIR, slug), svg);
  generated.push(...paths);
  renderedSpots.push({ slug, title, svg });
}

for (const [name, svg] of [
  ["CP3_R0_DESKTOP_CONTACT_SHEET", contactSheet(renderedFrames)],
  ["CP3_R0_DESKTOP_LAYOUT_STUDY", layoutStudy()],
  ["CP3_R0_RESPONSIVE_RULES", responsiveRulesBoard()],
  ["CP3_R0_1280_SPOTCHECK", spotcheckBoard(renderedSpots)],
]) {
  generated.push(...(await writeSvgAndPng(path.join(ROOT, name), svg)));
}

const tokens = {
  checkpoint: "CP3-R0",
  direction: "Quiet Signal — Refined",
  status: "Final / Locked",
  viewport: {
    primary: { width: 1440, height: 1024 },
    spotcheck: { width: 1280, height: 1024 },
    sidebarWidth: 240,
    desktopPadding: 32,
    widePadding: 40,
    gridColumns: 12,
    gutter: 24,
    minimumControlHeight: 44,
  },
  composition: {
    primary: "Editorial Ledger",
    contextual: "Split Workspace",
    rejected: "Analytics Grid",
  },
  dashboard: {
    topRatio: "64/36",
    lowerRatio: "64/36",
    metricCardWall: false,
  },
  responsive: {
    desktop: "Full sidebar and controlled multi-column layout",
    compactDesktop: "Preserve 240px sidebar at 1280; adjust column ratios",
    tablet: "Compact rail; stack receipt preview and form when needed",
    prohibition: "Never show full sidebar and bottom navigation together",
  },
  inheritedFrom: "../local-cp2/cp2-ui-tokens.json",
  logo: {
    revision: "LOGO-R1",
    sidebarAsset:
      "../logo-r1/assets/lockups/fintrack-ai-lockup-compact-reverse.svg",
  },
};
const tokenPath = path.join(ROOT, "cp3-ui-tokens.json");
await fs.writeFile(tokenPath, `${JSON.stringify(tokens, null, 2)}\n`, "utf8");
generated.push(tokenPath);

const manifest = {
  project: "Fintrack AI",
  checkpoint: "CP3",
  revision: "R0",
  direction: "Quiet Signal — Refined",
  status: "Final / Locked",
  generatedAt: "2026-07-29",
  sourceHierarchy: "../local-cp1/CONTENT_HIERARCHY.md",
  responsiveNotes: "../local-cp1/RESPONSIVE_NOTES.md",
  mobileFinalLock: "../local-cp2/CP2_R0_FINAL_LOCK.md",
  designSystem: "../../DESIGN_SYSTEM.md",
  logo: "../logo-r1/LOGO_R1_FINAL_LOCK.md",
  viewports: {
    primary: "1440x1024",
    spotcheck: "1280x1024",
  },
  frames: frames.map((frame) => ({
    number: frame.number,
    title: frame.title,
    svg: `desktop/${frame.slug}.svg`,
    png: `desktop/${frame.slug}.png`,
  })),
  spotchecks: spotDefinitions.map(([slug, title]) => ({
    title,
    svg: `tests/${slug}.svg`,
    png: `tests/${slug}.png`,
  })),
  reviewBoards: [
    "CP3_R0_DESKTOP_CONTACT_SHEET.svg",
    "CP3_R0_DESKTOP_CONTACT_SHEET.png",
    "CP3_R0_DESKTOP_LAYOUT_STUDY.svg",
    "CP3_R0_DESKTOP_LAYOUT_STUDY.png",
    "CP3_R0_RESPONSIVE_RULES.svg",
    "CP3_R0_RESPONSIVE_RULES.png",
    "CP3_R0_1280_SPOTCHECK.svg",
    "CP3_R0_1280_SPOTCHECK.png",
  ],
  documentation: [
    "README.md",
    "CP3_R0_SPEC.md",
    "CP3_R0_FINAL_LOCK.md",
    "review-notes/CP3_R0_SELF_CRITIQUE.md",
    "review-notes/CP3_R0_REVISION_NOTES.md",
  ],
  finalLock: "CP3_R0_FINAL_LOCK.md",
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
      spotchecks: spotDefinitions.length,
      generatedFiles: manifest.generatedFiles.length,
      manifest: manifestPath,
    },
    null,
    2,
  ),
);
