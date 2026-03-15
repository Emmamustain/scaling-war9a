"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useRouter } from "next/navigation";

export function AuthSessionSync() {
  const { checkAuth, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    void checkAuth();

    const handleFocus = () => void checkAuth();
    const handleVisibility = () => {
      if (!document.hidden) void checkAuth();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    const interval = setInterval(
      () => {
        if (useAuthStore.getState().isAuthenticated) {
          void checkAuth();
        }
      },
      60 * 1000,
    );

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(interval);
    };
  }, [checkAuth]);

  useEffect(() => {
    if (user?.usernameNeedsSetup) {
      router.push("/setup-username");
    }
  }, [user, router]);

  return null;
}
