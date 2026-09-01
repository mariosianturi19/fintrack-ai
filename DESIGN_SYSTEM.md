# Fintrack AI Design System

## 1. Status Dokumen

- **Status:** Approved; CP5-R0 final / locked for design proof
- **Arah desain final:** Quiet Signal — Refined
- **Tagline desain:** *Precision Without Anxiety — intelligent financial clarity, presented with restraint.*
- **Produk:** Fintrack AI
- **Platform:** Mobile-first Progressive Web App (PWA) dan desktop web
- **Versi dokumen:** 1.2
- **Sumber keputusan:** `project-brief-fintrack-ai.md`, diskusi arah desain, `design-proof/logo-r1/LOGO_R1_FINAL_LOCK.md`, dan `design-proof/local-cp5/CP5_R0_FINAL_LOCK.md`

Dokumen ini adalah sumber acuan visual yang mengikat untuk desain dan implementasi Fintrack AI. Perubahan yang bertentangan dengan fondasi ini harus dibahas dan dicatat terlebih dahulu. Penyesuaian kecil pada nilai token tetap diperbolehkan jika design proof, pemeriksaan aksesibilitas, atau pengujian pada perangkat nyata menunjukkan masalah yang terukur.

---

## 2. Ringkasan Arah

Quiet Signal — Refined memadukan presisi produk data dan AI dengan ketenangan yang dibutuhkan saat mengelola informasi keuangan pribadi.

Produk harus terasa:

- Profesional dan elegan, tetapi tidak korporat atau dingin.
- Cerdas, tetapi tidak memamerkan AI secara berlebihan.
- Data-rich, tetapi tidak padat atau melelahkan.
- Terpercaya, tetapi tetap ramah untuk penggunaan sehari-hari.
- Modern, tetapi tidak menyerupai template fintech, crypto, trading, atau admin dashboard.

Prinsip intinya:

> Fintrack AI membantu pengguna mencatat dan memahami pengeluaran dengan cepat, sementara keputusan dan koreksi tetap berada di tangan pengguna.

AI harus divisualkan sebagai proses yang transparan dan dapat ditinjau, bukan sebagai “keajaiban” yang hasilnya harus diterima tanpa pemeriksaan.

---

## 3. Fondasi Brand

### 3.1 Brand personality

| Atribut utama | Makna dalam produk |
|---|---|
| Precise | Nominal, status, tanggal, dan hasil AI disajikan tanpa ambiguitas. |
| Calm | Hierarki, whitespace, warna, dan copy mengurangi kecemasan finansial. |
| Intelligent | AI terasa membantu melalui alur dan status yang jelas, bukan dekorasi futuristik. |
| Trustworthy | Tindakan sensitif, akses data, koreksi, dan penghapusan dijelaskan secara jujur. |
| Refined | Detail tipografi, alignment, motion, dan state terasa matang serta konsisten. |
| Human | Bahasa singkat, ramah, dan tidak menghakimi pola belanja pengguna. |

### 3.2 Brand spectrum

Fintrack AI berada di posisi berikut:

- Lebih **refined** daripada playful.
- Lebih **calm** daripada energetic.
- Lebih **human** daripada technical.
- Lebih **precise** daripada decorative.
- Lebih **editorial** daripada gamified.
- Lebih **light-first** daripada dark-first.

### 3.3 Hal yang bukan Fintrack AI

Fintrack AI bukan:

- Aplikasi trading, investasi, perbankan, atau crypto.
- Dashboard admin enterprise.
- Aplikasi budgeting yang menghakimi atau membuat pengguna merasa bersalah.
- Produk AI dengan glow neon, partikel, gradient ungu-biru, dan efek futuristik generik.
- Scrapbook keuangan dengan stiker, ilustrasi kartun, atau warna kategori yang terlalu ramai.

---

## 4. Logo System — LOGO-R1

### 4.1 Status dan konsep

- **Status checkpoint:** FINAL / LOCKED FOR DESIGN PROOF.
- **Konfirmasi pemilik:** Mario Sianturi, 2026-07-29.
- **Arah terpilih:** Baseline A — Refined Lockup.
- **Status produksi:** disetujui untuk penggunaan provisional pada CP2–CP4;
  production asset lock tetap dilakukan pada CP5.

Signal Frame F menggabungkan `F` sebagai identitas Fintrack, dua crop corners
sebagai isyarat scan, dan open frame sebagai representasi proses AI yang dapat
ditinjau serta dikoreksi. Receipt motif tetap menjadi supporting visual
language dan tidak dimasukkan secara literal ke primary mark.

### 4.2 Master dan micro mark

| Variant | Geometry | Pemakaian |
|---|---|---|
| Master mark | Main stroke `17`; corner stroke `12.5`; rounded caps | `24 px+` |
| Micro mark | Main stroke `20`; corner stroke `14`; square caps | `16–23 px` |

- ViewBox standalone mark: `0 0 160 160`.
- Master terpilih: O2 — Refined.
- `F` harus tetap menjadi bentuk pertama yang terbaca.
- Dua crop corners tidak boleh dilengkapi menjadi frame empat sisi.

### 4.3 Wordmark dan lockup

- Wordmark: `Fintrack AI`.
- Typeface source: Space Grotesk.
- Weight: `600`.
- Production form: outlined SVG path; bukan live text.
- Relationship: separate icon + full wordmark; simbol tidak menggantikan glyph
  `F`.
- Tight lockup ViewBox: `0 0 492 72`.

