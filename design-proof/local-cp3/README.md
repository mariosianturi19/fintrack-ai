# Fintrack AI — CP3-R0 Desktop Adaptation

Status: **FINAL / LOCKED**  
Direction: **Quiet Signal — Refined**  
Viewport utama: `1440 × 1024`  
Spot-check: `1280 × 1024`

CP3-R0 mengadaptasi hierarchy CP1-R1 dan visual mobile CP2-R0 ke desktop.
Desktop tidak dibuat dengan memperbesar mobile; navigation, composition,
parallel context, dan pola detail berubah sesuai konteks layar.

## Mulai review

1. Buka `CP3_R0_DESKTOP_LAYOUT_STUDY.png` untuk memahami keputusan komposisi.
2. Buka `CP3_R0_DESKTOP_CONTACT_SHEET.png` untuk melihat enam frame bersama.
3. Buka `CP3_R0_1280_SPOTCHECK.png` untuk menilai desktop yang lebih sempit.
4. Buka `CP3_R0_RESPONSIVE_RULES.png` untuk aturan compact desktop dan tablet.
5. Baca `review-notes/CP3_R0_SELF_CRITIQUE.md`.

## Isi folder

```text
local-cp3/
├── CP3_R0_DESKTOP_CONTACT_SHEET.svg/.png
├── CP3_R0_DESKTOP_LAYOUT_STUDY.svg/.png
├── CP3_R0_RESPONSIVE_RULES.svg/.png
├── CP3_R0_1280_SPOTCHECK.svg/.png
├── CP3_R0_SPEC.md
├── CP3_R0_FINAL_LOCK.md
├── cp3-ui-tokens.json
├── manifest.json
├── desktop/                # 6 frame utama, SVG dan PNG
├── tests/                  # 3 frame spot-check 1280 px
├── review-notes/
│   ├── CP3_R0_SELF_CRITIQUE.md
│   ├── CP3_R0_REVISION_NOTES.md
│   └── verification-report.json
└── tooling/
    ├── design-core.mjs
    ├── generate-cp3.mjs
    └── verify-cp3.mjs
```

## Reproduksi dan verifikasi

Renderer memakai dependency lokal terkunci milik CP2 agar font, ikon, dan
Sharp tidak diduplikasi.

```powershell
node .\design-proof\local-cp3\tooling\generate-cp3.mjs
node .\design-proof\local-cp3\tooling\verify-cp3.mjs
```

Hasil verifikasi saat ini: **PASS — 106/106**.

## Batas checkpoint

- Ini adalah proof statis, bukan aplikasi atau prototype interaktif.
- Frame dashboard states dan component board adalah comparison artifacts.
- Runtime state transition, side-panel focus behavior, keyboard flow, dan
  motion dikerjakan pada CP4.
- Screen reader semantics dan browser text scaling divalidasi kembali pada
  implementasi/CP5.
- Figma tidak menjadi source aktif karena connector belum menyediakan akses
  edit; SVG lokal menjadi source editable dan PNG menjadi review backup.

CP3-R0 dikonfirmasi final oleh Mario Sianturi pada 2026-07-29. Perubahan
setelah lock hanya dibuat jika CP4, CP5, atau implementasi menemukan masalah
yang dapat dibuktikan.
