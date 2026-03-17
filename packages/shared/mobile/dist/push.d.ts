export type PushPermissionStatus = "granted" | "denied" | "prompt";
export type PushNotificationPayload = {
    title: string;
    body: string;
    data?: Record<string, unknown>;
};
/**
 * Request push notification permissions.
 * On web, delegates to the Web Push API.
 * On native, uses @capacitor/push-notifications.
 */
export declare function requestPushPermission(): Promise<PushPermissionStatus>;
/**
 * Register device for push notifications and return the token.
 * Returns null on web (web push uses VAPID, not device tokens).
 */
export declare function registerForPushNotifications(): Promise<string | null>;
/**
 * Listen for incoming push notifications when the app is in the foreground.
 */
export declare function onPushNotificationReceived(callback: (notification: PushNotificationPayload) => void): Promise<() => void>;
//# sourceMappingURL=push.d.ts.map