| Lockup | Pemakaian |
|---|---|
| Compact lockup | `24–27 px high` |
| Master lockup | `28 px high+` |
| Recommended interface size | `28–32 px high` |

Di bawah 24 px, gunakan standalone micro mark dan jangan memaksakan wordmark.

### 4.4 Colorways

| Variant | Mark | Wordmark | Background |
|---|---:|---:|---:|
| Primary | `#285A73` | `#0B1220` | `#F6F2E8` atau clean light surface |
| Reverse | `#F6F2E8` | `#F6F2E8` | `#0B1220` |
| Monochrome dark | `#0B1220` | `#0B1220` | Light surface |
| Monochrome light | `#FFFFFF` | `#FFFFFF` | Sufficiently dark surface |

Signal Leaf, Warm Coral, gradient, opacity treatment, glow, dan category colors
tidak digunakan pada logo.

### 4.5 Clear space dan larangan

- `x` adalah ketebalan vertical stem master mark pada skala pemakaian.
- Minimum clear space: `1x` pada keempat sisi standalone mark atau keseluruhan
  visible bounding box lockup.
- Jangan stretch, skew, rotate, memberi shadow, bevel, glass, glow, atau
  gradient.
- Jangan memindahkan crop corners atau mengetik ulang wordmark dengan font
  lain.
- Jangan menempatkan primary logo pada foto atau background berkontras rendah.

### 4.6 Favicon dan PWA

- Favicon: `16 × 16` dan `32 × 32`.
- Standard PWA icons: `192 × 192` dan `512 × 512`.
- Maskable PWA icons: `192 × 192` dan `512 × 512`.
- Background icon: opaque Rice Paper.
- Critical geometry harus tetap berada di dalam centered safe-zone circle
  dengan radius 40% dari ukuran icon.

### 4.7 Production boundary

LOGO-R1 tidak direvisi selama CP2–CP4 tanpa temuan terukur. Validasi yang masih
wajib sebelum production lock pada CP5:

- hierarchy dan presence pada high-fidelity mobile/desktop;
- reverse treatment pada focused inspection mode dan states;
- browser favicon;
- installed PWA pada perangkat nyata;
- final SVG/export audit;
- trademark/legal review bila project dipublikasikan secara komersial.

---

## 5. Sistem Warna

### 5.1 Distribusi warna

Target distribusi visual pada layar aplikasi:

- **70–80%:** Rice Paper, Canvas, dan Surface.
- **10–15%:** Midnight dan neutral ink.
- **5–10%:** Mineral Blue.
- **Maksimal 3–5%:** Signal Leaf.
- **Sesuai kebutuhan data:** Warm Coral dan warna kategori lain.

Signal Leaf bukan warna brand dominan. Warna ini berfungsi sebagai sinyal status positif, progres AI, atau satu highlight yang membutuhkan perhatian.

### 5.2 Core palette

| Token | Nilai | Peran |
|---|---:|---|
| `canvas` | `#F6F2E8` | Rice Paper; background utama aplikasi. |
| `canvas-subtle` | `#FCFBF7` | Area yang membutuhkan pemisahan sangat lembut. |
| `surface` | `#FFFFFF` | Card, form, dialog, dan surface terangkat. |
| `ink` | `#0B1220` | Midnight; teks utama dan focused inspection mode. |
| `ink-secondary` | `#53606C` | Teks sekunder yang tetap memenuhi kontras AA. |
| `ink-warm-muted` | `#6B665E` | Metadata hangat, caption, dan keterangan sekunder. |
| `primary` | `#285A73` | Mineral Blue; aksi utama dan selection. |
| `primary-hover` | `#1F465A` | Hover/pressed pada aksi utama. |
| `primary-soft` | `#DCEAF0` | Background selection atau informasi ringan. |
| `signal` | `#B9D86E` | Signal Leaf; sukses, progres AI, dan highlight terbatas. |
| `signal-ink` | `#526827` | Teks status positif pada background lembut. |
| `signal-soft` | `#EDF5D5` | Background status positif. |
| `expense` | `#D96C52` | Warm Coral; pengeluaran dan perhatian non-error. |
| `expense-ink` | `#A63D2A` | Teks pengeluaran pada surface lembut. |
| `expense-soft` | `#F8E2DB` | Background badge atau highlight pengeluaran. |
| `border` | `#D9D6CC` | Border komponen. |
| `divider` | `#E7E3DA` | Pemisah internal dan grid line. |
| `disabled-bg` | `#EEEAE1` | Background disabled. |
| `disabled-ink` | `#6B665E` | Teks disabled; jangan digunakan untuk teks kecil di bawah 14 px. |

### 5.3 Semantic palette

| Status | Background | Foreground | Penggunaan |
|---|---:|---:|---|
| Success | `#EDF5D5` | `#526827` | Scan selesai, data tersimpan, export selesai. |
| Information | `#DCEAF0` | `#285A73` | Tips, offline cache info, informasi netral. |
| Warning | `#FFF1D6` | `#8A3C00` | Kuota mendekati batas, data perlu ditinjau. |
| Error | `#FDE8E7` | `#B42318` | Gagal upload, gagal menyimpan, error validasi. |
| Expense | `#F8E2DB` | `#A63D2A` | Nominal pengeluaran; tidak boleh menggantikan error. |

Aturan penting:

- Warm Coral menandai pengeluaran, bukan kesalahan.
- Error selalu memakai token error yang terpisah.
- Signal Leaf tidak digunakan sebagai teks kecil di atas putih.
- Jangan menggunakan warna sebagai satu-satunya pembeda status. Selalu sertakan label, ikon, bentuk, atau pola.

