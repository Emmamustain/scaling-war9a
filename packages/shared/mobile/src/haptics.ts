import { isNative } from "./platform";

export type HapticStyle = "light" | "medium" | "heavy" | "success" | "warning" | "error";

/**
 * Trigger haptic feedback. No-op on web.
 */
export async function haptic(style: HapticStyle = "light"): Promise<void> {
  if (!isNative()) return;

  const { Haptics, ImpactStyle, NotificationType } = await import(
    "@capacitor/haptics"
  );

  if (style === "success" || style === "warning" || style === "error") {
    const typeMap: Record<string, typeof NotificationType[keyof typeof NotificationType]> = {
      success: NotificationType.Success,
      warning: NotificationType.Warning,
      error: NotificationType.Error,
    };
    await Haptics.notification({ type: typeMap[style] as typeof NotificationType[keyof typeof NotificationType] });
    return;
  }

  const impactMap: Record<string, typeof ImpactStyle[keyof typeof ImpactStyle]> = {
    light: ImpactStyle.Light,
    medium: ImpactStyle.Medium,
    heavy: ImpactStyle.Heavy,
  };
  await Haptics.impact({ style: (impactMap[style] ?? ImpactStyle.Light) as typeof ImpactStyle[keyof typeof ImpactStyle] });
}
