# CP1 Content Hierarchy

## Prinsip hierarchy

1. Tugas utama dan konteks periode harus terbaca sebelum detail.
2. Nominal utama memiliki hierarchy kuat, tetapi selalu disertai konteks.
3. AI dijelaskan sebagai urutan proses yang dapat ditinjau, bukan “keajaiban”.
4. Status memiliki label dan copy; warna tidak bekerja sendirian.
5. Mobile membatasi informasi awal agar tidak melelahkan.
6. Desktop memanfaatkan ruang untuk konteks paralel tanpa berubah menjadi tabel admin padat.

## Mobile — 390 × 844

| Frame | Tugas yang harus terbaca cepat | Urutan informasi utama |
|---|---|---|
| 01 Dashboard default | Memahami total bulan ini dan mencatat transaksi | Periode → total → dua aksi → insight → kategori → transaksi terbaru |
| 02 Dashboard states | Memahami kondisi sistem dan langkah berikutnya | Label state → dampak → konten/skeleton yang relevan → satu aksi |
| 03 Daftar transaksi | Menemukan dan membandingkan transaksi | Search/filter → periode dan total → kelompok tanggal → merchant/meta → nominal |
| 04 Detail & edit | Memeriksa lalu mengoreksi transaksi | Ringkasan nominal/sumber → merchant → total → tanggal/kategori → catatan → simpan |
| 05 Scan start | Memilih foto yang aman dan terbaca | Langkah → instruksi → crop area → tips privasi → ambil/pilih foto |
| 06 Kompresi & upload | Mengetahui apa yang sedang dilakukan pada foto | Preview dan ukuran → alasan kompresi → tahapan faktual → opsi batal |
| 07 AI processing | Mengetahui AI sedang bekerja tanpa ekspektasi palsu | Focused preview → status aktif → apa yang akan ditinjau → tahapan faktual |
| 08 Review hasil AI | Memeriksa hasil sebelum menyimpan | Preview/source → merchant → total → tanggal/kategori → warning → simpan |
| 09 AI quota/fallback | Tetap dapat mencatat saat AI tidak tersedia | Apa yang terjadi → dampak → foto tetap tersedia → input manual → coba nanti |
| 10 Destructive confirmation | Membedakan risiko hapus transaksi dan akun | Risiko tunggal → konfirmasi ringkas; risiko akun → dampak lengkap → deliberate confirmation |

## Desktop — 1440 × 1024

| Frame | Tugas yang harus terbaca cepat | Adaptasi desktop |
|---|---|---|
| 11 Dashboard default | Memahami bulan ini tanpa dashboard overload | Summary dan insight sejajar; chart dan transaksi berbagi grid |
| 12 Dashboard states | Membandingkan respons loading, empty, offline | Tiga state berdampingan untuk review, bukan pola halaman produksi simultan |
| 13 Transactions + side panel | Membandingkan transaksi sambil mengedit pilihan | List/table hybrid di kiri; detail persistent di kanan |
| 14 Upload + processing | Memahami perpindahan dari upload ke focused mode | Upload dan contoh processing dipresentasikan berdampingan untuk validasi alur |
| 15 Receipt review | Membandingkan foto dengan hasil ekstraksi | Preview kiri; form hasil AI kanan; tidak perlu bolak-balik halaman |
| 16 App shell + state board | Memvalidasi navigation dan hierarchy komponen | Sidebar, header action, button/field/badge/row states dalam satu board |

## Dua alur utama

### Scan struk

`Dashboard → Pilih foto → Kompres & upload → Focused inspection → Review → Simpan transaksi`

- Empat tahap user-facing: `1 Foto → 2 Persiapan → 3 Pemeriksaan AI → 4 Tinjau`.
- Tidak ada data transaksi tersimpan sebelum aksi final.
- Foto dan konteks dipertahankan ketika AI tidak tersedia.
- User tidak pernah dipaksa menerima kategori AI.
- Setelah simpan berhasil, user kembali ke Dashboard.
- Dashboard menampilkan feedback “Transaksi berhasil disimpan” dan transaksi baru berada di urutan teratas.
- Feedback sukses tidak hanya dibedakan melalui warna; gunakan pesan eksplisit dan highlight singkat.

### Koreksi transaksi

`Daftar transaksi → Buka detail → Koreksi kategori atau field lain → Simpan`

- Mobile memakai halaman terfokus agar form tidak sempit.
- Desktop memakai side panel agar konteks daftar tetap terlihat.
