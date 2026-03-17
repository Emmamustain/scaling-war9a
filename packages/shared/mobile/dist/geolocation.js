import { isNative } from "./platform";
/**
 * Get the current device position.
 * On native uses @capacitor/geolocation for better accuracy.
 * On web uses the browser Geolocation API.
 */
export async function getCurrentPosition() {
    if (isNative()) {
        const { Geolocation } = await import("@capacitor/geolocation");
        const pos = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 10000,
        });
        return {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
        };
    }
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation not supported"));
            return;
        }
        navigator.geolocation.getCurrentPosition((pos) => resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
        }), reject, { enableHighAccuracy: true, timeout: 10000 });
    });
}
//# sourceMappingURL=geolocation.js.map