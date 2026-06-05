"use client";

import { useEffect } from "react";

// Registers the service worker so the app is installable to the phone home
// screen and the shell loads offline.
export default function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Non-fatal: app still works without offline support.
      });
    }
  }, []);
  return null;
}
