export type PhotoResult = {
    dataUrl: string;
    format: string;
};
/**
 * Capture a photo from the device camera or prompt file picker on web.
 */
export declare function takePhoto(): Promise<PhotoResult | null>;
//# sourceMappingURL=camera.d.ts.map