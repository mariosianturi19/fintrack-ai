# Fintrack AI — CP2-R0 High-Fidelity Mobile Specification

Status: **FINAL / LOCKED**  
Date: **2026-07-29**  
Confirmed by: **Mario Sianturi**  
Input terkunci: **CP1-R1**, **Quiet Signal — Refined**, dan **LOGO-R1**

## Tujuan

CP2-R0 membuktikan bahwa hierarchy yang sudah disetujui dapat menjadi
interface mobile yang:

- profesional dan elegan tanpa menjadi dingin;
- terbaca cepat untuk penggunaan finansial sehari-hari;
- membuat AI transparan dan dapat dikoreksi;
- tetap tenang pada state gagal, offline, atau destructive;
- mempunyai karakter meskipun memakai pola UI yang familiar.

## Keputusan visual

### Arah dan distribusi warna

- `Rice Paper #F6F2E8` adalah canvas utama pada 9 dari 10 frame.
- `Midnight #0B1220` menjadi focused inspection canvas hanya saat AI membaca
  struk.
- `Mineral Blue #285A73` menangani primary action, link, dan emphasis
  terpercaya.
- `Signal Leaf #B9D86E` dibatasi pada progres scan dan status berhasil.
- `Warm Coral #D96C52` dipakai sebagai data pengeluaran/dekorasi; teks kecil
  pengeluaran memakai `Expense Ink #A63D2A`.
- Warning dan error tetap dibedakan melalui warna, ikon, border, dan bahasa.

Tidak ada gradient AI, glassmorphism, glow, particle, atau dinding metric card.

### Tipografi

- Heading dan financial anchor: **Space Grotesk**, weight `500/600/700`.
- Body, form, metadata, dan navigation: **IBM Plex Sans**, weight
  `400/500/600`.
- Nominal memakai tabular numerals.
- Font tertanam di SVG agar hasil review lokal konsisten.

### Shape dan elevation

- Tombol: radius `12`.
- Field: radius `10`.
- Card: radius `14–16`.
- Scan panel: radius `18`.
- Hierarchy permukaan dibentuk terutama oleh border, spacing, dan perubahan
  canvas. Shadow tidak dipakai sebagai dekorasi default.

### Iconography dan logo

- Ikon: **Phosphor Icons**, regular untuk default dan fill hanya saat state
  aktif memerlukan emphasis.
- LOGO-R1 compact primary dipakai pada app header dashboard dan transaksi.
- Simbol logo tidak menggantikan glyph `F` pada wordmark.

### Motif

- Crop frame hanya hadir pada pemilihan foto, upload, focused inspection, dan
  review.
- Tracking line menjelaskan hubungan atau tahap proses, bukan dekorasi.
- Motif sengaja tidak hadir pada dashboard dan transaksi biasa agar identitas
  tidak berubah menjadi gimmick scanning.

## Sepuluh frame utama

| No. | Frame | Pembuktian utama |
|---|---|---|
| 01 | Dashboard — default | Hierarchy lima detik, light-first, insight dan latest transactions |
| 02 | Dashboard — states | Loading, empty, dan cached/offline tanpa dead end |
| 03 | Daftar transaksi | Grouping waktu, pencarian, filtering, dan scan/manual provenance |
| 04 | Detail & edit transaksi | Editability hasil AI dan safe destructive entry |
| 05 | Scan — pilih foto | Privasi, crop frame, camera/gallery choice |
| 06 | Kompresi & upload | Proses sebelum AI tanpa fake percentage |
| 07 | Focused inspection | Mode gelap yang kontekstual, tahap yang jujur |
| 08 | Review hasil AI | Semua field dapat diperiksa dan kategori diberi friction |
| 09 | AI quota / fallback | Bahasa manusiawi dan manual fallback tetap utama |
| 10 | Destructive confirmation | Friction berbeda untuk transaksi dan penghapusan akun |

Frame 02 dan 10 adalah **comparison boards** untuk membuktikan beberapa state
atau pola, bukan satu layar runtime yang menampilkan semuanya sekaligus.

## Responsive proof

Spot-check `360 × 844` dibuat untuk:

- dashboard;
- daftar transaksi;
- review hasil AI.

Pada 360 px:

- content width menjadi `328 px`;
- label bottom navigation tetap terlihat;
- ukuran font tidak dikurangi;
- primary action tetap berdampingan hanya ketika label masih aman;
- sticky review action tetap utuh.

## Accessibility-by-design

- Minimum touch target token: `44 × 44 px`.
- Button dan field utama: `48 px`.
- Bottom navigation: `80 px`.
- Warna bukan satu-satunya pembeda state.
- Semua pasangan warna teks utama yang diuji memenuhi WCAG AA.
- Focused inspection tidak memakai persentase atau confidence AI palsu.
- Copy menjelaskan bahwa hasil AI dapat diperiksa dan diedit.

Runtime focus indicator, keyboard order, screen reader labeling, text scaling,
dan reduced motion tetap perlu dibuktikan pada CP4 dan pengembangan web.

## QA result

- 10 SVG + 10 PNG utama: `390 × 844`.
- 3 SVG + 3 PNG spot-check: `360 × 844`.
- Font target tertanam: lulus.
- Kontras pasangan aktual: lulus.
- Anti-gradient/glass/glow/filter: lulus.
- Light-first rule: lulus.
- Fake progress check: lulus.
- Automated verification: **PASS — 98/98**.
- Visual inspection: foundation, contact sheet, dashboard, focused inspection,
  destructive confirmation, dan 360 board telah diperiksa.
- Local renderer dependency audit: **0 vulnerability**.

Detail mesin ada pada `review-notes/verification-report.json`.

## Keputusan final dan hal yang diteruskan

- Density, warmth, karakter dashboard, dan bahasa state quota diterima sebagai
  basis final CP2.
- Runtime focus, keyboard order, screen reader labeling, text scaling, motion,
  dan pemisahan state diteruskan ke CP4 serta pengembangan web.
- Desktop adaptation diteruskan ke CP3 tanpa mengubah hierarchy mobile yang
  telah dikunci.
- Revisi CP2 baru hanya dibuka bila checkpoint berikutnya membuktikan masalah
  nyata pada penggunaan atau accessibility.

`DESIGN_SYSTEM.md` belum diubah karena CP2-R0 tidak menemukan konflik terukur
dengan fondasi yang sudah disetujui.
