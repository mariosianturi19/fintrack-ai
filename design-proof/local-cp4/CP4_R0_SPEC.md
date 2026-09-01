# Fintrack AI — CP4-R0 States & Prototype Specification

Status: **FINAL / LOCKED**  
Date: **2026-07-29**  
Input terkunci: **CP1-R1**, **CP2-R0**, **CP3-R0**, **LOGO-R1**, dan
**Quiet Signal — Refined**

## Tujuan

CP4-R0 membuktikan bahwa dua alur utama Fintrack AI:

- dapat diselesaikan tanpa dead end;
- menyediakan back, cancel, retry, dan manual fallback yang relevan;
- tidak kehilangan foto, input, atau koreksi saat request gagal;
- tidak menggunakan progres AI atau confidence palsu;
- mempunyai focus order serta motion contract yang siap diimplementasikan;
- mempertahankan makna state pada mobile, tablet, dan desktop.

## Studi pola interaksi

Tiga pola diuji:

| Pola | Pemakaian | Keputusan |
|---|---|---|
| Guided Linear | Scan struk dengan satu tahap aktif | Dipilih untuk happy path scan |
| Contextual Inline | Koreksi cepat sambil mempertahankan konteks list | Dipilih untuk edit transaksi |
| Recovery First | Retry, manual fallback, dan kembali tanpa kehilangan data | Dipilih sebagai branch, bukan default flow |

Tidak ada satu pola yang dipaksakan ke seluruh fitur.

## State inventory

### Loading

- Skeleton mengikuti bentuk konten.
- Cache dipakai ketika tersedia.
- Layout tidak berubah drastis saat data datang.
- Announcement: “Ringkasan sedang dimuat.”

### Empty

- Menjelaskan data yang belum ada.
- Menawarkan satu langkah berikut: tambah manual atau scan struk.
- Tidak memakai ilustrasi besar.

### Offline / cached

- Data cache tetap terlihat.
- Foto belum diunggah dan tetap berada di perangkat.
- Manual fallback serta retry tersedia.

### Error

- Menjelaskan tindakan yang gagal.
- Foto, input, dan koreksi dipertahankan.
- Menawarkan retry dan jalan kembali.
- Detail API, model, atau status code tidak ditampilkan.

### AI quota / rate limit

- Copy: “Pemindaian AI sedang sibuk.”
- Manual fallback dan “coba lagi nanti” tersedia.
- Foto belum dianggap transaksi.

### Review

- Field yang perlu diperiksa memiliki label dan warning dekat field.
- Semua hasil AI tetap editable.
- Save hanya diteruskan setelah field minimum valid.

### Success

- Data utama diperbarui terlebih dahulu.
- Confirmation memakai toast non-blocking.
- Toast tidak mengambil fokus dan tidak menjadi langkah wajib baru.

### Destructive

- Objek, nilai, dan dampak disebut secara eksplisit.
- Fokus awal berada pada `Batal`.
- Escape menutup dialog.
- Fokus kembali ke tombol pemicu.

## Prototype flow 1 — Scan struk

Happy path:

```text
Dashboard
→ Pilih foto
→ Kompresi dan upload
→ Pemeriksaan AI
→ Tinjau hasil
→ Simpan
→ Dashboard diperbarui
```

Recovery branch:

- Izin kamera ditolak → pilih galeri atau kembali.
- Offline → foto tetap lokal; manual atau retry.
- Upload gagal → foto dan pilihan dipertahankan; retry atau kembali.
- AI quota → manual fallback atau coba nanti.
- Validation warning → fokus menuju field bermasalah.
- Save gagal → hasil edit tetap ada; retry atau kembali.

## Prototype flow 2 — Koreksi transaksi

Happy path:

```text
Daftar transaksi
→ Buka detail
→ Koreksi kategori
→ Simpan
→ List diperbarui
```

Recovery dan destructive branch:

- Save gagal → koreksi tetap ada; retry atau kembali.
- Hapus → dialog konfirmasi → batal atau hapus → list diperbarui.

## Manual fallback

Manual fallback mempunyai frame tersendiri pada mobile dan desktop.

- Tidak memakai badge `AI · Struk`.
- Tidak ada merchant, total, atau kategori yang terisi secara otomatis.
- Copy menjelaskan bahwa tidak ada hasil AI yang diterapkan.
- Struktur field tetap konsisten dengan edit transaksi.

## Desktop runtime separation

