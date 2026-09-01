# Typographic Alignment Verdict

## Putusan

Gunakan:

- **Simbol:** Baseline A — Signal Frame F.
- **Horizontal lockup:** hubungan ukuran dan spacing dari T2 — Separate Icon.
- **Wordmark:** `Fintrack AI` dalam Space Grotesk SemiBold.

Jangan gunakan:

- D2 Hybrid sebagai lockup saat ini karena monogram terlihat terlalu
  typographic tetapi tidak cukup selaras dengan glyph `F`.
- T1 Integrated F karena crop frame berubah menjadi tanda baca di dalam kata.

## Apa yang benar-benar diuji

| Pemeriksaan | Baseline A | T1 Integrated F | T2 Separate Icon |
|---|---|---|---|
| Simbol terbaca sebagai `F` | Lulus | Lulus | Lulus |
| Wordmark langsung terbaca | Lulus | **Gagal** | Lulus |
| Hubungan simbol–type terasa disengaja | Cukup | Gagal | **Lulus** |
| Scan cue bertahan | Lulus | Cukup | Lulus |
| Lockup 24 px | Lulus | Gagal | Lulus dengan detail berkurang |
| Lockup 32–48 px | Lulus | Cukup | **Lulus** |
| Professional restraint | Cukup | Cukup | **Paling kuat** |

## Mengapa T2 menang

T2 tidak mencoba membuat ikon terlihat seperti huruf font. Ikon tetap memakai
bahasa monoline Baseline A, sedangkan wordmark tetap typographic. Perbedaannya
menjadi contrast yang disengaja.

Ukuran ikon diturunkan dari lockup awal dan disetarakan secara optis terhadap
cap-height wordmark. Hasilnya:

- ikon tidak bersaing dengan glyph `F` pada kata `Fintrack`;
- scan cue tetap terlihat;
- wordmark menjadi fokus baca utama;
- lockup terasa lebih profesional tanpa mengganti identitas simbol.

## Catatan untuk LOGO-R1

Jika owner memilih hasil ini, LOGO-R1 harus:

1. menghaluskan spacing simbol–wordmark;
2. membuat optical mark khusus untuk 16–20 px;
3. menguji primary, monochrome, dan reverse;
4. menguji favicon serta PWA icon 192/512 px;
5. menetapkan clear space dan minimum lockup size;
6. menguji wordmark pada mobile app bar dan desktop sidebar.

