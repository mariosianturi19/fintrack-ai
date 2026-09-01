# Fintrack AI Design Proof Specification

## 1. Status dan sumber

- Status: approved for execution.
- Checkpoint status: **CP1 FINAL — R1**, dikonfirmasi 29 Juli 2026.
- Arah final: **Quiet Signal — Refined**.
- Prinsip: *Precision Without Anxiety — intelligent financial clarity, presented with restraint.*
- Product brief: `D:\Kuliah\Bahan Kuliah\Matkul\Vscode\fintrack-ai\project-brief-fintrack-ai.md`.
- Design-system source of truth: `D:\Kuliah\Bahan Kuliah\Matkul\Vscode\fintrack-ai\DESIGN_SYSTEM.md`.
- Figma working file: [Fintrack AI — Design Proof](https://www.figma.com/design/jkujJ6hKpPDu8L7I3mn03E).
- Figma workspace: `Mario Sianturi's team`.

Jika brief, design system, dan design proof bertentangan, keputusan tidak boleh diambil diam-diam. Konflik harus dicatat dan dikonfirmasi sebelum menjadi pola produksi.

## 2. Tujuan

Design Proof harus membuktikan bahwa Fintrack AI:

1. Terlihat profesional dan elegan.
2. Nyaman digunakan pada mobile.
3. Tidak berubah menjadi dashboard teknis generik.
4. Menjelaskan proses AI secara transparan.
5. Beradaptasi secara sengaja ke desktop.
6. Siap diterjemahkan ke implementasi tanpa keputusan visual besar yang belum terselesaikan.

## 3. Viewport acuan

- Mobile utama: `390 × 844`.
- Desktop utama: `1440 × 1024`.
- Spot-check mobile: lebar `360 px`.
- Spot-check desktop: lebar `1280 px`.
- Tablet: tidak memerlukan frame lengkap; perilakunya divalidasi dari aturan responsive.

## 4. Scope frame

### 4.1 Mobile

1. Dashboard — populated/default.
2. Dashboard states — loading, empty, dan offline.
3. Daftar transaksi.
4. Detail serta edit transaksi.
5. Awal scan — pilih foto dan tips privasi.
6. Kompresi serta upload.
7. AI processing — focused inspection mode.
8. Review hasil AI — termasuk field yang perlu diperiksa.
9. AI quota/error — fallback ke input manual.
10. Konfirmasi destructive — hapus transaksi dan contoh hapus akun.

### 4.2 Desktop

11. Dashboard — populated/default.
12. Dashboard states — loading, empty, dan offline.
13. Daftar transaksi dengan detail side panel.
14. Upload serta AI processing.
15. Receipt review dua kolom.
16. App shell, side navigation, dan component-state board.

Mobile dan desktop bukan salinan yang hanya diubah ukurannya. Hierarki, navigation, penempatan aksi, dan pola detail harus disesuaikan berdasarkan konteks layar.

## 5. Data contoh

Semua mockup memakai data fiktif berbahasa Indonesia:

- Periode: Juli 2026.
- Total pengeluaran: sekitar `Rp3.482.500`.
- Merchant: Superindo, KRL, PLN, dan Kedai Sela.
- Kategori mengikuti palet chart dalam design system.
- Contoh insight: “Pengeluaran makanmu sedikit meningkat dibanding minggu lalu.”
- Struk tidak mengandung data kartu atau informasi pribadi nyata.

## 6. Alur prototype

1. Dashboard → Scan struk → Processing → Review → Simpan transaksi.
2. Transaksi → Buka detail → Koreksi kategori → Simpan.

Prototype tidak memerlukan backend atau AI nyata. Tujuannya memvalidasi hierarchy, state transition, dan kejelasan tindakan.

## 7. Tahap pengerjaan dan checkpoint

### Checkpoint 1 — content hierarchy dan low-fidelity

- Menentukan susunan informasi tanpa polish visual.
- Menguji struktur dashboard, scan, transaksi, dan navigation.
- Belum menjadi keputusan visual high-fidelity.

### Checkpoint 2 — high-fidelity mobile

- Menerapkan warna, tipografi, spacing, komponen, crop frame, dan tracking line.
- Memastikan karakter profesional/elegan tercapai sebelum desktop diadaptasi.

### Checkpoint 3 — desktop adaptation

- Mengubah hierarchy dan layout secara sengaja.
- Menghindari pola mobile yang hanya diperbesar.

### Checkpoint 4 — states dan prototype

- Melengkapi loading, empty, offline, error, quota, review, dan destructive states.
- Menghubungkan dua alur prototype utama.

### Checkpoint 5 — visual QA dan handoff

- Accessibility.
- Consistency.
- Responsive behavior.
- Anti-generic self-critique.
- Pembaruan `DESIGN_SYSTEM.md` hanya jika design proof membuktikan adanya masalah.

## 8. Acceptance criteria

Design Proof dinyatakan lulus jika:

- Fungsi utama layar terbaca dalam sekitar lima detik.
- Dashboard tidak dark-dominant.
- Signal Leaf tetap menjadi aksen kecil, maksimal sekitar 3–5% area visual.
- Total, merchant, tanggal, kategori, dan nominal mempunyai hierarki jelas.
- Proses AI tidak menampilkan progres atau confidence palsu.
- Semua hasil AI bisa diperiksa dan dikoreksi.
- Touch target utama minimal `44 × 44 px`.
- Warna bukan satu-satunya pembeda status.
- Pasangan warna aktual memenuhi WCAG AA.
- Mobile navigation nyaman dijangkau satu tangan.
- Desktop tidak terlihat seperti admin dashboard yang padat.
- Identitas tetap terasa meskipun logo tidak terlihat.
- Tidak ada gradient AI, glassmorphism, glow neon, atau tampilan default component library.

## 9. Di luar scope

Belum dikerjakan pada tahap Design Proof:

- Seluruh layar autentikasi dan profile.
- Budget planning, chat AI, dan WhatsApp.
- Final logo production.
- Landing page marketing.
- Kode Next.js atau backend.
- Seluruh state untuk setiap halaman aplikasi.

## 10. Aturan artefak

- Working source editable berada di Figma.
- Backup `.fig` dan export PNG/SVG harus disimpan di:
  `D:\Kuliah\Bahan Kuliah\Matkul\Vscode\fintrack-ai\design-proof`.
- Tidak ada artefak project yang dibuat di folder lain.
- File export harus memakai nama stabil yang menyebut platform, layar, state, dan versi checkpoint.

Contoh:

```text
mobile-dashboard-default-cp1.png
mobile-scan-processing-cp1.png
desktop-transactions-detail-cp1.png
```

## 11. Guardrail tipografi Figma

Target produksi tetap:

- Space Grotesk: `500`, `600`, `700`.
- IBM Plex Sans: `400`, `500`, `600`.

Environment Figma saat file dibuat belum menyediakan Space Grotesk `600/SemiBold`. Pengganti visual belum boleh dianggap keputusan design-system final sebelum divalidasi.