Frame CP3 `Upload + processing` adalah comparison artifact. CP4 memisahkannya
menjadi:

1. `desktop-scan-upload-ready-cp4-r0`.
2. `desktop-scan-processing-cp4-r0`.

Pemisahan ini memastikan prototype benar-benar menunjukkan perubahan state,
bukan hanya mengganti label pada visual yang sama.

## Focus order

### Mobile review

1. Back.
2. Merchant.
3. Total.
4. Tanggal.
5. Kategori yang perlu diperiksa.
6. Item terdeteksi.
7. Simpan transaksi.

### Desktop detail dan dialog

- Selected row membuka panel dan fokus menuju heading detail.
- Field mengikuti urutan visual atas-ke-bawah.
- Dialog menjebak fokus.
- `Escape` menutup dialog.
- Fokus kembali ke pemicu setelah dialog ditutup.
- Success toast tidak mengambil fokus.

## Motion contract

| Event | Default | Durasi | Reduced motion |
|---|---|---:|---|
| Hover / press | Opacity atau color | 120 ms | Tanpa transform |
| Field validation | Border dan message | 180 ms | Langsung |
| Sheet / dialog enter | Opacity + 8 px | 260 ms | Langsung |
| Toast success | Opacity + 6 px | 180 ms | Langsung |
| Screen transition | Opacity + 8 px | 180 ms | Langsung |
| Scanning line | Linear selama request nyata | Event-driven | Garis statis |

Prototype tidak memakai `setTimeout` atau `setInterval` untuk memajukan proses
AI. Async state hanya bergerak setelah event simulator dipicu.

## Responsive state behavior

| State | Mobile | Desktop |
|---|---|---|
| Error/offline | Inline state atau bottom sheet sesuai kompleksitas | Panel aktif; dialog hanya untuk keputusan yang memblokir |
| Success | Toast di atas bottom navigation | Toast kanan atas; konteks list/panel tetap terlihat |
| Destructive | Dialog terfokus, bukan gesture sheet | Centered modal dengan focus trap |
| Manual fallback | Focused page | Form 640 px dan contextual guidance |

Tablet mempertahankan makna state yang sama, memakai compact rail, dan
menumpuk preview/form ketika ruang tidak cukup.

## Artefak R0

- 12 state/runtime frame:
  - 5 mobile `390 × 844`.
  - 7 desktop `1440 × 1024`.
- 7 review board dalam SVG dan PNG.
- 1 prototype lokal dengan mode mobile dan desktop.
- 2 happy path.
- 5 recovery test.
- Interaction model JSON untuk handoff.

## Acceptance criteria CP4

- Loading, empty, offline, error, quota, review, success, dan destructive
  memiliki pesan, tindakan, serta exit.
- Dua flow utama dapat diselesaikan.
- Back, cancel, retry, dan manual fallback tersedia ketika relevan.
- Tidak ada dead end.
- Tidak ada auto-advance AI berbasis timer.
- Tidak ada progress atau confidence palsu.
- Error mempertahankan konteks.
- Focus target utama minimal 44 × 44 px.
- Focus visible tersedia.
- Destructive confirmation memulai fokus pada `Batal`.
- Reduced motion menghilangkan transform/animation yang tidak perlu.
- Makna state konsisten pada mobile dan desktop.

## QA result

- 12 state/runtime frame: dimensi lulus.
- 7 review board dalam SVG dan PNG: dimensi lulus.
- Signal Leaf maksimal 5% exact-color pixels: lulus pada seluruh frame.
- Anti-gradient/filter/glass: lulus.
- State model dan recovery coverage: lulus.
- Prototype syntax dan asset references: lulus.
- Browser happy path dan recovery test: lulus.
- Destructive initial focus, focus trap, Escape, dan focus return: lulus.
- Browser console error: tidak ditemukan.
- Automated verification: **PASS — 221/221**.
- Shared renderer dependency audit: **0 vulnerability**.

## Keputusan design-system

CP4-R0 tidak mengubah arah, warna, tipografi, logo, atau layout foundation.
Jika QA tidak menemukan konflik terukur, `DESIGN_SYSTEM.md` tidak diperbarui
pada checkpoint ini.

## Final lock

Mario Sianturi mengonfirmasi **CP4-R0 Final** pada `2026-07-29`. Keputusan,
bukti penerimaan, governance, dan known precision items untuk CP5 dicatat
dalam `CP4_R0_FINAL_LOCK.md`.
