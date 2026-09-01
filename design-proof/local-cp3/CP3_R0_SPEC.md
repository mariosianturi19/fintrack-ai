# Fintrack AI — CP3-R0 Desktop Adaptation Specification

Status: **FINAL / LOCKED**  
Date: **2026-07-29**  
Confirmed by: **Mario Sianturi**  
Input terkunci: **CP1-R1**, **CP2-R0**, **LOGO-R1**, dan
**Quiet Signal — Refined**

## Tujuan

CP3-R0 membuktikan bahwa Fintrack AI dapat memanfaatkan ruang desktop tanpa:

- menjadi mobile yang hanya diperbesar;
- berubah menjadi admin dashboard padat;
- membentuk metric-card wall;
- membuat AI terlihat futuristik atau magis;
- mengorbankan hierarchy mobile yang sudah dikunci.

## Studi komposisi

Tiga pola diuji:

| Pola | Keputusan | Alasan |
|---|---|---|
| Analytics Grid | Ditolak | Terlalu banyak metric card, hierarchy datar, dan mudah terlihat seperti admin template |
| Editorial Ledger | Dipilih | Summary dan insight menjadi anchor; whitespace membentuk hierarchy |
| Split Workspace | Kontekstual | Tepat untuk transaksi dan receipt review yang membutuhkan perbandingan langsung |

Keputusan akhir:

- **Editorial Ledger** menjadi pola utama dashboard.
- **Split Workspace** dipakai hanya untuk transaksi, upload/processing, dan
  receipt review.
- Tidak ada satu template grid yang dipaksakan ke semua halaman.

## App shell desktop

- Sidebar: `240 px`.
- Sidebar memakai Midnight dengan LOGO-R1 reverse.
- Navigation: Dashboard, Transaksi, Scan struk, dan Profil.
- Active state memakai perubahan surface, icon weight, label, dan Signal Leaf
  rail kecil.
- Header berisi page context dan contextual action; navigation tidak diulang.
- Wide padding: `40 px`.
- Desktop padding `1280 px`: `32 px`.
- Grid: 12 kolom dengan gutter `24 px`.

## Enam frame utama

| No. | Frame | Adaptasi desktop yang dibuktikan |
|---|---|---|
| 11 | Dashboard — default | Summary/insight sejajar; chart dan latest transactions berbagi grid |
| 12 | Dashboard states | Loading, empty, dan offline dibandingkan tanpa kehilangan structure |
| 13 | Transactions + side panel | List/table hybrid dan persistent detail panel |
| 14 | Upload + processing | Upload light panel dan focused inspection dark panel berada dalam satu flow |
| 15 | Receipt review | Preview kiri dan editable extracted fields kanan |
| 16 | App shell + state board | Navigation, buttons, fields, badges, rows, dan anti-admin guardrails |

Frame 12 dan 16 adalah comparison/design-system artifacts, bukan halaman
runtime yang menampilkan seluruh state sekaligus.

## Dashboard

### Struktur

- Top region memakai rasio sekitar `64/36`.
- Total bulanan dan pengeluaran mingguan berada dalam satu summary region,
  bukan beberapa KPI card.
- Insight mempunyai surface lembut dan tracking rail.
- Lower region memakai rasio sekitar `64/36`.
- Distribusi kategori memakai stacked summary dan horizontal comparison bars.
- Latest transactions tetap ringkas dan tidak menjadi tabel admin.

### Chart

- Tidak ada donut 3D, gradient, glow, atau animation gimmick.
- Warna kategori mengikuti token CP2/design system.
- Label dan nominal tertulis; informasi tidak bergantung pada warna.
- Ringkasan teks menjelaskan kategori terbesar.

## Transactions + side panel

- Search dan filter berada di atas konteks list.
- Merchant/sumber, tanggal, dan nominal mempunyai alignment terpisah.
- Selected row memakai background, border, dan persistent side panel.
- Panel tidak menutup daftar.
- Semua field dapat diedit.
- Delete tetap terpisah dari primary save action.
- Pada `1280 px`, list tetap sekitar `596 px` dan panel sekitar `356 px`.

## Scan dan receipt review

- Focused inspection tetap menjadi dark **panel**, bukan dark theme aplikasi.
- Empat tahap tetap sama dengan mobile:
  `Foto → Persiapan → Pemeriksaan AI → Tinjau`.
- Tidak ada persentase atau confidence palsu.
- Receipt preview dan extracted data dapat dibandingkan tanpa berpindah layar.
- Tips privasi tetap terlihat sebelum upload.
- Semua field AI dapat diedit.
- Copy final tetap “Simpan transaksi”.

## Responsive behavior

### 1440 px

- Full sidebar `240 px`.
- Padding `40 px`.
- Layout multi-column penuh.

### 1280 px

- Full sidebar tetap `240 px`.
- Padding menjadi `32 px`.
- Content width efektif `976 px`.
- Rasio kolom menyesuaikan sebelum ukuran font diturunkan.
- Tanggal pada latest transaction dashboard dipindahkan ke metadata untuk
  mencegah collision.

### 1024 px

- Compact rail diperbolehkan.
- Jumlah kolom simultan dikurangi.
- Detail dapat berpindah menjadi focused view.

### Tablet 768–1023 px

- Compact rail.
- Receipt preview dapat berpindah di atas form.
- Transaction detail menjadi focused page atau wide sheet.
- Full sidebar dan bottom navigation tidak pernah tampil bersama.

## Accessibility-by-design

- Minimum tinggi control desktop: `44 px`.
- Pasangan warna utama yang digunakan lulus WCAG AA.
- Focus state ditunjukkan melalui 2 px Mineral Blue outline.
- Status memakai ikon dan label, bukan warna saja.
- Chart mempunyai label serta summary text.
- Nominal memakai tabular numerals.
- Struktur heading, focus trap, screen-reader state announcements, dan runtime
  keyboard order tetap dibuktikan pada CP4/implementasi.

## QA result

- 6 SVG + 6 PNG utama: `1440 × 1024`.
- 3 SVG + 3 PNG spot-check: `1280 × 1024`.
- 4 review boards dalam SVG dan PNG.
- Font target dan LOGO-R1 tertanam.
- Light-first root canvas: lulus.
- Focused inspection contextual: lulus.
- Signal Leaf maksimum 5% exact-color pixels: lulus pada seluruh frame.
- Fake AI progress: tidak ditemukan.
- Anti-gradient/glass/filter: lulus.
- Automated verification: **PASS — 106/106**.
- Shared renderer dependency audit: **0 vulnerability** pada final CP2 audit.

## Keputusan design-system

CP3-R0 tidak menemukan konflik terukur dengan `DESIGN_SYSTEM.md`. Karena itu
dokumen design system belum diubah. Layout study dan responsive values disimpan
sebagai proof token CP3 hingga checkpoint dikonfirmasi.

## Keputusan final dan governance

- Editorial Ledger diterima sebagai basis dashboard desktop.
- Split Workspace diterima sebagai pola kontekstual, bukan template untuk
  seluruh halaman.
- Perilaku `1440 px` dan `1280 px` diterima sebagai proof desktop CP3.
- Perilaku `1024 px` / tablet, focus runtime, motion, dan state transition tetap
  diteruskan ke CP4, CP5, serta implementasi.
- CP3-R0 hanya direvisi jika checkpoint berikutnya menemukan masalah terukur.
