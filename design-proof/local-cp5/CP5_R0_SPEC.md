# Fintrack AI — CP5-R0 Visual QA & Handoff Specification

Status: **FINAL / LOCKED**  
Direction: **Quiet Signal — Refined**  
Date: **2026-07-29**

## 1. Input terkunci

- CP1-R1 — Content Hierarchy & Low-fidelity.
- LOGO-R1 — Baseline A, Refined Lockup.
- CP2-R0 — High-fidelity Mobile.
- CP3-R0 — Desktop Adaptation.
- CP4-R0 — States & Prototype.
- `DESIGN_SYSTEM.md` versi `1.1`.

## 2. Tujuan

CP5-R0 dinyatakan siap masuk owner review jika:

1. semua artefak yang authoritative terinventarisasi;
2. clipping, overflow, alignment, spacing, baseline, dan safe padding diaudit;
3. temuan mempunyai severity, evidence, correction, dan implementation rule;
4. mobile, tablet transition, desktop, dan wide behavior mempunyai kontrak;
5. accessibility design requirements dipisahkan dari runtime proof;
6. token final dapat dibaca mesin dan konsisten dengan dokumentasi;
7. programmer mempunyai aturan deviasi yang jelas;
8. limitation atau validasi eksternal tidak diklaim selesai tanpa bukti.

## 3. Scope visual

Audit utama mencakup:

- 10 frame mobile CP2 pada `390 × 844`;
- 3 mobile spot-check pada `360 × 844`;
- 6 frame desktop CP3 pada `1440 × 1024`;
- 3 desktop spot-check pada `1280 × 1024`;
- 12 state/runtime frame CP4;
- prototype CP4;
- LOGO-R1 lockup, mark, favicon, standard PWA, dan maskable PWA assets;
- transition contract `768–1024 px`.

Exploration board CP1, LOGO-R0, hybrid study, dan rejected desktop directions
tidak menjadi visual authority implementasi.

## 4. Severity

| Level | Makna | Tindakan |
|---|---|---|
| P0 | Mengubah keselamatan/data atau membuat flow mustahil | Block handoff |
| P1 | Hierarchy/flow/accessibility utama rusak | Block owner approval |
| P2 | Defect visual nyata atau risiko responsive tinggi | Wajib memiliki correction contract |
| P3 | Klarifikasi, consistency, atau artifact precedence | Wajib terdokumentasi |
| Pending | Membutuhkan runtime/device/user eksternal | Tidak boleh diklaim lulus |

## 5. Acceptance criteria

- Tidak ada P0/P1 terbuka.
- Setiap P2 mempunyai before/after dan nilai koreksi.
- Tidak ada teks atau badge penting yang sengaja dibiarkan terpotong.
- Critical text tidak bergantung pada ukuran ilustrasi mockup.
- Semua control utama mempunyai target minimum `44 × 44 px`.
- Layout menggunakan `min-width: 0`, intrinsic sizing, dan wrapping yang aman.
- Status tidak hanya memakai warna.
- Contrast pair aktual minimal WCAG 2.2 AA.
- 1024 px tidak menampilkan full sidebar dan bottom navigation bersamaan.
- 1280 px mengubah rasio/komposisi sebelum mengecilkan type scale.
- 1440 px membatasi content dan menambah whitespace.
- Signal Leaf tetap maksimal sekitar 3–5% area visual.
- Tidak ada gradient AI, glassmorphism, glow, atau component-library default.
- Token JSON dan CSS konsisten.
- Handoff menjelaskan bagian yang boleh dikoreksi programmer dan bagian yang
  memerlukan persetujuan desain.

## 6. Deliverables

- QA overview board.
- Precision correction board.
- Accessibility + responsive board.
- Handoff authority map.
- Compact dashboard `1024 px` proof.
- Visual QA report.
- Accessibility matrix.
- Implementation handoff.
- Responsive contract.
- Component-state matrix.
- Final token JSON dan CSS.
- Asset inventory dengan SHA-256.
- Design-system delta proposal.
- Beta-test script.
- Self-critique dan automated verification report.
- Local handoff package.

## 7. Tidak dibuktikan oleh CP5 statis

- Backend, database, dan AI nyata.
- Runtime semantic HTML.
- Screen-reader output aktual.
- Browser zoom/text scaling aktual.
- Camera permission dan upload pada perangkat nyata.
- Installed PWA pada perangkat fisik.
- Beta-user result yang belum dilakukan.
