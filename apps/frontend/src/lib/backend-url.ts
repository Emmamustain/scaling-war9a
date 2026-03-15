/**
 * Resolves the backend API URL for both SSR and client contexts.
 * In Capacitor builds all requests go directly to the production API.
 */
export function getBackendUrl(): string {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";
  }

  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }

  const hostname = window.location.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:4000";
  }

  if (hostname.includes("war9a.localhost")) {
    return "https://api.war9a.localhost";
  }

  const parts = hostname.split(".");
  if (parts.length >= 2) {
    const domain = parts.slice(-2).join(".");
    return `https://api.${domain}`;
  }

  return "http://localhost:4000";
}
