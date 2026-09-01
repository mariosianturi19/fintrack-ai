# Fintrack AI — LOGO-R1 Specification

## 1. Status

- Revision: `LOGO-R1`
- Status: **FINAL / LOCKED FOR DESIGN PROOF**
- Confirmed by: Mario Sianturi
- Confirmation date: `2026-07-29`
- Selected direction: **Baseline A — Refined Lockup**
- Intended use: approved provisional brand system for CP2–CP4
- Production lock: pending CP5

LOGO-R1 bukan arah logo baru. Revisi ini menyempurnakan arah yang telah
dikunci pada LOGO-R0 melalui optical correction, micro-size correction,
production colorways, spacing rules, dan context tests.

## 2. Brand idea

Signal Frame F menggabungkan:

1. `F` sebagai identitas Fintrack.
2. Dua crop corners sebagai isyarat proses scan.
3. Open frame sebagai simbol proses AI yang dapat ditinjau dan dikoreksi.

Logo sengaja tidak menggambar struk, grafik naik, dompet, koin, robot, atau
sparkle secara literal. Receipt tetap menjadi supporting visual language di
interface, bukan beban tambahan pada primary mark.

## 3. Optical decision

Tiga bobot diuji:

| Variant | Main / corner stroke | Verdict |
|---|---:|---|
| O1 — Baseline | `18 / 18` | Crop frame terlalu dominan dan bersaing dengan `F`. |
| O2 — Refined | `17 / 12.5` | Hierarki paling seimbang; `F` dominan, scan cue tetap terbaca. |
| O3 — Precision | `16 / 10.5` | Terlihat elegan saat besar, tetapi corners melemah pada 20–24 px. |

**Selected master: O2 — Refined.**

Keputusan ini bukan kompromi rata-rata. O2 mempertahankan makna produk tanpa
membuat mark terasa seperti ikon scanner generik atau simbol teknis yang tipis.

## 4. Geometry

### Master mark

- ViewBox: `0 0 160 160`
- Main stroke: `17`
- Corner stroke: `12.5`
- Cap: rounded
- Default size: `24 px` ke atas

### Micro mark

- ViewBox: `0 0 160 160`
- Main stroke: `20`
- Corner stroke: `14`
- Cap: square
- Intended size: `16–23 px`

Micro mark bukan redesign. Penambahan bobot dan square caps hanya mengurangi
hilangnya detail akibat pixel rounding. Pada 16 px, pembacaan `F` adalah
prioritas; crop-frame cue boleh menjadi lebih sekunder.

### Horizontal lockup

- ViewBox: `0 0 492 72`
- Wordmark: `Fintrack AI`
- Typeface source: Space Grotesk
- Weight: `600`
- Asset form: outlined SVG path
- Mark dan wordmark tetap dua unit terpisah; simbol tidak menggantikan glyph
  `F`.

Lockup canvas dibuat ketat agar ukuran CSS merepresentasikan ukuran visual yang
nyata, bukan kanvas kosong yang besar.

## 5. Colorways

| Variant | Mark | Wordmark | Background |
|---|---:|---:|---:|
| Primary | `#285A73` | `#0B1220` | `#F6F2E8` atau clean light surface |
| Reverse | `#F6F2E8` | `#F6F2E8` | `#0B1220` |
| Monochrome dark | `#0B1220` | `#0B1220` | light surface |
| Monochrome light | `#FFFFFF` | `#FFFFFF` | sufficiently dark surface |

Signal Leaf, Warm Coral, gradient, opacity treatment, dan multicolor category
palette tidak digunakan pada logo.

## 6. Clear space

`x` adalah ketebalan vertical stem master mark pada ukuran pemakaian.

- Standalone mark: minimum `1x` pada keempat sisi.
- Lockup: minimum `1x` mengelilingi keseluruhan visible bounding box.
- Tidak boleh ada text, icon, crop edge, atau container edge yang memasuki area
  tersebut.

Clear space boleh diperbesar, tetapi tidak boleh diperkecil untuk mengejar
kepadatan layout.

## 7. Minimum digital size

| Asset | Range |
|---|---:|
| Micro standalone mark | `16–23 px` |
| Master standalone mark | `24 px+` |
| Compact horizontal lockup | `24–27 px high` |
| Master horizontal lockup | `28 px high+` |
| Recommended interface lockup | `28–32 px high` |

Pada ukuran di bawah 24 px, gunakan standalone micro mark dan jangan memaksakan
wordmark.

## 8. PWA and favicon

- Favicon exports: `16 × 16` dan `32 × 32`.
- Standard PWA exports: `192 × 192` dan `512 × 512`.
- Maskable PWA exports: `192 × 192` dan `512 × 512`.
- Background icon: opaque Rice Paper.
- Critical mark geometry berada di dalam centered safe-zone circle dengan
  radius 40% dari ukuran icon.

Aturan safe zone mengikuti
[W3C Web Application Manifest](https://www.w3.org/TR/appmanifest/).
Preview rounded-square pada review board hanya simulasi konteks; file maskable
tetap menyimpan background penuh sampai tepi.

## 9. Interface behavior

### Mobile

- Gunakan horizontal lockup pada app bar bila ruang cukup.
- Gunakan standalone mark bila app bar padat atau title halaman membutuhkan
  prioritas.
- Preferred visible height: sekitar `28–32 px`.

### Desktop

- Sidebar memakai master horizontal lockup.
- Jangan memperbesar logo sampai menjadi fokus utama dashboard.
- Alignment harus mengikuti navigation grid, bukan center dekoratif.

### Focused inspection mode

Gunakan reverse logo pada Midnight. Jangan menambahkan glow atau animasi scan
ke logo; motion scan berada pada receipt viewport, bukan brand mark.

## 10. Do not

- Stretch, skew, rotate, outline ulang, atau mengubah proporsi mark.
- Memindahkan, menambah, atau melengkapi crop corners menjadi frame penuh.
- Menggunakan master mark di bawah 24 px.
- Menggunakan master lockup pada 24–27 px; gunakan compact lockup.
- Menambahkan shadow, bevel, glass, glow, atau gradient.
- Menggunakan Signal Leaf sebagai warna logo.
- Mengetik ulang wordmark dengan live text pada production asset.
- Menempatkan primary logo di atas foto atau background berkontras rendah.

## 11. Approval record and production boundary

Owner telah menyetujui:

- O2 sebagai master mark.
- Hubungan ukuran dan jarak symbol–wordmark.
- Primary, reverse, dan monochrome treatment.
- Master/micro serta compact/master size rules.
- Mobile, desktop, dan PWA presence.

Dengan konfirmasi tersebut, LOGO-R1 berstatus final dan locked untuk design
proof. Asetnya disetujui sebagai sistem provisional untuk CP2–CP4. Production
lock tetap dilakukan pada CP5 setelah logo terbukti konsisten di seluruh
interface, responsive layouts, browser favicon, installed PWA, dan export akhir.
