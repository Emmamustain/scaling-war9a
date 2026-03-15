"use client";

import { useEffect } from "react";
import { fetchApi } from "@/lib/fetch";
import { useAuthStore } from "@/stores/auth.store";

export function PwaInit() {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").catch(console.error);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;

    const registerPush = async () => {
      if (Notification.permission !== "granted") return;

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) return;

      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (existing) return;

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey).buffer as ArrayBuffer,
      });

      await fetchApi("/notifications/push-subscription", {
        method: "POST",
        body: JSON.stringify(subscription.toJSON()),
      });
    };

    void registerPush();
  }, [isAuthenticated]);

  return null;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
