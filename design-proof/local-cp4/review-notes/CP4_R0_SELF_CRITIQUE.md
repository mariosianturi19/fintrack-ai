# CP4-R0 Self-Critique

Status: **FINAL / LOCKED**

## Verdict

CP4-R0 layak masuk owner review setelah empat koreksi internal/browser QA:

1. Manual fallback tidak lagi memakai layar berlabel `AI · Struk`.
2. Upload dan processing desktop dipisahkan menjadi runtime frame yang berbeda.
3. Mapping asset upload/processing desktop yang sempat tertukar telah diperbaiki.
4. Focus trap dan focus return kini berjalan di prototype, bukan hanya tertulis.

Rekomendasi saya adalah menerima interaction architecture R0 jika alur
prototype terasa jelas dan recovery state tidak menambah kecemasan.

## Yang berhasil

### 1. Pola interaksi mengikuti jenis tugas

Scan tetap linear dan fokus. Koreksi transaksi mempertahankan konteks list.
Recovery menjadi branch yang muncul ketika diperlukan, bukan state yang
mendominasi happy path.

### 2. Error tidak menghapus pekerjaan pengguna

Foto, hasil review, dan koreksi dipertahankan. Pesan menjelaskan apa yang
terjadi, dampaknya, serta langkah berikut.

### 3. AI tetap transparan

Processing tidak menggunakan persentase, confidence, atau auto-advance timer.
Prototype hanya maju setelah event simulator dipicu.

### 4. Manual fallback benar-benar manual

Frame manual tidak memakai source badge AI dan tidak mengisi data otomatis.
Ini menghindari klaim palsu ketika quota atau upload AI gagal.

### 5. Desktop runtime state sudah dipisah

CP3 memakai upload/processing comparison board. CP4 membuat frame upload-ready
dan processing yang berdiri sendiri sehingga state transition dapat dinilai.

### 6. Focus dan motion mempunyai kontrak

Focus order, dialog behavior, return focus, success announcement, motion
duration, dan reduced-motion behavior sudah ditentukan sebelum implementasi.

## Risiko yang masih nyata

### 1. Prototype memakai image-backed screens

Hotspot mempunyai focus target dan keyboard behavior, tetapi screen di
belakangnya tetap gambar. Karena itu prototype ini membuktikan hierarchy serta
transition—bukan semantic HTML akhir, form association, screen-reader
navigation, atau browser text scaling.

Scope tersebut tetap harus dibuktikan pada implementasi dan CP5.

### 2. Event simulator adalah alat review

Tombol “Kirim event berhasil” berada di luar app frame agar tidak disalahartikan
sebagai UI produksi. Implementasi harus menghubungkan transition ke status
request nyata, bukan mempertahankan simulator.

### 3. Tablet masih berupa behavior rule

Mobile dan desktop mempunyai visual proof. Tablet mempertahankan rule dari CP3
dan responsive state board, tetapi belum mempunyai prototype frame penuh.
Ini sesuai scope Design Proof; runtime responsive QA tetap dilakukan pada CP5.

### 4. Success toast memerlukan runtime announcement

Secara visual success tidak memblokir. Pada implementasi, announcement harus
dibuktikan tidak terlalu cepat, tidak berulang, dan tidak mengambil fokus.

### 5. Hapus akun belum menjadi flow prototype penuh

Pola stronger confirmation sudah dibuktikan pada CP2. CP4 memprioritaskan
delete transaksi dalam correction flow. Hapus akun tetap memerlukan runtime
focus/typing validation pada implementasi/CP5.

## Anti-AI-slop audit

- [x] Tidak ada AI progress palsu.
- [x] Tidak ada AI confidence percentage.
- [x] Tidak ada neon glow, particle, atau gradient AI.
- [x] Focused inspection tetap kontekstual.
- [x] Tidak ada celebratory animation berlebihan.
- [x] Error tidak memakai Warm Coral expense.
- [x] Signal Leaf tetap menjadi aksen kecil.
- [x] Success bukan layar perayaan yang menghalangi tugas.
- [x] Recovery copy spesifik terhadap foto, input, atau transaksi.
- [x] Manual fallback tidak berpura-pura sebagai hasil AI.
- [x] Desktop state tidak kembali menjadi comparison artifact.

## Pertanyaan review pemilik

1. Apakah flow scan mudah dipahami tanpa penjelasan teknis?
2. Apakah recovery state terasa membantu dan tidak menakutkan?
3. Apakah correction flow mempertahankan konteks dengan baik?
4. Apakah simulator event cukup jelas sebagai alat review, bukan UI aplikasi?
5. Apakah success confirmation terasa cukup tanpa menjadi berlebihan?

Jika tidak ada masalah spesifik pada flow, copy, focus, atau recovery path,
CP4-R0 layak dikunci tanpa membuat R1.

Mario Sianturi mengonfirmasi **CP4-R0 Final** pada `2026-07-29`. Dua contoh
layout defect dari review pemilik tidak mengubah verdict interaction
architecture; keduanya diteruskan sebagai known precision items wajib pada
CP5.
