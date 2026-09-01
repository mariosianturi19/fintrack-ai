const assets = {
  mobile: {
    dashboard: "../../local-cp2/mobile/mobile-dashboard-default-cp2-r0.png",
    dashboardStates:
      "../../local-cp2/mobile/mobile-dashboard-states-cp2-r0.png",
    scanStart: "../../local-cp2/mobile/mobile-scan-start-cp2-r0.png",
    upload: "../../local-cp2/mobile/mobile-scan-upload-cp2-r0.png",
    processing: "../../local-cp2/mobile/mobile-scan-processing-cp2-r0.png",
    review: "../../local-cp2/mobile/mobile-scan-review-cp2-r0.png",
    quota: "../../local-cp2/mobile/mobile-scan-quota-error-cp2-r0.png",
    transactions:
      "../../local-cp2/mobile/mobile-transactions-list-cp2-r0.png",
    edit: "../../local-cp2/mobile/mobile-transaction-detail-edit-cp2-r0.png",
    destructive:
      "../../local-cp2/mobile/mobile-destructive-confirmation-cp2-r0.png",
    uploadError:
      "../states/mobile/mobile-scan-upload-error-cp4-r0.png",
    offline: "../states/mobile/mobile-scan-offline-cp4-r0.png",
    saveError:
      "../states/mobile/mobile-transaction-save-error-cp4-r0.png",
    scanSuccess:
      "../states/mobile/mobile-scan-saved-success-cp4-r0.png",
    manual:
      "../states/mobile/mobile-manual-entry-fallback-cp4-r0.png",
  },
  desktop: {
    dashboard:
      "../../local-cp3/desktop/desktop-dashboard-default-cp3-r0.png",
    dashboardStates:
      "../../local-cp3/desktop/desktop-dashboard-states-cp3-r0.png",
    upload:
      "../states/desktop/desktop-scan-upload-ready-cp4-r0.png",
    processing:
      "../states/desktop/desktop-scan-processing-cp4-r0.png",
    review: "../../local-cp3/desktop/desktop-scan-review-cp3-r0.png",
    transactions:
      "../../local-cp3/desktop/desktop-transactions-detail-cp3-r0.png",
    uploadError:
      "../states/desktop/desktop-scan-upload-error-cp4-r0.png",
    quota:
      "../states/desktop/desktop-scan-quota-fallback-cp4-r0.png",
    saveSuccess:
      "../states/desktop/desktop-transaction-save-success-cp4-r0.png",
    destructive:
      "../states/desktop/desktop-transaction-delete-confirmation-cp4-r0.png",
    manual:
      "../states/desktop/desktop-manual-entry-fallback-cp4-r0.png",
  },
};

const hotspot = (label, target, x, y, width, height) => ({
  label,
  target,
  x,
  y,
  width,
  height,
});

