import { isNative } from "./platform";
/**
 * Open the native share sheet on mobile.
 * Falls back to Web Share API, then clipboard copy on web.
 */
export async function share(payload) {
    if (isNative()) {
        const { Share } = await import("@capacitor/share");
        await Share.share({
            title: payload.title,
            text: payload.text,
            url: payload.url,
        });
        return;
    }
    if (navigator.share) {
        await navigator.share({
            title: payload.title,
            text: payload.text,
            url: payload.url,
        });
        return;
    }
    if (payload.url && navigator.clipboard) {
        await navigator.clipboard.writeText(payload.url);
    }
}
//# sourceMappingURL=share.js.map