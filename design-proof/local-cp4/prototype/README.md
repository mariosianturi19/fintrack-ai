# Fintrack AI — CP4-R0 Local Prototype

Status: **FINAL / LOCKED**

Prototype ini menghubungkan dua alur Design Proof:

1. Dashboard → scan struk → upload → processing → review → simpan.
2. Transaksi → detail → koreksi kategori → simpan.

## Menjalankan

Buka `index.html` pada browser modern. Jika browser membatasi pemuatan asset
lokal, jalankan server lokal dari root project:

```powershell
node .\design-proof\local-cp4\tooling\serve-prototype.mjs
```

Lalu buka:

```text
http://127.0.0.1:4174/design-proof/local-cp4/prototype/
```

## Cara review

- Pilih alur `Scan struk` atau `Koreksi transaksi`.
- Ganti viewport `Mobile` atau `Desktop`.
- Gunakan `Recovery test` untuk melihat offline, upload error, quota, save
  error, dan destructive confirmation.
- Pada proses async, gunakan `Kirim event berhasil`. Prototype sengaja tidak
  memakai timer atau progress palsu.
- Aktifkan `Tampilkan hotspot` untuk melihat target klik.
- Tekan `Tab` untuk memeriksa urutan fokus dan `Escape` untuk kembali /
  menutup state terfokus.

Prototype memakai PNG/SVG final CP2 dan CP3 sebagai locked visual source.
Layer interaksi, recovery states, dan state transition berasal dari CP4-R0.

Ini bukan aplikasi produksi: tidak ada backend, upload, AI, database, atau
mutation nyata.