const nodes = {
  mobile: {
    scan: {
      dashboard: {
        title: "Dashboard",
        description: "Mulai alur dari aksi Scan struk.",
        image: assets.mobile.dashboard,
        announce: "Dashboard siap. Aksi Scan struk tersedia.",
        hotspots: [
          hotspot("Scan struk", "scan-start", 51.5, 25.2, 44.6, 5.8),
        ],
      },
      "scan-start": {
        title: "Pilih foto",
        description: "Tips privasi terlihat sebelum foto diproses.",
        image: assets.mobile.scanStart,
        announce: "Pilih foto struk. Pastikan nomor kartu lengkap tidak terlihat.",
        hotspots: [
          hotspot("Kembali ke dashboard", "dashboard", 2, 4.1, 12, 5.6),
          hotspot("Ambil foto", "upload", 4, 70.2, 92, 6.2),
          hotspot("Pilih dari galeri", "upload", 4, 77.2, 92, 6.2),
        ],
      },
      upload: {
        title: "Kompresi dan upload",
        description:
          "Prototype menunggu event nyata; tidak ada auto-advance atau persen palsu.",
        image: assets.mobile.upload,
        announce: "Foto dikompres dan sedang diunggah dengan aman.",
        async: true,
        eventTarget: "processing",
        hotspots: [
          hotspot("Batalkan dan kembali", "scan-start", 82, 3.7, 16, 5.4),
        ],
      },
      processing: {
        title: "Pemeriksaan AI",
        description:
          "Focused inspection mode berjalan sampai respons AI diterima.",
        image: assets.mobile.processing,
        announce: "AI sedang menyusun hasil. Tidak ada persentase palsu.",
        async: true,
        eventTarget: "review",
        hotspots: [
          hotspot("Batalkan pemeriksaan", "scan-start", 82, 3.7, 16, 5.4),
        ],
      },
      review: {
        title: "Tinjau hasil scan",
        description: "Kategori perlu diperiksa; seluruh field tetap editable.",
        image: assets.mobile.review,
        announce: "Hasil scan siap ditinjau. Kategori perlu diperiksa.",
        hotspots: [
          hotspot("Kembali ke pemeriksaan", "processing", 2, 4.1, 12, 5.6),
          hotspot("Periksa kategori", "review", 51.5, 48.5, 44.5, 7.3),
          hotspot("Simpan transaksi", "scan-success", 4, 82.2, 92, 7.2),
        ],
      },
      "scan-success": {
        title: "Transaksi tersimpan",
        description:
          "Dashboard sudah diperbarui; success tidak menjadi layar penghalang.",
        image: assets.mobile.scanSuccess,
        announce: "Transaksi Superindo tersimpan. Dashboard diperbarui.",
        hotspots: [
          hotspot("Buka transaksi", "dashboard", 4, 73.5, 92, 7),
        ],
      },
      offline: {
        title: "Offline",
        description: "Foto belum diunggah; manual fallback dan retry tersedia.",
        image: assets.mobile.offline,
        announce: "Kamu sedang offline. Foto tetap berada di perangkat.",
        hotspots: [
          hotspot("Masukkan data manual", "manual-fallback", 4, 87.4, 92, 5.7),
          hotspot("Coba sambungkan lagi", "scan-start", 4, 93.2, 92, 5.7),
        ],
      },
      "upload-error": {
        title: "Upload gagal",
        description: "Foto dan konteks tetap dipertahankan.",
        image: assets.mobile.uploadError,
        announce: "Foto belum berhasil diunggah. Tidak ada data yang hilang.",
        hotspots: [
          hotspot("Coba unggah lagi", "upload", 4, 87.4, 92, 5.7),
          hotspot("Kembali ke foto", "scan-start", 4, 93.2, 92, 5.7),
        ],
      },
      quota: {
        title: "AI quota",
        description: "Pesan ramah menawarkan input manual atau mencoba nanti.",
        image: assets.mobile.quota,
        announce: "Pemindaian AI sedang sibuk. Input manual tersedia.",
        hotspots: [
          hotspot("Masukkan data manual", "manual-fallback", 4, 66.6, 92, 6.4),
          hotspot("Coba scan lagi nanti", "dashboard", 4, 73.2, 92, 6.4),
        ],
      },
      "manual-fallback": {
        title: "Input manual",
        description:
          "Struktur form edit dipakai sebagai handoff; data tidak berasal dari AI.",
        image: assets.mobile.manual,
        announce: "Input transaksi manual siap. Isi field lalu simpan.",
        toast: "Mode manual · tidak ada hasil AI yang diterapkan.",
        hotspots: [
          hotspot("Kembali", "dashboard", 2, 4.1, 12, 5.6),
          hotspot("Simpan transaksi manual", "scan-success", 4, 83.3, 92, 7.2),
        ],
      },
    },
    correction: {
      transactions: {
        title: "Daftar transaksi",
        description: "Pilih transaksi tanpa kehilangan konteks periode.",
        image: assets.mobile.transactions,
        announce: "Daftar transaksi Juli 2026.",
        hotspots: [
          hotspot("Buka transaksi Superindo", "edit", 4, 37.2, 92, 8.3),
        ],
      },
      edit: {
        title: "Edit transaksi",
        description: "Field mengikuti urutan visual dan seluruh nilai dapat diubah.",
        image: assets.mobile.edit,
        announce: "Edit transaksi Superindo.",
        hotspots: [
          hotspot("Kembali ke transaksi", "transactions", 2, 4.1, 12, 5.6),
          hotspot("Ubah kategori", "edit", 51.5, 44.1, 44.5, 6.5),
          hotspot("Hapus transaksi", "destructive", 4, 74, 44, 6),
          hotspot("Simpan perubahan", "correction-success", 4, 83.3, 92, 7.2),
        ],
      },
      "correction-success": {
        title: "Perubahan tersimpan",
        description: "Kembali ke list dengan confirmation non-blocking.",
        image: assets.mobile.transactions,
        announce: "Kategori Superindo diperbarui.",
        toast: "Perubahan tersimpan · kategori Superindo diperbarui.",
        hotspots: [
          hotspot("Buka kembali transaksi", "edit", 4, 37.2, 92, 8.3),
        ],
      },
      "save-error": {
        title: "Simpan gagal",
        description: "Koreksi tetap berada di layar.",
        image: assets.mobile.saveError,
        announce: "Perubahan belum tersimpan. Koreksi tetap dipertahankan.",
        hotspots: [
          hotspot("Coba simpan lagi", "correction-success", 4, 81.5, 92, 6.2),
          hotspot("Kembali tanpa menyimpan", "transactions", 20, 91, 60, 5.2),
        ],
      },
      destructive: {
        title: "Konfirmasi destructive",
        description: "Objek dan dampak disebut; Batal menjadi fokus awal.",
        image: assets.mobile.destructive,
        announce: "Konfirmasi penghapusan transaksi Superindo.",
        initialFocus: 0,
        hotspots: [
          hotspot("Batal", "__back__", 7, 51.4, 36, 6),
          hotspot("Hapus transaksi", "deleted", 46, 51.4, 47, 6),
        ],
      },
      deleted: {
        title: "Transaksi dihapus",
        description: "List diperbarui dan fokus kembali ke konteks transaksi.",
        image: assets.mobile.transactions,
        announce: "Transaksi Superindo dihapus.",
        toast: "Transaksi dihapus · daftar sudah diperbarui.",
        hotspots: [],
      },
    },
  },
  desktop: {
    scan: {
      dashboard: {
        title: "Dashboard desktop",
        description: "Aksi scan berada pada header tanpa mendominasi shell.",
        image: assets.desktop.dashboard,
        announce: "Dashboard desktop siap.",
        hotspots: [
          hotspot("Scan struk", "upload", 87, 3.2, 10.5, 5.4),
        ],
      },
      upload: {
        title: "Upload workspace",
        description:
          "Panel kiri memegang input; panel kanan menunjukkan focused inspection.",
        image: assets.desktop.upload,
        announce: "Pilih foto dan mulai upload.",
        hotspots: [
          hotspot("Mulai upload", "processing", 19.5, 38, 36, 48),
        ],
      },
      processing: {
        title: "Pemeriksaan AI",
        description: "Panel dark tetap kontekstual dan menunggu event nyata.",
        image: assets.desktop.processing,
        announce: "AI sedang menyusun hasil.",
        async: true,
        eventTarget: "review",
        hotspots: [],
      },
      review: {
        title: "Receipt review",
        description: "Preview dan field editable dibandingkan tanpa berpindah layar.",
        image: assets.desktop.review,
        announce: "Hasil scan siap ditinjau.",
        hotspots: [
          hotspot("Simpan transaksi", "scan-success", 72.5, 82, 23.5, 6.4),
        ],
      },
      "scan-success": {
        title: "Transaksi tersimpan",
        description: "Kembali ke dashboard dengan confirmation non-blocking.",
        image: assets.desktop.dashboard,
        announce: "Transaksi Superindo tersimpan.",
        toast: "Transaksi tersimpan · dashboard sudah diperbarui.",
        hotspots: [
          hotspot("Scan struk lain", "upload", 87, 3.2, 10.5, 5.4),
        ],
      },
      offline: {
        title: "Offline / cached",
        description: "Dashboard cached tetap terlihat; scan dialihkan ke manual.",
        image: assets.desktop.dashboardStates,
        announce: "Kamu sedang offline. Data cache masih bisa dilihat.",
        hotspots: [],
      },
      "upload-error": {
        title: "Upload gagal",
        description: "Dialog memblokir hanya keputusan recovery.",
        image: assets.desktop.uploadError,
        announce: "Foto belum berhasil diunggah.",
        initialFocus: 0,
        hotspots: [
          hotspot("Kembali ke foto", "upload", 37, 56.6, 19.2, 5.4),
          hotspot("Coba unggah lagi", "processing", 57, 56.6, 22.5, 5.4),
        ],
      },
      quota: {
        title: "AI quota",
        description: "Manual fallback tersedia tanpa menampilkan error teknis.",
        image: assets.desktop.quota,
        announce: "Pemindaian AI sedang sibuk.",
        initialFocus: 0,
        hotspots: [
          hotspot("Coba lagi nanti", "dashboard", 37, 56.6, 19.2, 5.4),
          hotspot("Masukkan data manual", "manual-fallback", 57, 56.6, 22.5, 5.4),
        ],
      },
      "manual-fallback": {
        title: "Input manual desktop",
        description: "Side panel form mempertahankan konteks transaksi.",
        image: assets.desktop.manual,
        announce: "Input transaksi manual siap.",
        toast: "Mode manual · isi field lalu simpan.",
        hotspots: [
          hotspot("Simpan transaksi manual", "scan-success", 46.8, 70.2, 15.5, 5.4),
        ],
      },
    },
    correction: {
      transactions: {
        title: "Transactions + side panel",
        description: "List dan detail tetap terlihat bersama.",
        image: assets.desktop.transactions,
        announce: "Transaksi Superindo dipilih.",
        hotspots: [
          hotspot("Edit kategori", "edit", 75, 42, 21.5, 7),
          hotspot("Hapus transaksi", "destructive", 76, 76, 20, 5.5),
        ],
      },
      edit: {
        title: "Koreksi kategori",
        description: "Focus bergerak ke field yang diubah lalu ke save action.",
        image: assets.desktop.transactions,
        announce: "Kategori siap dikoreksi.",
        hotspots: [
          hotspot("Simpan perubahan", "correction-success", 76, 67, 20, 5.8),
        ],
      },
      "correction-success": {
        title: "Perubahan tersimpan",
        description: "Side panel tetap terbuka; selection tidak hilang.",
        image: assets.desktop.saveSuccess,
        announce: "Kategori Superindo diperbarui.",
        hotspots: [
          hotspot("Lanjut edit", "edit", 75, 42, 21.5, 7),
        ],
      },
      "save-error": {
        title: "Simpan gagal",
        description: "Koreksi dipertahankan; retry kembali ke mutation yang sama.",
        image: assets.desktop.transactions,
        announce: "Perubahan belum tersimpan.",
        toast: "Perubahan belum tersimpan · koreksi tetap dipertahankan.",
        hotspots: [
          hotspot("Coba simpan lagi", "correction-success", 76, 67, 20, 5.8),
        ],
      },
      destructive: {
        title: "Konfirmasi destructive",
        description: "Dialog menjebak fokus; Escape atau Batal mengembalikan fokus.",
        image: assets.desktop.destructive,
        announce: "Konfirmasi penghapusan transaksi Superindo.",
        initialFocus: 0,
        hotspots: [
          hotspot("Batal", "__back__", 37, 56.6, 19.2, 5.4),
          hotspot("Hapus transaksi", "deleted", 57, 56.6, 22.5, 5.4),
        ],
      },
      deleted: {
        title: "Transaksi dihapus",
        description: "List diperbarui tanpa berpindah ke halaman kosong.",
        image: assets.desktop.transactions,
        announce: "Transaksi Superindo dihapus.",
        toast: "Transaksi dihapus · daftar sudah diperbarui.",
        hotspots: [],
      },
    },
  },
};

