import { isNative } from "./platform";
/**
 * Trigger haptic feedback. No-op on web.
 */
export async function haptic(style = "light") {
    if (!isNative())
        return;
    const { Haptics, ImpactStyle, NotificationType } = await import("@capacitor/haptics");
    if (style === "success" || style === "warning" || style === "error") {
        const typeMap = {
            success: NotificationType.Success,
            warning: NotificationType.Warning,
            error: NotificationType.Error,
        };
        await Haptics.notification({ type: typeMap[style] });
        return;
    }
    const impactMap = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy,
    };
    await Haptics.impact({ style: (impactMap[style] ?? ImpactStyle.Light) });
}
//# sourceMappingURL=haptics.js.map