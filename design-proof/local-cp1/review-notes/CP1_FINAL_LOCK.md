# CP1 Final Lock

## Status

- Checkpoint: **CP1 — Content Hierarchy & Low-fidelity**.
- Revision: **R1 — hierarchy audit corrections**.
- Final status: **LOCKED / FINAL**.
- Dikonfirmasi oleh: Mario Sianturi.
- Tanggal: 29 Juli 2026.
- Arah desain: Quiet Signal — Refined.

## Keputusan yang dikunci

- Dashboard mobile: periode → total → aksi → insight → kategori → transaksi terbaru.
- Mobile navigation: Dashboard, Transaksi, Scan, dan Profil.
- Scan: `1 Foto → 2 Persiapan → 3 Pemeriksaan AI → 4 Tinjau`.
- Setelah simpan: kembali ke Dashboard, tampilkan feedback sukses, dan letakkan transaksi baru di urutan teratas.
- AI processing tidak memakai persentase atau confidence palsu.
- Semua hasil AI dapat diperiksa dan dikoreksi.
- Fallback AI mempertahankan konteks foto dan menyediakan input manual.
- Edit transaksi memakai halaman terfokus pada mobile dan side panel pada desktop.
- Hapus transaksi dan hapus akun memakai tingkat friction yang berbeda.
- Dashboard desktop mempertahankan whitespace dan tidak memakai filler metrics.

## Change policy

CP2–CP5 boleh menyempurnakan warna, typography, spacing, icon, radius, motion, dan fidelity.

Perubahan terhadap hierarchy atau flow yang dikunci di atas membutuhkan revision baru dan persetujuan eksplisit. Perubahan tidak boleh dilakukan diam-diam ketika masuk high-fidelity.

## Keterbatasan yang tetap dicatat

- Sumber kerja CP1 masih fallback lokal, belum Figma-native.
- Font final belum dirender.
- Prototype interaktif belum dibuat.
- Accessibility runtime baru dapat dibuktikan saat implementasi web.
- Device test fisik dan user test belum dilakukan.