const state = {
  viewport: "mobile",
  flow: "scan",
  node: "dashboard",
  history: [],
};

const elements = {
  shell: document.querySelector("#device-shell"),
  stage: document.querySelector("#screen-stage"),
  image: document.querySelector("#screen-image"),
  toast: document.querySelector("#screen-toast"),
  hotspots: document.querySelector("#hotspot-layer"),
  title: document.querySelector("#screen-title"),
  step: document.querySelector("#screen-step"),
  description: document.querySelector("#screen-description"),
  viewportLabel: document.querySelector("#viewport-label"),
  focusLabel: document.querySelector("#focus-label"),
  eventButton: document.querySelector("#event-button"),
  backButton: document.querySelector("#back-button"),
  resetButton: document.querySelector("#reset-button"),
  hotspotToggle: document.querySelector("#hotspot-toggle"),
  liveRegion: document.querySelector("#live-region"),
};

function currentNode() {
  return nodes[state.viewport][state.flow][state.node];
}

function initialNode() {
  return state.flow === "scan"
    ? "dashboard"
    : state.viewport === "mobile"
      ? "transactions"
      : "transactions";
}

function setPressed(selector, value) {
  document.querySelectorAll(selector).forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.flow === value || button.dataset.viewport === value),
    );
  });
}