### 5.4 Referensi kontras utama

Pasangan berikut telah diperiksa:

| Foreground / Background | Rasio | Status |
|---|---:|---|
| Midnight / Rice Paper | `16.75:1` | Lulus AAA |
| Midnight / White | `18.72:1` | Lulus AAA |
| Secondary Ink / Rice Paper | `5.77:1` | Lulus AA |
| White / Mineral Blue | `7.50:1` | Lulus AAA |
| White / Mineral Blue Hover | `10.09:1` | Lulus AAA |
| Midnight / Signal Leaf | `11.69:1` | Lulus AAA |
| Signal Ink / Signal Soft | `5.53:1` | Lulus AA |
| Midnight / Warm Coral | `5.54:1` | Lulus AA |
| Expense Ink / Expense Soft | `5.08:1` | Lulus AA |
| White / Error Red | `6.57:1` | Lulus AA |

Nilai di atas tidak membebaskan implementasi dari audit kontras setelah opacity, overlay, hover, chart fill, atau state disabled diterapkan.

### 5.5 Data visualization palette

Warna chart tidak boleh terasa seperti pelangi. Gunakan warna muted dan tampilkan satu seri aktif dengan saturasi lebih kuat.

| Kategori awal | Warna |
|---|---:|
| Makanan & minuman | `#D96C52` |
| Transportasi | `#285A73` |
| Belanja | `#8A6FA8` |
| Tagihan | `#B48A32` |
| Kesehatan | `#5A8F7B` |
| Lainnya | `#64748B` |

Aturan chart:

- Maksimal lima kategori individual ditambah “Lainnya” dalam donut/pie.
- Hindari chart 3D, gradient fill, glow, dan animasi berlebihan.
- Label, tooltip, dan ringkasan teks wajib tersedia.
- Gunakan pola, bentuk marker, atau label tambahan bila warna berpotensi sulit dibedakan.
- Signal Leaf dipakai untuk selection/progress, bukan otomatis menjadi kategori terbesar.

---

## 6. Tipografi

### 6.1 Font family

#### Space Grotesk

Digunakan untuk:

- Display heading.
- Page title.
- Total pengeluaran utama.
- Wordmark.
- Insight headline.

Karakter: modern, presisi, dan memiliki identitas cukup kuat untuk portfolio tanpa terlihat eksperimental.

#### IBM Plex Sans

Digunakan untuk:

- Body text.
- Form.
- Button.
- Navigation.
- Transaction list.
- Tooltip dan metadata.
- Angka dan tabel.

Karakter: sangat terbaca, profesional, dan cocok untuk interface data.

Kedua font tersedia secara open-source. Pada implementasi, font harus di-self-host atau dibundel saat build agar tidak bergantung pada font CDN saat runtime dan tetap sesuai dengan kebutuhan PWA/offline.

### 6.2 Font weights

- Space Grotesk: `500`, `600`, `700`.
- IBM Plex Sans: `400`, `500`, `600`.
- Hindari penggunaan `300` untuk interface karena terlalu tipis pada layar kecil.
- `700` hanya untuk display/angka yang benar-benar membutuhkan emphasis.

### 6.3 Type scale

| Token | Mobile | Desktop | Line height | Weight | Penggunaan |
|---|---:|---:|---:|---:|---|
| `display` | 32 px | 40 px | 1.10 | 600 | Total utama atau headline khusus. |
| `h1` | 28 px | 32 px | 1.20 | 600 | Page title. |
| `h2` | 22 px | 24 px | 1.25 | 600 | Section title. |
| `h3` | 18 px | 20 px | 1.35 | 600 | Card title dan sub-section. |
| `body-lg` | 17 px | 18 px | 1.55 | 400 | Insight atau intro penting. |
| `body` | 16 px | 16 px | 1.50 | 400 | Body dan form utama. |
| `body-sm` | 14 px | 14 px | 1.45 | 400/500 | Metadata dan label sekunder. |
| `caption` | 12 px | 12 px | 1.40 | 500 | Caption non-kritis. |
| `button` | 15 px | 15 px | 1.20 | 600 | Button dan action label. |

### 6.4 Angka finansial

- Aktifkan `font-variant-numeric: tabular-nums` pada nominal, tanggal, dan tabel.
- Gunakan format lokal Indonesia, misalnya `Rp125.000`.
- Jangan mengandalkan ukuran font saja untuk membedakan pemasukan dan pengeluaran.
- Hindari memecah simbol mata uang dan nominal ke dua baris.
- Nominal utama boleh memakai Space Grotesk; nominal transaksi menggunakan IBM Plex Sans.

---

## 7. Spacing dan Layout

### 7.1 Base spacing

Gunakan unit dasar 4 px.

| Token | Nilai |
|---|---:|
| `space-1` | 4 px |
| `space-2` | 8 px |
| `space-3` | 12 px |
| `space-4` | 16 px |
| `space-5` | 20 px |
| `space-6` | 24 px |
| `space-8` | 32 px |
| `space-10` | 40 px |
| `space-12` | 48 px |
| `space-16` | 64 px |
| `space-20` | 80 px |

Aturan:

- Gunakan 8 px sebagai ritme utama.
- Gunakan 4 px hanya untuk hubungan yang sangat dekat seperti ikon dan label.
- Jangan memberikan spacing yang sama pada semua card; kepadatan mengikuti fungsi.
- Dashboard harus memiliki ruang napas lebih besar daripada transaction list.

### 7.2 Breakpoints

