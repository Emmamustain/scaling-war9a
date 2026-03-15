export type SharePayload = {
    title: string;
    text: string;
    url?: string;
};
/**
 * Open the native share sheet on mobile.
 * Falls back to Web Share API, then clipboard copy on web.
 */
export declare function share(payload: SharePayload): Promise<void>;
//# sourceMappingURL=share.d.ts.map