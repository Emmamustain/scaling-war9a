import { Injectable, Inject } from '@nestjs/common';
import { DrizzleDB, schema } from '@shared/drizzle';
import { and, eq, count } from '@shared/drizzle/operators';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';

type NotificationType = typeof schema.notifications.$inferInsert['type'];

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly configService: ConfigService,
  ) {
    const vapidPublicKey = configService.get<string>('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = configService.get<string>('VAPID_PRIVATE_KEY');
    const vapidEmail = configService.get<string>('VAPID_EMAIL');

    if (vapidPublicKey && vapidPrivateKey && vapidEmail) {
      webpush.setVapidDetails(
        `mailto:${vapidEmail}`,
        vapidPublicKey,
        vapidPrivateKey,
      );
    }
  }

  async getForUser(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const [notifications, unread] = await Promise.all([
      this.db.query.notifications.findMany({
        where: eq(schema.notifications.toUserId, userId),
        limit,
        offset,
        orderBy: (n, { desc }) => [desc(n.createdAt)],
      }),
      this.db
        .select({ count: count() })
        .from(schema.notifications)
        .where(
          and(
            eq(schema.notifications.toUserId, userId),
            eq(schema.notifications.consumed, false),
          ),
        ),
    ]);

    return {
      notifications,
      unreadCount: unread[0]?.count ?? 0,
    };
  }

  async markRead(notificationId: string, userId: string) {
    await this.db
      .update(schema.notifications)
      .set({ consumed: true })
      .where(
        and(
          eq(schema.notifications.id, notificationId),
          eq(schema.notifications.toUserId, userId),
        ),
      );
    return { success: true };
  }

  async markAllRead(userId: string) {
    await this.db
      .update(schema.notifications)
      .set({ consumed: true })
      .where(
        and(
          eq(schema.notifications.toUserId, userId),
          eq(schema.notifications.consumed, false),
        ),
      );
    return { success: true };
  }

  async createNotification(data: {
    toUserId: string;
    type: NotificationType;
    title: string;
    message: string;
    resourceType?: string;
    resourceId?: string;
  }) {
    const [notification] = await this.db
      .insert(schema.notifications)
      .values(data)
      .returning();

    await this.sendWebPush(data.toUserId, {
      title: data.title,
      body: data.message,
    });

    return notification;
  }

  async savePushSubscription(
    userId: string,
    subscription: { endpoint: string; p256dhKey: string; authKey: string; userAgent?: string },
  ) {
    await this.db
      .insert(schema.pushSubscriptions)
      .values({ userId, ...subscription })
      .onConflictDoUpdate({
        target: schema.pushSubscriptions.endpoint,
        set: { isActive: true, updatedAt: new Date() },
      });
    return { success: true };
  }

  async removePushSubscription(endpoint: string) {
    await this.db
      .update(schema.pushSubscriptions)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(schema.pushSubscriptions.endpoint, endpoint));
  }

  private async sendWebPush(userId: string, payload: { title: string; body: string }) {
    const subscriptions = await this.db.query.pushSubscriptions.findMany({
      where: and(
        eq(schema.pushSubscriptions.userId, userId),
        eq(schema.pushSubscriptions.isActive, true),
      ),
    });

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dhKey, auth: sub.authKey },
          },
          JSON.stringify(payload),
        );
      } catch {
        await this.db
          .update(schema.pushSubscriptions)
          .set({ isActive: false })
          .where(eq(schema.pushSubscriptions.id, sub.id));
      }
    }
  }
}
