# CP5-R0 Applied Design System Delta

Status: **APPLIED — DESIGN_SYSTEM.md v1.2**

Tidak ada perubahan arah, core color, typeface, logo geometry, hierarchy, atau
interaction architecture.

Delta yang disetujui dan diterapkan setelah owner review:

## 1. Tambahkan overflow and intrinsic-sizing contract

- Semua flex/grid child yang dapat menyusut memakai `min-width: 0`.
- Badge menggunakan intrinsic width dan padding, bukan satu fixed width untuk
  semua copy.
- Critical action label tidak boleh terpotong.
- Text container menggunakan `min-height` ketika text scaling mungkin
  menambah baris.

## 2. Tambahkan dashboard weekly-summary correction

- Visual compact label: `Minggu ini`.
- Accessible context: “Pengeluaran minggu ini”.
- Right subcolumn: `minmax(176px, 0.36fr)`.
- Subcolumn stack jika minimum width tidak tersedia.

## 3. Tegaskan runtime text floor

- Critical metadata minimum `12px`.
- Navigation label minimum `11px`.
- `10px` hanya untuk non-critical chrome atau annotation.

## 4. Tegaskan desktop source of truth

- Sidebar implementation token: `240px`.
- `280px` pada logo context-test board bukan runtime token.
- CP4 upload-ready dan processing frames mengalahkan CP3 comparison board.

## 5. Tambahkan implementation QA viewports

- `360`, `390`, `768`, `1024`, `1280`, dan `1440px`.
- Browser zoom `200%`.
- Mobile text scaling.

## 6. Ubah status source artifact

- Generator SVG lokal, token, final locks, dan local exports menjadi source
  handoff yang dapat diverifikasi.
- Figma tetap dapat dipakai kembali bila koneksi tersedia, tetapi tidak boleh
  disebut satu-satunya editable source pada kondisi saat ini.

Delta diterapkan ke `DESIGN_SYSTEM.md` versi `1.2` setelah CP5-R0 dikonfirmasi
final oleh owner pada 2026-07-29.
