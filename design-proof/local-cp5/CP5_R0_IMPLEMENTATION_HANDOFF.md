# CP5-R0 Implementation Handoff

Status: **FINAL / LOCKED**

Dokumen ini adalah implementation contract. Status siap review bukan bukti bahwa
aplikasi sudah diimplementasikan; seluruh correction contract tetap wajib
diterapkan dan diuji pada codebase produksi.

## 1. Authority order

Jika terdapat perbedaan:

1. Product brief dan hard scope.
2. `DESIGN_SYSTEM.md`.
3. CP1–CP4 final locks.
4. CP5 correction contract.
5. `final-design-tokens.json` dan `final-design-tokens.css`.
6. `responsive-contract.json`.
7. `component-state-matrix.json`.
8. PNG/SVG sebagai visual reference.
9. Exploration/comparison boards.

PNG/SVG tidak mengalahkan correction contract ketika proof mempunyai clipping
atau positioning defect yang sudah dicatat.

## 2. Yang harus diikuti

- Quiet Signal — Refined.
- Rice Paper sebagai root canvas.
- Midnight hanya untuk navigation dan focused inspection.
- Mineral Blue sebagai primary action.
- Signal Leaf sebagai aksen semantic terbatas.
- Space Grotesk dan IBM Plex Sans.
- Hierarchy CP1.
- Mobile-first navigation CP2.
- Desktop Editorial Ledger + contextual Split Workspace CP3.
- Guided Linear, Contextual Inline, dan Recovery First dari CP4.
- Semua hasil AI editable.
- Tidak ada fake progress atau confidence percentage.

## 3. Koreksi teknis yang boleh dilakukan langsung

Programmer boleh memperbaiki tanpa meminta redesign:

- clipping dan overflow;
- fractional-pixel alignment;
- container padding yang tidak konsisten;
- button/badge intrinsic sizing;
- text wrapping yang aman;
- `min-width: 0` pada grid/flex child;
- baseline dan icon optical alignment;
- safe-area inset;
- browser font rendering;
- breakpoint kecil yang tidak mengubah responsive behavior;
- focus ring dan semantic markup.

Perbaikan tersebut harus mempertahankan hierarchy, copy meaning, token
semantic, dan component role.

## 4. Perubahan yang harus dikonfirmasi

- Mengganti font atau core palette.
- Mengubah navigation utama.
- Menghapus focused inspection mode.
- Mengubah urutan scan/review.
- Membuat dashboard dark-first.
- Mengubah fungsi Signal Leaf, Warm Coral, atau Error Red.
- Menggabungkan upload dan processing menjadi state bersamaan.
- Menghapus manual fallback.
- Menambah metric-card wall, gradient AI, glow, atau glassmorphism.

## 5. Layout implementation rules

### Global

- Gunakan `box-sizing: border-box`.
- Semua flex/grid child yang dapat menyusut memakai `min-width: 0`.
- Container text memakai `overflow-wrap: anywhere` hanya untuk data panjang;
  label UI memakai wrapping yang disengaja.
- Critical label tidak boleh diselesaikan dengan `overflow: hidden` +
  ellipsis kecuali list yang memang mempunyai detail view.
- Gunakan `min-height`, bukan fixed height, pada container yang memuat body
  text atau status.

### Mobile

- Horizontal padding `16px`.
- Primary control minimum `48px`; touch target absolut minimum `44px`.
- Bottom navigation memperhitungkan `env(safe-area-inset-bottom)`.
- Dua action dapat sejajar hanya jika label tetap utuh pada `360px`;
  selain itu stack.

### Tablet / compact desktop

- `768–1023px`: compact rail atau mobile navigation berdasarkan context,
  tidak keduanya.
- Pada `1024px`, gunakan compact rail `72px` dan content padding `24px`.
- Preview/form dapat stack sebelum typography dikecilkan.

### Desktop

- Sidebar final `240px`, bukan `280px`.
- Content padding `32px`; wide `40px`.
- Grid 12 kolom, gutter `24px`.
- Weekly subcolumn mengikuti FT-PREC-001.

## 6. State and async behavior

- Async state berubah karena event nyata, bukan timer dekoratif.
- Loading mempertahankan geometry agar layout tidak melompat.
- Error mempertahankan foto/input/draft.
- Offline menampilkan cache bila tersedia.
- Success non-blocking dan data utama sudah diperbarui.
- Destructive dialog: fokus awal `Batal`, focus trap, `Escape`, focus return.
- `prefers-reduced-motion` menghapus transform dan decorative movement.

## 7. Implementation QA gate

Sebelum UI dianggap sesuai:

1. screenshot `360`, `390`, `768`, `1024`, `1280`, dan `1440px`;
2. visual comparison terhadap proof + CP5 corrections;
3. keyboard-only pass;
4. 200% browser zoom;
5. text scaling/mobile font scaling;
6. screen-reader smoke test;
7. reduced-motion pass;
8. offline/cache and error recovery pass;
9. favicon/PWA install test;
10. no console error.

Setiap intentional deviation dicatat dengan:

- source rule;
- reason;
- screenshot;
- accessibility/technical impact;
- approval status.