| Mode | Rentang | Peran |
|---|---:|---|
| Mobile | `< 768 px` | Pengalaman utama, one-hand friendly. |
| Tablet | `768–1023 px` | Layout transisi; satu atau dua kolom sesuai konten. |
| Desktop | `1024–1439 px` | Side navigation dan layout multi-kolom terkontrol. |
| Wide | `≥ 1440 px` | Content tetap dibatasi; whitespace bertambah. |

Breakpoints implementasi boleh diselaraskan dengan Tailwind, tetapi perilaku layout di atas harus dipertahankan.

### 7.3 Page frame

- Mobile horizontal padding: `16 px`.
- Tablet horizontal padding: `24 px`.
- Desktop content padding: `32 px`.
- Wide desktop content padding: `40 px`.
- Maksimum lebar area dashboard: `1440 px`.
- Maksimum lebar form terfokus: `640 px`.
- Maksimum lebar konten insight yang panjang: `720 px`.

### 7.4 Grid

- Mobile: 4 kolom.
- Tablet: 8 kolom.
- Desktop: 12 kolom.
- Gutter mobile: 16 px.
- Gutter tablet/desktop: 24 px.

Grid digunakan untuk alignment, bukan untuk memaksa semua area menjadi simetris.

---

## 8. Shape, Border, dan Elevation

### 8.1 Radius

| Token | Nilai | Penggunaan |
|---|---:|---|
| `radius-xs` | 4 px | Progress segment dan detail kecil. |
| `radius-sm` | 8 px | Badge, chip, dan input compact. |
| `radius-md` | 12 px | Button, input, transaction item. |
| `radius-lg` | 16 px | Card, sheet, dan dialog. |
| `radius-xl` | 20 px | Hero summary atau scan panel tertentu. |
| `radius-full` | 999 px | Avatar dan status dot; bukan default semua button. |

Jangan memakai radius yang sama untuk semua elemen. Hierarki shape harus terlihat.

### 8.2 Border

- Default border: 1 px `#D9D6CC`.
- Internal divider: 1 px `#E7E3DA`.
- Selected border: 1.5–2 px Mineral Blue.
- Focus ring: 2 px Mineral Blue dengan offset 2 px.
- Dark inspection mode menggunakan border putih dengan opacity yang tetap terukur dan lolos contrast check.

### 8.3 Elevation

Gunakan elevation secara terbatas:

- Level 0: page, section, list row.
- Level 1: card utama dan sticky navigation.
- Level 2: dropdown, popover, sheet.
- Level 3: modal dan destructive confirmation.

Shadow tidak digunakan untuk memisahkan setiap card. Border, tone surface, dan spacing harus menjadi alat pemisah utama.

Referensi shadow:

- Level 1: `0 1px 2px rgba(11, 18, 32, 0.06)`.
- Level 2: `0 8px 24px rgba(11, 18, 32, 0.10)`.
- Level 3: `0 18px 48px rgba(11, 18, 32, 0.16)`.

---

## 9. Iconography dan Imagery

### 9.1 Icon

Gunakan satu keluarga ikon yang memiliki beberapa weight, dengan Phosphor Icons sebagai arah awal.

- Inline/action icon: 16–18 px.
- Navigation icon: 20–22 px.
- Primary scan/camera icon: 24 px.
- Empty state icon: 32–40 px.
- Regular weight untuk default.
- Fill atau duotone hanya untuk active state dan momen penting.
- Ikon destructive tidak boleh menggunakan bentuk ambigu.

Jangan memakai ikon sebagai pengganti label pada aksi yang tidak universal seperti export, unlink WhatsApp, atau hapus akun.

### 9.2 Imagery

- Foto stok dan ilustrasi karakter tidak menjadi bagian inti aplikasi.
- Empty state memakai komposisi geometris sederhana dari receipt frame, tracking line, dan ikon kategori.
- Gambar struk harus diperlakukan sebagai data sensitif, bukan dekorasi.
- Preview struk menggunakan masking, crop, dan background netral agar teks tetap terbaca.

---

## 10. Core Visual Motifs

### 10.1 Crop frame

Crop frame menandai tindakan menangkap atau memeriksa struk.

Gunakan hanya pada:

- Camera/upload area.
- Processing state.
- Receipt review.
- Logo atau ikon aplikasi dalam bentuk yang disederhanakan.

Jangan digunakan sebagai border dekoratif pada seluruh card.

### 10.2 Tracking line

Tracking line adalah satu garis visual yang menghubungkan:

1. Foto struk.
2. Hasil ekstraksi.
3. Transaksi yang disimpan.
4. Insight atau grafik.

Aturan:

- Ketebalan 1.5–2 px.
- Mineral Blue untuk alur netral.
- Signal Leaf untuk progres selesai.
- Warning/Error menggunakan token semantic, bukan mengganti seluruh garis.
- Pada mobile, garis dapat bergerak vertikal mengikuti alur.
- Pada desktop, garis dapat berpindah menjadi connector horizontal atau highlight terpilih.

Tracking line harus menjelaskan hubungan atau progres. Jangan digunakan sebagai ornamen tanpa fungsi.

---

## 11. Motion

### 11.1 Durasi

| Token | Durasi | Penggunaan |
|---|---:|---|
| `motion-fast` | 120 ms | Hover, press, focus. |
| `motion-base` | 180 ms | Dropdown, chip, list update. |
| `motion-slow` | 260 ms | Sheet, modal, chart transition. |

### 11.2 Easing

- Enter: `cubic-bezier(0.16, 1, 0.3, 1)`.
- Exit: `cubic-bezier(0.4, 0, 1, 1)`.
- Progress linear hanya digunakan jika progresnya benar-benar terukur.

