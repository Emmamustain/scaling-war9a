import { isNative } from "./platform";

export type SharePayload = {
  title: string;
  text: string;
  url?: string;
};

/**
 * Open the native share sheet on mobile.
 * Falls back to Web Share API, then clipboard copy on web.
 */
export async function share(payload: SharePayload): Promise<void> {
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
