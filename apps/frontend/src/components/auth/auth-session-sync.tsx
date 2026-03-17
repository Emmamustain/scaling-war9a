"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useRouter } from "next/navigation";

export function AuthSessionSync() {
  const { checkAuth, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    void checkAuth();

    // Re-validate session every 5 minutes in the background (no focus/visibility triggers)
    const interval = setInterval(
      () => {
        if (useAuthStore.getState().isAuthenticated) {
          void checkAuth();
        }
      },
      5 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [checkAuth]);

  useEffect(() => {
    if (user?.usernameNeedsSetup) {
      router.push("/setup-username");
    }
  }, [user, router]);

  return null;
}
