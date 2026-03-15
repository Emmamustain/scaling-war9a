/**
 * Detects whether the app is running inside a Capacitor native shell.
 * Safe to call in SSR environments — returns false when window is unavailable.
 */
export function isNative() {
    if (typeof window === "undefined")
        return false;
    return !!window
        .Capacitor?.isNativePlatform?.();
}
export function getPlatform() {
    if (typeof window === "undefined")
        return "web";
    const capacitor = window.Capacitor;
    if (!capacitor?.getPlatform)
        return "web";
    const platform = capacitor.getPlatform();
    if (platform === "ios")
        return "ios";
    if (platform === "android")
        return "android";
    return "web";
}
export function isIOS() {
    return getPlatform() === "ios";
}
export function isAndroid() {
    return getPlatform() === "android";
}
//# sourceMappingURL=platform.js.map