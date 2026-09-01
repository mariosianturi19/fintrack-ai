# Fintrack AI — CP2-R0 High-Fidelity Mobile

Status: **FINAL / LOCKED**  
Direction: **Quiet Signal — Refined**  
Viewport utama: `390 × 844`  
Spot-check: `360 × 844`

CP2-R0 menerjemahkan hierarchy CP1-R1 dan LOGO-R1 ke visual mobile
high-fidelity. Semua artefak berada di dalam folder project Fintrack AI.

## Mulai review

1. Buka `CP2_R0_MOBILE_CONTACT_SHEET.png` untuk melihat 10 frame bersama-sama.
2. Buka `CP2_R0_VISUAL_FOUNDATION.png` untuk menilai tipografi, warna,
   komponen, dan restraint motif.
3. Buka `CP2_R0_360_SPOTCHECK.png` untuk memeriksa perilaku pada lebar sempit.
4. Baca `review-notes/CP2_R0_SELF_CRITIQUE.md` sebelum memberikan keputusan.

## Isi folder

```text
local-cp2/
├── CP2_R0_MOBILE_CONTACT_SHEET.svg/.png
├── CP2_R0_VISUAL_FOUNDATION.svg/.png
├── CP2_R0_360_SPOTCHECK.svg/.png
├── CP2_R0_SPEC.md
├── cp2-ui-tokens.json
├── manifest.json
├── mobile/                 # 10 frame utama, SVG dan PNG
├── tests/                  # 3 frame spot-check 360 px
├── review-notes/
│   ├── CP2_R0_SELF_CRITIQUE.md
│   └── verification-report.json
├── tooling/
│   ├── generate-cp2.mjs
│   └── verify-cp2.mjs
└── tooling-runtime/        # dependency render lokal yang terkunci
```

## Reproduksi dan verifikasi

Jalankan dari root project:

```powershell
node .\design-proof\local-cp2\tooling\generate-cp2.mjs
node .\design-proof\local-cp2\tooling\verify-cp2.mjs
```

Hasil verifikasi saat ini: **PASS — 98/98**.

## Batas checkpoint

- Ini adalah bukti desain statis, bukan aplikasi atau prototype interaktif.
- Desktop dikerjakan pada CP3.
- Flow, focus order, motion, reduced motion, dan prototype dikerjakan pada CP4.
- Runtime accessibility dan browser behavior divalidasi kembali saat
  pengembangan web.
- Figma tidak menjadi source aktif pada R0 karena akses edit melalui connector
  tidak tersedia. SVG adalah source lokal yang editable dan PNG adalah backup
  review.

CP2-R0 dikunci setelah konfirmasi eksplisit Mario Sianturi pada 2026-07-29.
Perubahan berikutnya hanya dibuat bila CP3, CP4, runtime accessibility, atau
implementasi web membuktikan masalah nyata.
