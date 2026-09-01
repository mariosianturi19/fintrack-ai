# CP1 Responsive Notes

## Aturan umum

- Mobile adalah pengalaman utama, bukan desktop yang diperkecil.
- Padding horizontal mobile tetap 16 px; desktop 32 px dan wide desktop 40 px.
- Touch target mobile minimum 44 × 44 px.
- Ukuran teks tidak diperkecil untuk “memaksa muat”; layout yang menyesuaikan.
- Tablet 768–1023 px memakai compact rail atau layout transisi, bukan bottom navigation dan full sidebar sekaligus.

## Perubahan struktur

| Area | Mobile | Desktop |
|---|---|---|
| Navigation | Bottom navigation: Dashboard, Transaksi, Scan, Profil | Sidebar 240 px dengan action scan tetap mudah ditemukan |
| Header | Judul ringkas dan satu contextual action | Judul, konteks periode, dan satu primary action |
| Dashboard | Total → aksi → insight → chart → transaksi | Summary + insight sejajar; chart + transaksi sejajar |
| Transactions | Full-width list, detail menjadi halaman terfokus | List/table hybrid dan detail side panel |
| Upload | Full-screen focused flow | Upload panel dengan panduan di area konten |
| Processing | Navigation direduksi; layar berubah sementara ke Midnight | Dark inspection panel berada dalam flow scan, bukan dark theme aplikasi |
| Receipt review | Preview ringkas → field → konfirmasi | Preview kiri dan field kanan agar mudah dibandingkan |
| Destructive | Centered dialog/halaman terfokus; bukan bottom sheet | Modal terpusat dengan ukuran sesuai risiko |

## Spot-check lebar 360 px

Tidak diperlukan frame lengkap tambahan, tetapi aturan berikut telah ditetapkan:

- Lebar konten efektif menjadi 328 px setelah gutter 16 px.
- Dua action dashboard tetap dua kolom dengan gap 12 px dan lebar fleksibel; label masih muat tanpa memperkecil font.
- Field tanggal/kategori tetap dua kolom selama masing-masing dapat menjaga lebar sekitar 158 px; jika text scaling menyebabkan overflow, berubah menjadi satu kolom.
- Tombol destructive dapat tetap sejajar untuk hapus transaksi; pada text scaling tinggi berubah menjadi stacked.
- Transaction row mempertahankan merchant di kiri dan nominal right-aligned; metadata boleh dipotong satu baris sebelum nominal terdesak.
- Bottom navigation mempertahankan empat label, tidak berubah menjadi icon-only.

## Spot-check lebar 1280 px

- Sidebar tetap 240 px.
- Area konten efektif sekitar 976 px setelah padding 32 px.
- Dashboard memakai rasio sekitar 60/40 untuk summary/insight dan chart/transaksi.
- List transaksi mempertahankan minimum sekitar 580 px; side panel sekitar 360 px.
- Receipt review mempertahankan dua kolom. Jika preview dan form tidak dapat menjaga minimum nyaman, rasio diubah sebelum menurunkan ukuran teks.
- Whitespace berkurang secara terukur; jumlah kartu/metrik tidak ditambah untuk mengisi ruang.

## Tablet

- Sidebar berubah menjadi compact rail.
- Dashboard dapat memakai satu kolom untuk summary/insight dan dua kolom terbatas untuk area yang cukup.
- Receipt review dapat menjadi preview atas dan form bawah.
- Edit transaction dapat memakai halaman terfokus atau sheet lebar, tergantung orientasi.
- Tidak ada frame tablet penuh pada CP1; perilakunya perlu divalidasi pada prototype atau implementasi responsif berikutnya.