### 11.3 Aturan

- Motion harus menjelaskan status, hubungan, atau perubahan.
- Jangan menampilkan persentase palsu jika API tidak menyediakan progres sebenarnya.
- Scanning line boleh bergerak selama processing, tetapi harus berhenti saat state selesai/gagal.
- Tidak menggunakan neon glow, particle, bouncing icon, atau endless decorative loop.
- Hormati `prefers-reduced-motion`.

---

## 12. Komponen Utama

### 12.1 Button

#### Primary

- Mineral Blue background, teks putih.
- Untuk satu aksi utama per region.
- Hover/pressed menggunakan Primary Hover.
- Tinggi minimum 44 px.

#### Secondary

- Surface atau transparan.
- Mineral Blue text dengan border.
- Untuk aksi penting yang bukan primary.

#### Tertiary

- Tanpa border.
- Untuk aksi inline dan navigasi sekunder.

#### Destructive

- Error Red.
- Wajib memiliki label eksplisit.
- Penghapusan akun dan data harus memakai confirmation dialog yang menjelaskan dampaknya.

Aturan:

- Maksimal satu primary button pada satu card/dialog.
- Button mobile harus mudah dijangkau dan memiliki touch target minimum 44×44 px.
- Jangan memakai gradient pada button.

### 12.2 Input

- Tinggi minimum mobile: 48 px.
- Tinggi minimum desktop: 44 px.
- Label selalu terlihat; placeholder bukan pengganti label.
- Error muncul dekat field dan menjelaskan tindakan perbaikan.
- Nominal menggunakan keyboard numerik pada mobile.
- Fokus menggunakan focus ring Mineral Blue.

### 12.3 Card

Jenis card:

- **Summary card:** informasi utama, whitespace paling luas.
- **Data card:** chart atau insight, padding medium.
- **Transaction card/row:** lebih padat, berorientasi scanning.
- **Status card:** semantic background, ikon, headline, dan tindakan.
- **Sensitive action card:** border/error treatment yang terkendali.

Card tidak boleh semuanya memiliki padding, radius, dan shadow yang identik.

### 12.4 Badge dan chip

- Badge menunjukkan status tetap seperti `AI`, `Manual`, `Offline`, atau `Perlu ditinjau`.
- Chip digunakan untuk filter interaktif.
- Status tidak hanya dibedakan melalui warna.
- Hindari chip dekoratif yang tidak bisa dipilih atau tidak memberikan informasi.

### 12.5 Dialog dan sheet

- Mobile memakai bottom sheet untuk edit/filter yang singkat.
- Desktop memakai dialog atau side panel sesuai kompleksitas.
- Destructive action tidak boleh memakai bottom sheet yang mudah terpicu tanpa disengaja.
- Fokus keyboard harus terperangkap dengan benar pada modal.

---

## 13. App Shell dan Navigation

### 13.1 Mobile

Gunakan bottom navigation dengan empat tujuan utama:

1. Dashboard
2. Transaksi
3. Scan
4. Profil

Ketentuan:

- Scan menjadi aksi yang jelas tetapi tidak berupa FAB oversized seperti aplikasi sosial.
- Bottom navigation memperhitungkan `safe-area-inset-bottom`.
- Label tetap tampil; jangan hanya menggunakan ikon.
- State aktif memakai Mineral Blue dan perubahan weight/icon yang terukur.
- Fitur fase berikutnya seperti Budget masuk setelah scope-nya aktif, bukan ditampilkan sebagai menu kosong.

### 13.2 Desktop

- Side navigation dengan lebar referensi 232–248 px.
- Konten utama menggunakan grid yang fleksibel.
- Scan tetap terlihat sebagai aksi utama tetapi tidak mendominasi seluruh sidebar.
- Header berisi konteks halaman, rentang waktu, dan aksi terkait—bukan navigasi duplikat.

### 13.3 Tablet

- Side navigation dapat berubah menjadi compact rail.
- Jangan menggunakan bottom navigation dan full sidebar secara bersamaan.

---

## 14. Responsive Behavior per Layar

| Area | Mobile | Desktop |
|---|---|---|
| App shell | Bottom navigation; single-column flow. | Side navigation; multi-column content. |
| Dashboard | Summary → insight → chart → transaksi terbaru. | Summary dan insight sejajar; chart dan transaksi berbagi grid. |
| Transaction list | Full-width rows; filter via sheet. | List/table hybrid; filter inline atau side panel. |
| Manual transaction | Satu kolom; numeric keyboard; sticky save action bila perlu. | Form maksimal 640 px; preview/ringkasan dapat berada di samping. |
| Receipt upload | Full-screen focused flow. | Upload dan panduan dalam panel; receipt review dapat dua kolom. |
| Receipt review | Preview → extracted fields → confirmation. | Preview struk di kiri; field hasil AI di kanan. |
| Chart | Satu visual utama; detail via tap/tooltip. | Dapat menampilkan perbandingan dan legend lebih lengkap. |
| Edit transaction | Bottom sheet atau halaman terfokus. | Dialog/side panel tanpa kehilangan konteks list. |
| Profile/settings | Section bertumpuk. | Dua kolom atau navigation subsection. |
| Authentication | Logo → context kicker → satu authentication card. | Split-screen ringkas: Midnight brand panel dan satu authentication card pada Rice Paper. |

Urutan informasi mobile tidak boleh berasal dari sekadar menumpuk urutan kolom desktop. Prioritas informasi harus ditentukan ulang untuk layar kecil.

