# CP1 Revision Log

## R1 — 29 Juli 2026

Sumber: audit hierarchy CP1 dan persetujuan pemilik project.

### 1. Tahapan scan

Sebelum:

`Langkah 1 dari 3 → Langkah 2 dari 3 → Langkah 3 dari 3 → review tanpa nomor`

Sesudah:

`1 Foto → 2 Persiapan → 3 Pemeriksaan AI → 4 Tinjau`

Alasan: review adalah bagian penting dari alur dan tidak boleh terlihat sebagai langkah tambahan di luar progres.

### 2. Endpoint setelah simpan

Keputusan:

- Setelah transaksi tersimpan, kembali ke Dashboard.
- Tampilkan pesan eksplisit `Transaksi berhasil disimpan`.
- Letakkan transaksi baru pada urutan teratas.
- Gunakan highlight singkat yang tidak mengandalkan warna saja.

Frame success lengkap tetap dikerjakan pada checkpoint states/prototype.

### 3. Status foto saat AI tidak tersedia

Sebelum: `Aman`.

Sesudah: `Tersedia sementara`.

Alasan: `Aman` terlalu luas dan dapat dibaca sebagai janji keamanan atau privasi.

### 4. Desktop dashboard

Card `Konteks bulan ini` beserta meta-copy desain dihapus.

Alasan: informasi tersebut tidak membantu keputusan utama dan membuat dashboard lebih dekat ke pola filler metrics generik. Whitespace dipertahankan sebagai bagian dari karakter refined.

## Dampak terhadap design system

Tidak ada perubahan pada arah, token, typography, warna, motif, atau responsive foundation. `DESIGN_SYSTEM.md` tetap berlaku tanpa revisi.

