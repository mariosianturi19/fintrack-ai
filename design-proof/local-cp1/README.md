# Fintrack AI — Local Design Proof CP1

## Status

- Checkpoint: **CP1 — content hierarchy dan low-fidelity**.
- Arah: **Quiet Signal — Refined**.
- Prinsip: *Precision Without Anxiety — intelligent financial clarity, presented with restraint.*
- Tanggal: 29 Juli 2026.
- Revisi: **R1 — koreksi hasil audit hierarchy**.
- Approval: **CP1 FINAL — dikonfirmasi Mario Sianturi pada 29 Juli 2026**.
- Status sumber: **fallback lokal yang editable; belum menjadi file Figma-native**.

Artefak ini memvalidasi susunan informasi, pola navigasi, state, dan perbedaan perilaku mobile–desktop. Artefak ini belum memvalidasi polish high-fidelity, motion, prototype interaktif, atau typography rendering final.

## Artefak utama

- `contact-sheet-mobile-cp1.png` dan `.svg` — ringkasan 10 frame mobile.
- `contact-sheet-desktop-cp1.png` dan `.svg` — ringkasan 6 frame desktop.
- `mobile/` — setiap frame mobile dalam PNG dan SVG editable.
- `desktop/` — setiap frame desktop dalam PNG dan SVG editable.
- `CONTENT_HIERARCHY.md` — tujuan dan hierarchy tiap frame.
- `RESPONSIVE_NOTES.md` — perubahan layout antar-breakpoint.
- `review-notes/CP1_SELF_CRITIQUE.md` — evaluasi anti-generic dan batas validasi.
- `manifest.json` — indeks nama serta lokasi semua frame.

## Urutan review yang disarankan

1. Buka contact sheet mobile dan periksa apakah tugas utama setiap layar terbaca dalam sekitar lima detik.
2. Periksa alur `Dashboard → Foto → Persiapan → Pemeriksaan AI → Tinjau → Simpan`.
3. Periksa alur `Transaksi → Detail → Koreksi → Simpan`.
4. Buka contact sheet desktop dan periksa apakah layout terasa sebagai adaptasi, bukan mobile yang diperbesar.
5. Pastikan endpoint setelah simpan kembali ke Dashboard dengan feedback sukses dan transaksi baru di urutan teratas.

## Guardrail CP1

- Warna dipakai secara terbatas untuk menunjukkan hierarchy dan semantic state, bukan sebagai bukti polish final.
- Focused inspection mode hanya gelap ketika struk sedang diproses.
- Tidak ada persentase progres atau confidence AI yang dibuat-buat.
- Semua hasil AI tetap dapat diedit.
- Warm Coral menandai pengeluaran; error memakai Error Red.
- Signal Leaf hanya muncul sebagai sinyal kecil untuk progres/sukses.
- Tidak ada gradient AI, glassmorphism, glow, particle, atau pola dashboard crypto/admin.

## Catatan typography

SVG menyimpan referensi `Space Grotesk` dan `IBM Plex Sans`. Kedua font belum terpasang pada environment raster lokal, sehingga preview PNG memakai fallback Arial. Typography final baru boleh dinilai setelah font target tersedia atau di-embed pada CP2.

## Sumber generator

`tooling/generate-cp1.mjs` hanya tooling desain untuk menghasilkan SVG dan preview PNG. File ini bukan kode aplikasi atau implementasi produksi Fintrack AI.
