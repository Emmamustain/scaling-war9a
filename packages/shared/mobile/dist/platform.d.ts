/**
 * Detects whether the app is running inside a Capacitor native shell.
 * Safe to call in SSR environments — returns false when window is unavailable.
 */
export declare function isNative(): boolean;
export declare function getPlatform(): "web" | "ios" | "android";
export declare function isIOS(): boolean;
export declare function isAndroid(): boolean;
//# sourceMappingURL=platform.d.ts.map