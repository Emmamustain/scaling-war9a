import { isNative } from "./platform";

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
export async function requestPushPermission(): Promise<PushPermissionStatus> {
  if (isNative()) {
    const { PushNotifications } = await import(
      "@capacitor/push-notifications"
    );
    const result = await PushNotifications.requestPermissions();
    return result.receive as PushPermissionStatus;
  }

  if (!("Notification" in window)) return "denied";
  const result = await Notification.requestPermission();
  return result as PushPermissionStatus;
}

/**
 * Register device for push notifications and return the token.
 * Returns null on web (web push uses VAPID, not device tokens).
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!isNative()) return null;

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
export async function onPushNotificationReceived(
  callback: (notification: PushNotificationPayload) => void,
): Promise<() => void> {
  if (!isNative()) {
    return () => {};
  }

  const { PushNotifications } = await import("@capacitor/push-notifications");
  const listener = await PushNotifications.addListener(
    "pushNotificationReceived",
    (notification) => {
      callback({
        title: notification.title ?? "",
        body: notification.body ?? "",
        data: notification.data as Record<string, unknown>,
      });
    },
  );

  return () => listener.remove();
}
