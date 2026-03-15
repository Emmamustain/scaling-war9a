/**
 * Detects whether the app is running inside a Capacitor native shell.
 * Safe to call in SSR environments — returns false when window is unavailable.
 */
export function isNative(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as typeof window & { Capacitor?: { isNativePlatform?: () => boolean } })
    .Capacitor?.isNativePlatform?.();
}

export function getPlatform(): "web" | "ios" | "android" {
  if (typeof window === "undefined") return "web";
  const capacitor = (
    window as typeof window & {
      Capacitor?: { getPlatform?: () => string };
    }
  ).Capacitor;
  if (!capacitor?.getPlatform) return "web";
  const platform = capacitor.getPlatform();
  if (platform === "ios") return "ios";
  if (platform === "android") return "android";
  return "web";
}

export function isIOS(): boolean {
  return getPlatform() === "ios";
}

export function isAndroid(): boolean {
  return getPlatform() === "android";
}
