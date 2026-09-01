"use client";

import { CheckCircle } from "@phosphor-icons/react/CheckCircle";
import { WifiSlash } from "@phosphor-icons/react/WifiSlash";
import { useSyncExternalStore } from "react";

type NetworkDisplayState = "offline" | "online" | "reconnected";

const networkListeners = new Set<() => void>();
let networkDisplayState: NetworkDisplayState = "online";
let reconnectTimeoutId: number | undefined;

function emitNetworkState() {
  networkListeners.forEach((listener) => listener());
}

function handleOffline() {
  if (reconnectTimeoutId !== undefined) {
    window.clearTimeout(reconnectTimeoutId);
    reconnectTimeoutId = undefined;
  }

  networkDisplayState = "offline";
  emitNetworkState();
}

function handleOnline() {
  const hasReconnected = networkDisplayState === "offline";
  networkDisplayState = hasReconnected ? "reconnected" : "online";
  emitNetworkState();

  if (!hasReconnected) {
    return;
  }

  reconnectTimeoutId = window.setTimeout(() => {
    networkDisplayState = "online";
    reconnectTimeoutId = undefined;
    emitNetworkState();
  }, 4000);
}

function subscribeToNetworkState(listener: () => void) {
  if (networkListeners.size === 0) {
    networkDisplayState = navigator.onLine ? "online" : "offline";
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
  }

  networkListeners.add(listener);

  return () => {
    networkListeners.delete(listener);

    if (networkListeners.size > 0) {
      return;
    }

    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);

    if (reconnectTimeoutId !== undefined) {
      window.clearTimeout(reconnectTimeoutId);
      reconnectTimeoutId = undefined;
    }
  };
}

function getNetworkSnapshot() {
  return networkDisplayState;
}

function getServerNetworkSnapshot(): NetworkDisplayState {
  return "online";
}

export function NetworkStatusBanner() {
  const networkState = useSyncExternalStore(
    subscribeToNetworkState,
    getNetworkSnapshot,
    getServerNetworkSnapshot,
  );
  const isOnline = networkState !== "offline";

  if (networkState === "online") {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className={[
        "mx-4 mt-4 flex min-w-0 flex-col gap-3 rounded-lg border px-4 py-3 font-body sm:mx-6 sm:flex-row sm:items-center lg:mx-6 xl:mx-8 min-[1440px]:mx-10",
        isOnline
          ? "border-signal bg-signal-soft text-signal-ink"
          : "border-primary bg-primary-soft text-primary",
      ].join(" ")}
      role="status"
    >
      <span
        className={[
          "ft-status-badge shrink-0 gap-2 rounded-sm bg-surface text-xs font-semibold",
          isOnline ? "" : "ft-status-badge--offline",
        ].join(" ")}
      >
        {isOnline ? (
          <CheckCircle aria-hidden="true" size={16} weight="bold" />
        ) : (
          <WifiSlash aria-hidden="true" size={16} weight="bold" />
        )}
        {isOnline ? "Koneksi kembali" : "Offline · Cache"}
      </span>
      <p className="min-w-0 text-sm leading-5">
        {isOnline
          ? "Koneksi sudah pulih. Halaman dapat digunakan kembali."
          : "Kamu sedang offline. Halaman tersimpan masih bisa dibuka, tetapi perubahan memerlukan koneksi."}
      </p>
    </div>
  );
}
