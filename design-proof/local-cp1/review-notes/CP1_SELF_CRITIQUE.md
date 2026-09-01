# CP1 Self-Critique

## Kesimpulan sementara

Struktur CP1 telah melewati audit hierarchy dan menerima revisi R1. Arah tidak tergelincir menjadi dashboard crypto/admin, scan mode tidak mengubah seluruh produk menjadi dark-first, dan AI dipresentasikan sebagai proses yang transparan serta dapat dikoreksi.

Empat koreksi audit telah diterapkan: urutan scan menjadi empat tahap, endpoint setelah simpan ditetapkan, status foto fallback diperjelas, dan card filler desktop dihapus. Pemilik project mengonfirmasi **CP1 FINAL** pada 29 Juli 2026.

## Yang sudah teruji secara visual

- 10 frame mobile pada 390 × 844 berhasil dirender tanpa elemen utama keluar dari frame.
- 6 frame desktop pada 1440 × 1024 berhasil dirender.
- Dua alur utama memiliki awal, transisi, fallback, review, dan tindakan akhir yang terbaca.
- Total, merchant, kategori, tanggal, source, dan nominal memiliki hierarchy yang berbeda.
- Signal Leaf hanya dipakai sebagai penanda kecil pada progres/success.
- Warm Coral dipakai untuk expense; destructive/error menggunakan Error Red.
- Processing tidak menampilkan persentase atau confidence palsu.
- Hasil AI selalu berupa field yang dapat diedit.
- Dashboard tetap light-first.
- Mobile dan desktop memakai pola detail transaksi yang berbeda.
- Alur scan memakai empat tahap user-facing yang konsisten.
- Endpoint setelah simpan telah didefinisikan kembali ke Dashboard dengan feedback sukses.
- Status foto fallback memakai “Tersedia sementara”, bukan klaim “Aman”.
- Dashboard desktop tidak lagi memakai card metrik yang tidak membantu keputusan pengguna.

## Anti-generic review

### Lulus

- Tidak ada gradient ungu–biru, glow, orb, particle, atau glassmorphism.
- Tidak ada kumpulan kartu metrik generik yang memenuhi seluruh dashboard.
- Dark surface dibatasi pada focused inspection.
- Copy memakai data dan konteks Fintrack AI, bukan placeholder fintech umum.
- Motif crop frame hanya muncul pada scan/review.
- Perbedaan density antar summary, chart, transaction list, dan form terlihat.

### Masih perlu dibuktikan pada CP2

- Apakah Space Grotesk dan IBM Plex Sans memberi karakter yang cukup berbeda setelah dirender benar.
- Apakah spacing mikro dan radius akhir terasa refined, bukan template component library.
- Apakah crop frame dan tracking line memiliki kekhasan yang tetap restraint.
- Apakah chart dengan token final tetap dapat dibaca tanpa terasa terlalu colorful.
- Apakah motion scan informatif dan tetap nyaman dengan reduced motion.

## Risiko hierarchy yang perlu diamati

1. Dashboard mobile berada dekat batas jumlah informasi untuk satu viewport. Jangan menambah kartu baru di atas transaksi terbaru.
2. State board adalah artefak review; tiga state tidak boleh muncul bersamaan di halaman produksi.
3. Desktop upload + processing berdampingan untuk membuktikan dua state. Pada produk nyata, state berubah dalam flow yang sama.
4. Receipt preview mobile dibuat ringkas agar field tetap dominan. User test perlu memastikan thumbnail tersebut cukup untuk mengenali struk yang benar.
5. Account deletion sengaja lebih berat daripada transaction deletion. Jangan menyederhanakannya menjadi satu klik atau bottom sheet.

## Yang belum diverifikasi

- Prototype interaktif dan focus order keyboard.
- Handoff native Figma.
- Actual font rendering; PNG saat ini memakai fallback Arial karena font target belum tersedia lokal.
- Device test fisik pada layar 360 px dan desktop 1280 px.
- WCAG pada opacity, hover, focus, dan chart tooltip high-fidelity.
- User test dengan 1–2 pengguna.

## Keputusan menuju CP2

Hierarchy berikut dipertahankan setelah audit:

- urutan dashboard mobile,
- posisi insight sebelum chart,
- empat tahap scan dan copy progres yang faktual,
- fallback manual saat AI tidak tersedia,
- review field yang sepenuhnya editable,
- detail transaksi terfokus pada mobile dan side panel pada desktop,
- friction destructive yang berbeda untuk transaksi dan akun.

Tidak ada kebutuhan mengubah `DESIGN_SYSTEM.md` berdasarkan CP1 saat ini. Semua temuan masih dapat diselesaikan pada level layout atau fidelity berikutnya tanpa mengubah fondasi Quiet Signal — Refined.

Perubahan hierarchy setelah lock ini harus dicatat sebagai revision baru; CP2 tidak boleh mengubah keputusan CP1 secara diam-diam.
