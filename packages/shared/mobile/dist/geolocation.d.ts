export type GeoPosition = {
    latitude: number;
    longitude: number;
    accuracy?: number;
};
/**
 * Get the current device position.
 * On native uses @capacitor/geolocation for better accuracy.
 * On web uses the browser Geolocation API.
 */
export declare function getCurrentPosition(): Promise<GeoPosition>;
//# sourceMappingURL=geolocation.d.ts.map