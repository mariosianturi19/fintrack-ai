# Fintrack AI — CP4-R0 States & Prototype

Status: **FINAL / LOCKED**  
Direction: **Quiet Signal — Refined**  
Primary prototype: mobile `390 × 844` dan desktop `1440 × 1024`

CP4-R0 melengkapi state, recovery path, focus behavior, dan motion contract
yang sengaja diteruskan dari CP2/CP3. Fondasi visual, layout utama, serta
LOGO-R1 tidak diubah.

## Mulai review

1. Buka `CP4_R0_INTERACTION_STRATEGY.png`.
2. Buka `CP4_R0_SCAN_FLOW.png` dan `CP4_R0_CORRECTION_FLOW.png`.
3. Buka `CP4_R0_STATE_INVENTORY.png`.
4. Buka `CP4_R0_STATE_CONTACT_SHEET.png`.
5. Jalankan prototype lokal dari `prototype/index.html`.
6. Baca `review-notes/CP4_R0_SELF_CRITIQUE.md`.

## Isi folder

```text
local-cp4/
├── CP4_R0_INTERACTION_STRATEGY.svg/.png
├── CP4_R0_STATE_INVENTORY.svg/.png
├── CP4_R0_SCAN_FLOW.svg/.png
├── CP4_R0_CORRECTION_FLOW.svg/.png
├── CP4_R0_FOCUS_MOTION.svg/.png
├── CP4_R0_RESPONSIVE_STATES.svg/.png
├── CP4_R0_STATE_CONTACT_SHEET.svg/.png
├── CP4_R0_SPEC.md
├── CP4_R0_FINAL_LOCK.md
├── cp4-interaction-model.json
├── manifest.json
├── states/
│   ├── mobile/
│   └── desktop/
├── prototype/
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── README.md
├── review-notes/
│   ├── CP4_R0_SELF_CRITIQUE.md
│   ├── CP4_R0_BROWSER_QA.md
│   └── verification-report.json
└── tooling/
    ├── generate-cp4.mjs
    ├── verify-cp4.mjs
    └── serve-prototype.mjs
```

## Prototype

Prototype menghubungkan:

1. Dashboard → Scan struk → Upload → Processing → Review → Simpan.
2. Transaksi → Detail → Koreksi kategori → Simpan.

Recovery test yang dapat dipanggil:

- Offline.
- Upload gagal.
- AI quota/rate limit.
- Simpan gagal.
- Destructive confirmation.

Async state tidak menggunakan timer. Tombol simulator di luar app frame
mewakili respons backend/AI yang sebenarnya.

```powershell
node .\design-proof\local-cp4\tooling\serve-prototype.mjs
```

Kemudian buka:

```text
http://127.0.0.1:4174/design-proof/local-cp4/prototype/
```

## Reproduksi dan verifikasi

```powershell
node .\design-proof\local-cp4\tooling\generate-cp4.mjs
node .\design-proof\local-cp4\tooling\verify-cp4.mjs
```

Hasil verifikasi final R0: **PASS — 221/221**. Browser QA: **PASS**, tanpa
console error.

## Batas checkpoint

- Prototype adalah proof desain interaksi, bukan aplikasi produksi.
- Tidak ada backend, upload, AI, database, atau mutation nyata.
- Hotspot memiliki focus order untuk proof; semantic HTML final, focus trap
  runtime, screen reader announcement, dan browser text scaling diaudit lagi
  pada CP5/implementasi.
- CP4-R0 dikunci setelah konfirmasi eksplisit pemilik project pada
  `2026-07-29`.
- Known precision items dari review pemilik diteruskan ke CP5 dan dicatat
  dalam `CP4_R0_FINAL_LOCK.md`.
