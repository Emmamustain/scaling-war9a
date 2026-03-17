import { createAuthClient } from "better-auth/react";
import { getBackendUrl } from "./backend-url";

export const authClient = createAuthClient({
  baseURL: `${getBackendUrl()}/auth`,
  credentials: "include",
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;
