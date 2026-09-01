# CP3-R0 Revision Notes

Status: **FINAL / LOCKED**

Tidak dibuat revision number baru karena koreksi berikut terjadi selama
internal QA R0, sebelum artefak diserahkan untuk owner review.

## Koreksi internal

### 1. Button icon collision

Masalah:

- Ikon pada label panjang seperti “Simpan perubahan” bertabrakan dengan teks.

Perbaikan:

- Icon dan label dihitung sebagai satu centered group.
- Jarak icon-label menjadi konsisten pada control sempit maupun lebar.

### 2. Transaction table header pada 1280 px

Masalah:

- Label `TANGGAL` dan `NOMINAL` terlalu dekat.

Perbaikan:

- Tanggal menggunakan right anchor terpisah.
- Nominal mempertahankan alignment paling kanan.

### 3. Latest transaction metadata pada 1280 px

Masalah:

- Merchant dan relative date saling mendesak pada panel dashboard.

Perbaikan:

- Relative date terpisah hanya pada wide desktop.
- Pada 1280 px, tanggal tetap tersedia dalam metadata tanpa mengecilkan font.

### 4. Tablet rule copy

Masalah:

- Penjelasan tablet terpotong pada responsive board.

Perbaikan:

- Copy dipecah menjadi dua baris dan hierarchy diagram dipertahankan.

## Hasil

Semua koreksi dirender ulang pada frame utama dan spot-check. Verification
setelah final lock: **106/106 PASS**.

Tidak dibuat CP3-R1 karena owner menerima R0 tanpa masalah spesifik yang
memerlukan revisi desain.