function transition(target, options = {}) {
  if (target === "__back__") {
    goBack();
    return;
  }
  const {
    replace = false,
    returnFocusElement = null,
    returnFocusLabel = "",
  } = options;
  const available = nodes[state.viewport][state.flow];
  if (!available[target]) return;
  if (!replace) {
    state.history.push({
      node: state.node,
      returnFocusElement,
      returnFocusLabel,
    });
  }
  state.node = target;
  render();
}

function restoreFocus(previous) {
  requestAnimationFrame(() => {
    if (previous.returnFocusElement?.isConnected) {
      previous.returnFocusElement.focus();
      return;
    }
    if (previous.returnFocusLabel) {
      const candidate = [...elements.hotspots.querySelectorAll(".hotspot")].find(
        (element) =>
          element.getAttribute("aria-label") === previous.returnFocusLabel,
      );
      candidate?.focus();
    }
  });
}

function goBack() {
  const previous = state.history.pop();
  if (!previous) return;
  state.node = previous.node;
  render();
  restoreFocus(previous);
}

function createHotspot(item, index) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "hotspot";
  button.setAttribute("aria-label", item.label);
  button.title = item.label;
  button.style.left = `${item.x}%`;
  button.style.top = `${item.y}%`;
  button.style.width = `${item.width}%`;
  button.style.height = `${item.height}%`;
  button.addEventListener("click", () =>
    transition(item.target, { returnFocusLabel: item.label }),
  );
  if (index === currentNode().initialFocus) {
    requestAnimationFrame(() => button.focus());
  }
  return button;
}

