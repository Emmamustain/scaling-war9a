export type HapticStyle = "light" | "medium" | "heavy" | "success" | "warning" | "error";
/**
 * Trigger haptic feedback. No-op on web.
 */
export declare function haptic(style?: HapticStyle): Promise<void>;
//# sourceMappingURL=haptics.d.ts.map