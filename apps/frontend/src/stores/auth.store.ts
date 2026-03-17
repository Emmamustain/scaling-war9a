import { create } from "zustand";
import { authClient } from "@/lib/auth-client";
import { fetchApi } from "@/lib/fetch";
import type { TUser } from "@shared/types";

type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: TUser | null;
  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: TUser | null) => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const session = await authClient.getSession();
      if (!session.data?.user?.id) {
        set({ isAuthenticated: false, user: null, isLoading: false });
        return;
      }

      let retries = 0;
      while (retries < 3) {
        try {
          const user = await fetchApi<TUser>("/users/me");
          set({ isAuthenticated: true, user, isLoading: false });
          return;
        } catch {
          retries++;
          if (retries < 3) {
            await new Promise((r) => setTimeout(r, 150));
          }
        }
      }

      set({ isAuthenticated: false, user: null, isLoading: false });
    } catch {
      set({ isAuthenticated: false, user: null, isLoading: false });
    }
  },

  login: async (email, password) => {
    const result = await authClient.signIn.email({ email, password });
    if (result.error) throw new Error(result.error.message ?? "Sign in failed");
    await get().checkAuth();
  },

  logout: async () => {
    await authClient.signOut();
    set({ isAuthenticated: false, user: null });
  },
}));
