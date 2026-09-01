# CP5-R0 Accessibility Matrix

Target desain: **WCAG 2.2 AA**  
Status: **Design contract ready; runtime verification pending**

| Area | Design requirement | Runtime evidence required |
|---|---|---|
| Contrast | Text normal `≥4.5:1`; large/UI `≥3:1` | Computed styles in browser |
| Keyboard | Semua aksi utama reachable; urutan mengikuti visual | Keyboard-only walkthrough |
| Focus | Ring `2px` Mineral Blue + offset `2px` | Screenshot focus setiap control |
| Touch | Minimum `44×44px`; main mobile control `48px` | Browser box measurement |
| Form | Label persisten; error dekat field | `label`, `aria-describedby`, error id |
| Dialog | Fokus awal aman; trap; Escape; return | Runtime focus assertions |
| Async | Status tenang dan spesifik | `aria-live`/status announcement |
| Offline | Cache tetap terlihat; batas jelas | Network-off simulation |
| Chart | Summary teks dan nilai tidak color-only | Accessible name/data table |
| Motion | Tidak dekoratif; reduced motion | OS/browser reduced-motion test |
| Zoom | Tidak ada clipping pada 200% | Browser zoom screenshot |
| Text scaling | Container bertambah tinggi | Mobile/system font scaling |
| Navigation | Landmark dan active state terbaca | Screen-reader smoke test |
| Receipt | Preview diberi context, bukan decorative image | Accessible description |

## Focus order

### Mobile dashboard

1. Header/account.
2. Period control bila interaktif.
3. Tambah manual.
4. Scan struk.
5. Insight/detail action.
6. Chart detail.
7. Transaction rows.
8. Bottom navigation.

### Mobile scan

1. Kembali.
2. Batal.
3. Photo source.
4. Privacy information.
5. Primary action.
6. Secondary action.
7. Review fields.
8. Save.

### Desktop transactions

1. Skip link.
2. Sidebar navigation.
3. Page actions.
4. Search.
5. Filter.
6. Transaction list.
7. Active side panel fields.
8. Save/delete actions.

## Async announcements

| State | Announcement intent |
|---|---|
| Loading | “Ringkasan sedang dimuat.” |
| Processing | “Struk sedang diperiksa.” |
| Offline | “Kamu sedang offline. Data tersimpan masih bisa dilihat.” |
| Upload error | “Foto belum berhasil diunggah. Foto tetap tersedia.” |
| Save error | “Perubahan belum tersimpan. Edit tetap dipertahankan.” |
| Success | “Transaksi berhasil disimpan.” |
| Quota | “Pemindaian AI sedang sibuk. Input manual tetap tersedia.” |

Announcement tidak boleh berulang pada setiap decorative animation frame.

## Text-size handoff

- Display mengikuti token responsive.
- Body utama minimum `16px`.
- Form dan button `15–16px`.
- Metadata runtime minimum `12px`.
- Navigation label minimum `11px`.
- Ukuran `10px` hanya untuk non-critical chrome/board annotation dan tidak
  menjadi satu-satunya penyampai informasi penting.

## Pending

Matrix ini tidak mengklaim semantic HTML atau assistive-technology output
sudah lulus. Bukti tersebut hanya dapat diperoleh dari implementasi browser.