### 14.1 Authentication

- Login dan pendaftaran Google menggunakan satu tindakan yang sama; jangan
  membuat tab, form, atau card terpisah yang mengesankan adanya alur berbeda.
- Desktop mempertahankan panel brand Midnight dengan headline ringkas, dua
  proof point, dan authentication card maksimal sekitar `400 px`.
- Mobile menyembunyikan panel naratif desktop. Urutannya adalah logo, context
  kicker, authentication card, lalu satu trust statement ringan.
- Card menjelaskan bahwa akun baru dibuat otomatis setelah Google OAuth tanpa
  menjadikan penjelasan tersebut sebagai tindakan kedua.
- Privacy note dipisahkan dengan divider dan tetap terhubung secara programatis
  ke tombol Google.

---

## 15. Dashboard

### 15.1 Hierarki mobile

Empat prioritas pertama:

1. Total pengeluaran periode aktif.
2. Aksi tambah manual dan scan struk.
3. Insight mingguan terbaru.
4. Distribusi kategori dan transaksi terakhir.

Maksimal 3–4 informasi utama terlihat sekaligus pada viewport awal. Informasi lanjutan menggunakan scroll atau progressive disclosure.

### 15.2 Hierarki desktop

- Ringkasan periode dan insight menjadi anchor utama.
- Chart tidak boleh lebih dominan daripada total dan konteksnya.
- Daftar transaksi terbaru tetap terlihat tanpa membuat dashboard seperti tabel admin.
- Gunakan whitespace untuk membentuk grup, bukan card untuk setiap angka.

### 15.3 Copy

Gunakan:

- “Pengeluaran minggu ini”
- “Kategori terbesar”
- “Sedikit lebih tinggi dari minggu lalu”

Hindari:

- “Financial Performance”
- “Spending efficiency decreased”
- Bahasa yang memberi rasa bersalah atau menghakimi.

---

## 16. Receipt Scan Experience

### 16.1 Focused inspection mode

Saat proses scan dimulai:

- Surface utama dapat berubah ke Midnight.
- Receipt frame menggunakan kontras terang.
- Navigation sekunder direduksi agar fokus tidak pecah.
- Mode ini bersifat sementara dan tidak mengubah seluruh aplikasi menjadi dark theme.

### 16.2 Tahapan

1. Pilih atau ambil foto.
2. Kompres foto.
3. Unggah dengan aman.
4. Baca struk.
5. Kategorikan transaksi.
6. Tinjau hasil.
7. Simpan transaksi.

Copy progres harus mencerminkan proses nyata. Jangan menampilkan tahapan yang sebenarnya tidak terjadi.

### 16.3 Review hasil AI

Field minimum:

- Merchant.
- Total.
- Tanggal.
- Kategori.
- Item, jika berhasil diekstrak.
- Catatan/sumber transaksi.

Aturan:

- Semua hasil AI dapat diedit.
- Sorot field yang kosong atau perlu diperiksa.
- Hindari confidence percentage teknis jika tidak membantu pengguna.
- Tindakan final menggunakan copy “Simpan transaksi”, bukan “Terima hasil AI”.

### 16.4 Tips privasi wajib

Tampilkan sebelum upload:

> Pastikan struk tidak menampilkan nomor kartu lengkap sebelum upload.

Tips harus terlihat tetapi tidak dibuat seperti pesan error.

### 16.5 Graceful degradation

Jika kuota AI habis:

- Jelaskan bahwa fitur AI sementara tidak tersedia.
- Tawarkan input manual tanpa kehilangan foto atau konteks bila aman dilakukan.
- Jangan menampilkan error API, model, atau status code kepada pengguna.

Contoh:

> Pemindaian AI sedang sibuk. Kamu masih bisa mencatat transaksi secara manual dan mencoba scan lagi nanti.

---

## 17. Transaction Experience

### 17.1 Transaction row

Urutan visual:

1. Merchant atau catatan utama.
2. Kategori dan sumber.
3. Tanggal.
4. Nominal.

Nominal harus mudah dibandingkan secara vertikal. Gunakan tabular numerals dan alignment konsisten.

### 17.2 Source label

Sumber transaksi:

- Manual
- AI · Struk
- WhatsApp, ketika fase terkait aktif

Sumber bukan status kualitas. Transaksi dari AI tetap dapat valid setelah ditinjau.

### 17.3 Edit dan delete

- Edit harus mudah ditemukan dari detail atau context menu.
- Delete transaksi memerlukan konfirmasi ringkas.
- Hapus akun memerlukan konfirmasi yang jauh lebih kuat dan tidak disamakan dengan delete transaksi.

---

## 18. System States

Setiap fitur utama wajib memiliki:

- Default.
- Hover/pressed bila relevan.
- Focus.
- Loading.
- Success.
- Empty.
- Error.
- Disabled.
- Offline/cached bila relevan.

### 18.1 Loading

- Gunakan skeleton yang mengikuti bentuk konten.
- Hindari spinner untuk seluruh dashboard jika data cache tersedia.
- Jangan menggeser layout secara drastis saat data selesai dimuat.

### 18.2 Empty

- Jelaskan apa yang belum ada.
- Berikan satu langkah berikutnya.
- Empty state tidak membutuhkan ilustrasi besar.

Contoh:

> Belum ada transaksi bulan ini. Tambahkan secara manual atau scan struk pertamamu.

### 18.3 Offline

- Tampilkan data cache bila tersedia.
- Gunakan badge atau banner ringan yang menjelaskan bahwa data mungkin belum terbaru.
- Jangan menggunakan layar error kosong.