function render() {
  const node = currentNode();
  elements.shell.className = `device-shell is-${state.viewport}`;
  elements.stage.classList.remove("is-entering");
  void elements.stage.offsetWidth;
  elements.stage.classList.add("is-entering");
  elements.image.src = node.image;
  elements.image.alt = `${node.title}. ${node.description}`;
  elements.title.textContent = node.title;
  elements.step.textContent = `${state.flow === "scan" ? "FLOW 1 · SCAN STRUK" : "FLOW 2 · KOREKSI TRANSAKSI"} · ${state.node.replaceAll("-", " ")}`;
  elements.description.textContent = node.description;
  elements.viewportLabel.textContent =
    state.viewport === "mobile" ? "390 × 844" : "1440 × 1024";
  elements.focusLabel.textContent = `${node.hotspots.length} focus target`;
  elements.eventButton.hidden = !node.async;
  elements.eventButton.dataset.target = node.eventTarget ?? "";
  elements.backButton.disabled = state.history.length === 0;
  elements.toast.hidden = !node.toast;
  elements.toast.textContent = node.toast ?? "";
  elements.hotspots.replaceChildren(
    ...node.hotspots.map((item, index) => createHotspot(item, index)),
  );
  elements.liveRegion.textContent = node.announce;
}

document.querySelectorAll("[data-flow]").forEach((button) => {
  button.addEventListener("click", () => {
    state.flow = button.dataset.flow;
    state.node = initialNode();
    state.history = [];
    setPressed("[data-flow]", state.flow);
    render();
  });
});

document.querySelectorAll("[data-viewport]").forEach((button) => {
  button.addEventListener("click", () => {
    state.viewport = button.dataset.viewport;
    state.node = initialNode();
    state.history = [];
    setPressed("[data-viewport]", state.viewport);
    render();
  });
});

document.querySelectorAll("[data-recovery]").forEach((button) => {
  button.addEventListener("click", () => {
    const recovery = button.dataset.recovery;
    const available = nodes[state.viewport][state.flow];
    const target =
      recovery === "offline"
        ? state.flow === "scan"
          ? "offline"
          : "save-error"
        : recovery === "upload-error"
          ? state.flow === "scan"
            ? "upload-error"
            : "save-error"
          : recovery === "quota"
            ? state.flow === "scan"
              ? "quota"
              : "save-error"
            : recovery === "destructive"
              ? "destructive"
              : "save-error";
    if (available[target]) {
      transition(target, { returnFocusElement: button });
    }
  });
});

elements.eventButton.addEventListener("click", () => {
  const target = elements.eventButton.dataset.target;
  if (target) transition(target);
});

elements.backButton.addEventListener("click", () => {
  goBack();
});

elements.resetButton.addEventListener("click", () => {
  state.node = initialNode();
  state.history = [];
  render();
});

elements.hotspotToggle.addEventListener("change", () => {
  elements.stage.classList.toggle(
    "show-hotspots",
    elements.hotspotToggle.checked,
  );
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.history.length > 0) {
    event.preventDefault();
    goBack();
  }
  if (event.altKey && event.key === "ArrowLeft" && state.history.length > 0) {
    event.preventDefault();
    goBack();
  }
  if (event.key === "Tab" && state.node === "destructive") {
    const focusTargets = [...elements.hotspots.querySelectorAll(".hotspot")];
    if (focusTargets.length === 0) return;
    const currentIndex = focusTargets.indexOf(document.activeElement);
    const nextIndex = event.shiftKey
      ? currentIndex <= 0
        ? focusTargets.length - 1
        : currentIndex - 1
      : currentIndex < 0 || currentIndex === focusTargets.length - 1
        ? 0
        : currentIndex + 1;
    event.preventDefault();
    focusTargets[nextIndex].focus();
  }
});

render();
