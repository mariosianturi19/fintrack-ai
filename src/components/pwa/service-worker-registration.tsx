"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    let registration: ServiceWorkerRegistration | undefined;
    let cancelled = false;

    async function registerServiceWorker() {
      try {
        const nextRegistration = await navigator.serviceWorker.register(
          "/sw.js",
          {
            scope: "/",
            updateViaCache: "none",
          },
        );

        if (cancelled) {
          return;
        }

        registration = nextRegistration;
        await registration.update();
      } catch (error) {
        console.error("Service worker Fintrack AI gagal didaftarkan.", error);
      }
    }

    function updateServiceWorker() {
      void registration?.update();
    }

    void registerServiceWorker();
    window.addEventListener("online", updateServiceWorker);

    return () => {
      cancelled = true;
      window.removeEventListener("online", updateServiceWorker);
    };
  }, []);

  return null;
}