Contoh:

> Kamu sedang offline. Data tersimpan masih bisa dilihat, tetapi perubahan baru akan disinkronkan saat koneksi kembali.

### 18.4 Rate limit

Pesan harus menjelaskan kapan atau bagaimana mencoba lagi, tanpa detail teknis internal.

### 18.5 Destructive

Hapus akun wajib:

- Menjelaskan bahwa transaksi, insight, dan foto struk terkait akan dihapus.
- Menggunakan confirmation step yang disengaja.
- Tidak memakai pola visual yang mudah tertukar dengan logout.

---

## 19. UX Writing

### 19.1 Tone

- Ringkas.
- Tenang.
- Spesifik.
- Tidak menghakimi.
- Tidak terlalu formal.
- Tidak dipenuhi emoji.

Emoji bukan bagian default voice. Gunakan hanya jika benar-benar membantu nada pada momen tertentu dan tidak menggantikan informasi.

### 19.2 Pola pesan

Gunakan pola:

1. Apa yang terjadi.
2. Dampaknya.
3. Apa yang dapat dilakukan.

Contoh:

> Struk belum berhasil dibaca. Foto masih aman dan belum disimpan sebagai transaksi. Coba foto ulang dengan pencahayaan yang lebih terang.

### 19.3 Istilah konsisten

- Gunakan “scan struk”, bukan bergantian antara scan, OCR, analyze, atau process.
- Gunakan “transaksi”, bukan bergantian dengan entry atau record.
- Gunakan “pengeluaran” untuk expense.
- Gunakan “insight” hanya pada nama fitur; isi insight tetap memakai bahasa Indonesia yang natural.

---

## 20. Accessibility

Target minimum: WCAG 2.2 AA.

- Text contrast minimal 4.5:1 untuk teks normal.
- Large text contrast minimal 3:1.
- Focus indicator selalu terlihat.
- Touch target minimum 44×44 px.
- Form memiliki label eksplisit dan error yang terhubung secara programatis.
- Semua interaksi utama dapat dijalankan dengan keyboard.
- Chart memiliki ringkasan teks dan tidak mengandalkan warna saja.
- Motion menghormati `prefers-reduced-motion`.
- Gunakan heading hierarchy yang benar.
- Status async diumumkan melalui mekanisme yang sesuai untuk screen reader.
- Jangan menonaktifkan zoom pada mobile.
- Layout harus tetap dapat digunakan saat text scaling meningkat.

---

## 21. PWA-Specific Design Rules

- Bottom navigation memperhitungkan safe area perangkat.
- Standalone mode tidak boleh kehilangan akses ke navigation atau logout.
- Install prompt tidak boleh menghalangi tugas utama.
- Offline fallback menggunakan bahasa dan visual yang sama dengan aplikasi.
- PWA icon harus tetap terbaca pada berbagai mask shape.
- Loading awal menggunakan background Rice Paper agar tidak muncul white flash yang bertentangan dengan brand.
- Jangan mengandalkan hover untuk memahami aksi pada perangkat sentuh.

---

## 22. Anti-Generic Guardrails

Implementasi dianggap menyimpang jika menggunakan:

- Gradient ungu-biru sebagai identitas AI.
- Glow neon, particle, atau floating orb.
- Glassmorphism sebagai style card utama.
- Inter atau system UI sebagai font utama tanpa keputusan baru yang disetujui.
- Semua card dengan radius, padding, dan shadow yang sama.
- Dashboard gelap dominan.
- Signal Leaf sebagai warna brand utama.
- Template shadcn/ui atau component library lain tanpa retokenisasi.
- Hero dashboard berisi angka besar tanpa konteks yang berguna.
- Terlalu banyak badge, chip, atau ikon dekoratif.
- Copy generik seperti “Manage your finances smarter”.

Component library boleh dipakai sebagai fondasi perilaku dan aksesibilitas, tetapi tampilan akhirnya harus mengikuti token dan hierarki dalam dokumen ini.

---

## 23. Developer Handoff Tokens

Referensi CSS custom properties:

```css
:root {
  --color-canvas: #f6f2e8;
  --color-canvas-subtle: #fcfbf7;
  --color-surface: #ffffff;
  --color-ink: #0b1220;
  --color-ink-secondary: #53606c;
  --color-ink-warm-muted: #6b665e;

  --color-primary: #285a73;
  --color-primary-hover: #1f465a;
  --color-primary-soft: #dceaf0;

  --color-signal: #b9d86e;
  --color-signal-ink: #526827;
  --color-signal-soft: #edf5d5;

  --color-expense: #d96c52;
  --color-expense-ink: #a63d2a;
  --color-expense-soft: #f8e2db;

  --color-error: #b42318;
  --color-error-soft: #fde8e7;
  --color-warning-ink: #8a3c00;
  --color-warning-soft: #fff1d6;

  --color-border: #d9d6cc;
  --color-divider: #e7e3da;
  --color-disabled-bg: #eeeae1;

  --font-display: "Space Grotesk", sans-serif;
  --font-body: "IBM Plex Sans", sans-serif;

  --radius-xs: 0.25rem;
  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.25rem;

  --motion-fast: 120ms;
  --motion-base: 180ms;
  --motion-slow: 260ms;
}
```

Nilai ini adalah sumber awal implementasi. Token semantic tetap lebih penting daripada penggunaan hex secara langsung dalam komponen.

---

## 24. Design Proof dan Definition of Done

Design system belum dianggap terbukti hanya karena dokumen ini selesai. Sebelum implementasi UI penuh, arah harus diterapkan pada design proof berikut dalam mobile dan desktop:

