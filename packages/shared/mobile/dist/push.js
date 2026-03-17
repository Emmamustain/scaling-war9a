import { isNative } from "./platform";
/**
 * Request push notification permissions.
 * On web, delegates to the Web Push API.
 * On native, uses @capacitor/push-notifications.
 */
export async function requestPushPermission() {
    if (isNative()) {
        const { PushNotifications } = await import("@capacitor/push-notifications");
        const result = await PushNotifications.requestPermissions();
        return result.receive;
    }
    if (!("Notification" in window))
        return "denied";
    const result = await Notification.requestPermission();
    return result;
}
/**
 * Register device for push notifications and return the token.
 * Returns null on web (web push uses VAPID, not device tokens).
 */
export async function registerForPushNotifications() {
    if (!isNative())
        return null;
    const { PushNotifications } = await import("@capacitor/push-notifications");
    await PushNotifications.register();
    return new Promise((resolve) => {
        PushNotifications.addListener("registration", (token) => {
            resolve(token.value);
        });
        PushNotifications.addListener("registrationError", () => {
            resolve(null);
        });
    });
}
/**
 * Listen for incoming push notifications when the app is in the foreground.
 */
export async function onPushNotificationReceived(callback) {
    if (!isNative()) {
        return () => { };
    }
    const { PushNotifications } = await import("@capacitor/push-notifications");
    const listener = await PushNotifications.addListener("pushNotificationReceived", (notification) => {
        callback({
            title: notification.title ?? "",
            body: notification.body ?? "",
            data: notification.data,
        });
    });
    return () => listener.remove();
}
//# sourceMappingURL=push.js.map