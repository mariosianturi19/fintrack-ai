# CP4-R0 Browser QA

Status: **PASS**  
Date: **2026-07-29**

Prototype diuji melalui server lokal:

```text
http://127.0.0.1:4174/design-proof/local-cp4/prototype/
```

Server hanya dipakai selama QA dan dihentikan setelah pemeriksaan.

## Hasil pemeriksaan

### Load dan asset

- Prototype terbuka tanpa error console.
- Mobile asset terbaca sebagai `390 × 844`.
- Desktop asset terbaca sebagai `1440 × 1024`.
- Viewport switch memperbarui shell, asset, dan label.

### Flow scan mobile

- Dashboard → Pilih foto: berhasil.
- Pilih foto → Kompresi/upload: berhasil.
- Async event control muncul hanya pada state async.
- Upload event → Pemeriksaan AI: berhasil.
- Processing event → Review: berhasil.
- Review → Simpan → Success: berhasil.
- Live region berubah menjadi:
  `Transaksi Superindo tersimpan. Dashboard diperbarui.`

### Recovery dan manual fallback

- Offline recovery menampilkan dua focus target.
- Manual fallback membuka frame manual khusus.
- Frame manual tidak memakai badge `AI · Struk`.
- Live region menjelaskan bahwa input manual siap.

### Desktop runtime separation

- Dashboard desktop → Upload membuka
  `desktop-scan-upload-ready-cp4-r0.png`.
- Upload → Processing membuka
  `desktop-scan-processing-cp4-r0.png`.
- Kedua state mempunyai visual dan context label yang berbeda.

### Destructive focus behavior

- Fokus awal destructive dialog berada pada `Batal`.
- `Tab` berpindah dari `Batal` ke `Hapus transaksi`.
- `Tab` berikutnya kembali ke `Batal`.
- `Escape` menutup dialog.
- Fokus kembali ke control `Destructive` yang memicu state.

### Error runtime

- Tidak ditemukan console error pada browser selama pengujian.

## Koreksi dari browser QA

1. Mapping asset Upload/Processing desktop sempat tertukar; diperbaiki dan
   ditambahkan ke automated verifier.
2. Focus trap dan focus return awalnya baru berupa specification; sekarang
   benar-benar dijalankan oleh prototype.

## Batas bukti

Prototype berbasis image-backed screens dan hotspot. Browser QA ini
membuktikan asset loading, transition, focus target, keyboard recovery,
live-region update, dan responsive viewer. Ini belum menggantikan semantic HTML
serta accessibility runtime pada aplikasi produksi.