1. Dashboard.
2. Alur scan dan review struk.
3. Daftar/detail transaksi.
4. App shell dan mobile navigation.

State yang minimal harus terlihat:

- Normal.
- Loading.
- Empty.
- Error.
- Offline.
- AI quota/rate limit.
- Hasil AI perlu ditinjau.
- Destructive confirmation.

Kriteria penerimaan:

- Dalam sekitar lima detik, fungsi utama layar dapat dipahami.
- Total, merchant, kategori, tanggal, dan nominal memiliki hierarki jelas.
- Hasil AI selalu dapat diperiksa dan dikoreksi.
- Mobile terasa dirancang terlebih dahulu, bukan desktop yang diperkecil.
- Desktop terlihat profesional tanpa menjadi dashboard admin yang padat.
- Identitas tetap dikenali ketika logo tidak terlihat.
- Seluruh pasangan warna aktual memenuhi WCAG AA.
- Tidak ada pola visual yang menyerupai template fintech/crypto generik.
- Pengujian singkat dengan 1–2 beta user mencakup input manual, scan, koreksi, dan menemukan transaksi.

Jika design proof gagal pada kriteria di atas, perbaiki token atau aturan terkait dan catat perubahannya di dokumen ini. Jangan mengganti arah desain hanya karena preferensi sesaat.

---

## 25. CP5-Validated Implementation Contracts

Bagian ini menerapkan temuan terukur dari CP5-R0 tanpa mengubah arah, core
palette, typeface, logo geometry, hierarchy, atau interaction architecture.

### 25.1 Overflow dan intrinsic sizing

- Semua flex/grid child yang dapat menyusut memakai `min-width: 0`.
- Badge menggunakan intrinsic width dan horizontal padding; satu fixed width
  tidak boleh dipakai untuk seluruh copy.
- Critical action label tidak boleh dipotong atau diberi ellipsis.
- Text container memakai `min-height` ketika text scaling dapat menambah baris.
- Layout harus stack sebelum type scale penting dikecilkan.

### 25.2 Weekly-summary correction

- Label visual compact: `Minggu ini`.
- Accessible name/context tetap “Pengeluaran minggu ini”.
- Right subcolumn: `minmax(176px, 0.36fr)`.
- Subcolumn harus stack bila minimum width tidak tersedia.

### 25.3 Runtime text floor

- Critical metadata minimum `12 px`.
- Navigation label minimum `11 px`.
- Ukuran `10 px` hanya untuk annotation atau non-critical chrome.

### 25.4 Desktop dan async source of truth

- Sidebar desktop final: `240 px`.
- Compact rail pada `1024 px`: `72 px`, dengan content padding `24 px`.
- Nilai `280 px` pada logo context-test board bukan runtime token.
- CP4 upload-ready dan processing frames mengalahkan CP3 comparison board
  untuk implementasi async state.

### 25.5 Implementation QA viewports

UI harus diperiksa pada `360`, `390`, `768`, `1024`, `1280`, dan `1440 px`,
ditambah browser zoom `200%` dan mobile text scaling.

### 25.6 Source authority

Final locks, generator SVG lokal, token JSON/CSS, serta export SVG/PNG lokal
adalah source handoff yang dapat diverifikasi. Figma dapat dipakai kembali
ketika koneksinya tersedia, tetapi bukan satu-satunya editable source.

CP5-R0 final mengunci design contract. Installed-PWA physical-device test,
beta-user test, dan runtime accessibility tetap merupakan implementation
validation gates; status final desain tidak boleh dipakai sebagai bukti bahwa
ketiganya telah lulus.

---

### 25.7 Account deletion implementation (F1-CP10)

- Profile keeps identity/logout separate from export and account deletion.
- Sensitive action uses controlled Error Red border/text, never expense color.
- Confirmation is a centered native modal, max-width `640px`, with viewport-
  bounded scrolling and at least `16px` outer margins on mobile.
- Show the signed-in email, affected Fintrack data, Google-account exclusion,
  irreversibility, and exact `HAPUS` confirmation. Initial focus: Batal.
- Buttons stack on mobile and sit side by side when labels fit. Controls remain
  at least `48px` high; email can wrap without clipping critical labels.
- Pending cleanup is a focused single-column page, not a cancellable dialog.
  Report actual pending/error status without invented percentages. No return
  to financial data while the account is being deleted.
- CP10 reuses existing brand tokens, fonts, and navigation. Its focused owner QA
  covers mobile/desktop, keyboard, and zoom together; no new brand direction.

---

## 26. Change Policy

Perubahan berikut membutuhkan persetujuan eksplisit:

- Mengganti arah Quiet Signal — Refined.
- Mengubah font utama.
- Mengubah Mineral Blue, Rice Paper, atau Midnight sebagai warna inti.
- Membuat dashboard dark-first.
- Mengubah fungsi semantic Signal Leaf, Warm Coral, atau Error Red.
- Menghapus focused inspection mode pada scan struk.
- Mengubah struktur navigation utama.

Perubahan berikut dapat dilakukan setelah verifikasi:

- Penyesuaian kecil shade untuk meningkatkan kontras.
- Penyesuaian spacing atau type scale berdasarkan device testing.
- Penyesuaian breakpoint tanpa mengubah perilaku responsive.
- Penyesuaian motion untuk performa atau reduced-motion.
- Penambahan token kategori ketika fitur baru benar-benar aktif.

Semua perubahan harus menjaga prinsip:

> Precision Without Anxiety.
