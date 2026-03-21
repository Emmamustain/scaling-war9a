import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { DrizzleDB, schema } from '@shared/drizzle';
import { and, eq, ne, inArray, count, asc, desc, sql } from '@shared/drizzle/operators';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { QueueGateway } from './queue.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { randomBytes } from 'crypto';

@Injectable()
export class QueueService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly queueGateway: QueueGateway,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getMyHistory(userId: string, limit = 20, offset = 0) {
    const entries = await this.db.query.queueEntries.findMany({
      where: and(
        eq(schema.queueEntries.userId, userId),
        inArray(schema.queueEntries.status, ['passed', 'left', 'no_show']),
      ),
      orderBy: [desc(schema.queueEntries.entryTime)],
      limit,
      offset,
      with: {
        service: {
          columns: { id: true, name: true },
          with: {
            business: { columns: { id: true, name: true, slug: true, logoUrl: true } },
          },
        },
      },
    });
    return entries.map((e) => ({
      id: e.id,
      status: e.status,
      entryTime: e.entryTime,
      servedAt: e.servedAt,
      serviceId: e.serviceId,
      serviceName: e.service?.name ?? '',
      businessId: e.service?.business?.id,
      businessName: e.service?.business?.name ?? '',
      businessSlug: e.service?.business?.slug ?? '',
      businessLogoUrl: e.service?.business?.logoUrl ?? null,
      groupSize: e.groupSize,
    }));
  }

  async getMyActiveEntries(userId: string) {
    const entries = await this.db.query.queueEntries.findMany({
      where: and(
        eq(schema.queueEntries.userId, userId),
        inArray(schema.queueEntries.status, ['waiting', 'called']),
      ),
      orderBy: asc(schema.queueEntries.entryTime),
      with: {
        service: {
          columns: { id: true, name: true },
          with: {
            business: {
              columns: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });

    // Compute position dynamically: count waiting entries ahead of this one
    const results = await Promise.all(
      entries.map(async (e) => {
        const [{ count: ahead }] = await this.db
          .select({ count: count() })
          .from(schema.queueEntries)
          .where(
            and(
              eq(schema.queueEntries.serviceId, e.serviceId),
              eq(schema.queueEntries.status, 'waiting'),
              sql`(
                "priority" > ${e.priority}
                OR ("priority" = ${e.priority} AND "entry_time" < ${e.entryTime})
              )`,
            ),
          );
        return {
          id: e.id,
          serviceId: e.serviceId,
          serviceName: e.service?.name ?? '',
          businessId: e.service?.business?.id,
          businessName: e.service?.business?.name ?? '',
          businessSlug: e.service?.business?.slug ?? '',
          position: Number(ahead) + 1,
          status: e.status,
          estimatedWaitMinutes: e.estimatedWaitMinutes ?? 0,
        };
      }),
    );
    return results;
  }

  async getServiceQueueStatus(serviceId: string) {
    const service = await this.db.query.queueServices.findFirst({
      where: eq(schema.queueServices.id, serviceId),
      with: {
        business: { columns: { id: true, name: true, isOpen: true } },
        guichets: {
          where: eq(schema.guichets.status, 'open'),
          with: { currentWorker: { columns: { id: true, displayName: true } } },
        },
      },
    });
    if (!service) throw new NotFoundException('Service not found');

    const waitingCount = await this.db
      .select({ count: count() })
      .from(schema.queueEntries)
      .where(
        and(
          eq(schema.queueEntries.serviceId, serviceId),
          eq(schema.queueEntries.status, 'waiting'),
        ),
      );

    const avgTime = Number(service.averageTime ?? 10);
    const openGuichetCount = service.guichets.length;
    const waiting = waitingCount[0]?.count ?? 0;
    const estimatedWaitMinutes =
      openGuichetCount > 0
        ? Math.ceil((waiting * avgTime) / openGuichetCount)
        : waiting * avgTime;

    return {
      serviceId,
      serviceName: service.name,
      businessId: service.businessId,
      businessName: service.business?.name ?? '',
      waitingCount: waiting,
      estimatedWaitMinutes,
      openGuichets: openGuichetCount,
      maxCapacity: service.maxCapacity ?? 200,
      status: service.business?.isOpen
        ? openGuichetCount > 0
          ? 'open'
          : 'closed'
        : 'closed',
    };
  }

  async joinQueue(
    serviceId: string,
    options: {
      userId?: string;
      anonymousPhone?: string;
      groupSize?: number;
      priority?: 'normal' | 'priority' | 'urgent';
      notes?: string;
    },
  ) {
    if (!options.userId && !options.anonymousPhone) {
      throw new BadRequestException('Either userId or anonymousPhone is required');
    }

    if (options.userId) {
      // Enforce single queue: check for active entry in ANY other service
      const otherActive = await this.db.query.queueEntries.findFirst({
        where: and(
          eq(schema.queueEntries.userId, options.userId),
          ne(schema.queueEntries.serviceId, serviceId),
          inArray(schema.queueEntries.status, ['waiting', 'called']),
        ),
        with: {
          service: {
            columns: { name: true },
            with: {
              business: {
                columns: { name: true, slug: true },
              },
            },
          },
        },
      });
      if (otherActive) {
        throw new ConflictException({
          code: 'ALREADY_IN_OTHER_QUEUE',
          currentEntry: {
            id: otherActive.id,
            serviceId: otherActive.serviceId,
            serviceName: otherActive.service?.name ?? '',
            businessName: otherActive.service?.business?.name ?? '',
            businessSlug: otherActive.service?.business?.slug ?? '',
          },
        });
      }

      const existing = await this.db.query.queueEntries.findFirst({
        where: and(
          eq(schema.queueEntries.serviceId, serviceId),
          eq(schema.queueEntries.userId, options.userId),
          inArray(schema.queueEntries.status, ['waiting', 'called']),
        ),
      });

      if (existing) {
        throw new ConflictException('Already in queue for this service');
      }
    }

    const service = await this.db.query.queueServices.findFirst({
      where: eq(schema.queueServices.id, serviceId),
      columns: { maxCapacity: true, isActive: true, averageTime: true },
    });
    if (!service || !service.isActive) {
      throw new NotFoundException('Service not found or inactive');
    }

    // Priority-aware count: urgent → priority → normal ordering (desc)
    const joinPriority = options.priority ?? 'normal';
    const priorityCounts = await this.db
      .select({ priority: schema.queueEntries.priority, count: count() })
      .from(schema.queueEntries)
      .where(
        and(
          eq(schema.queueEntries.serviceId, serviceId),
          eq(schema.queueEntries.status, 'waiting'),
        ),
      )
      .groupBy(schema.queueEntries.priority);

    const byPriority: Record<string, number> = {};
    for (const row of priorityCounts) byPriority[row.priority] = Number(row.count);
    const totalWaiting = (byPriority.urgent ?? 0) + (byPriority.priority ?? 0) + (byPriority.normal ?? 0);

    if (totalWaiting >= (service.maxCapacity ?? 200)) {
      throw new BadRequestException('Queue is at maximum capacity');
    }

    // Insert after all entries with equal or higher priority
    const position =
      joinPriority === 'urgent'
        ? (byPriority.urgent ?? 0) + 1
        : joinPriority === 'priority'
          ? (byPriority.urgent ?? 0) + (byPriority.priority ?? 0) + 1
          : totalWaiting + 1;

    const avgTime = Number(service.averageTime ?? 10);
    const estimatedWaitMinutes = Math.round((position - 1) * avgTime);

    const anonymousToken = !options.userId
      ? randomBytes(16).toString('hex')
      : undefined;

    const [entry] = await this.db
      .insert(schema.queueEntries)
      .values({
        serviceId,
        userId: options.userId ?? null,
        anonymousToken,
        anonymousPhone: options.anonymousPhone,
        groupSize: options.groupSize ?? 1,
        priority: options.priority ?? 'normal',
        status: 'waiting',
        estimatedWaitMinutes,
        notes: options.notes,
      })
      .returning();

    await this.db.insert(schema.queueEvents).values({
      entryId: entry.id,
      eventType: 'joined',
      actorId: options.userId ?? null,
      metadata: JSON.stringify({ position, estimatedWaitMinutes }),
    });

    const joinedDeadlineAt = Date.now() + estimatedWaitMinutes * 60 * 1000;
    this.queueGateway.broadcastPositionUpdate({
      entryId: entry.id,
      serviceId,
      position,
      estimatedWaitMinutes,
      deadlineAt: joinedDeadlineAt,
      status: 'waiting',
    });

    void this.sendQueueSnapshot(serviceId);
    return { ...entry, position, estimatedWaitMinutes, deadlineAt: joinedDeadlineAt };
  }

  async leaveQueue(entryId: string, userId?: string) {
    const entry = await this.db.query.queueEntries.findFirst({
      where: eq(schema.queueEntries.id, entryId),
    });
    if (!entry) throw new NotFoundException('Queue entry not found');
    if (userId && entry.userId !== userId) {
      throw new BadRequestException('Not authorized to leave this queue');
    }

    await this.db
      .update(schema.queueEntries)
      .set({ status: 'left', updatedAt: new Date() })
      .where(eq(schema.queueEntries.id, entryId));

    await this.db.insert(schema.queueEvents).values({
      entryId,
      eventType: 'left',
      actorId: userId ?? null,
    });

    await this.recalculatePositions(entry.serviceId);
    void this.sendQueueSnapshot(entry.serviceId);
    return { success: true };
  }

  async callNext(serviceId: string, guichetId: string, workerId: string) {
    const now = new Date();

    // Auto-serve the currently called entry for this guichet (if any)
    const calledEntry = await this.db.query.queueEntries.findFirst({
      where: and(
        eq(schema.queueEntries.serviceId, serviceId),
        eq(schema.queueEntries.status, 'called'),
        eq(schema.queueEntries.servedByGuichetId, guichetId),
      ),
    });

    if (calledEntry) {
      const calledAt = calledEntry.calledAt ?? calledEntry.entryTime;
      const serviceTimeMinutes = Math.ceil((now.getTime() - calledAt.getTime()) / 60000);

      await this.db
        .update(schema.queueEntries)
        .set({ status: 'passed', servedAt: now, updatedAt: now })
        .where(eq(schema.queueEntries.id, calledEntry.id));

      await this.db.insert(schema.queueEvents).values({
        entryId: calledEntry.id,
        eventType: 'served',
        actorId: workerId,
        metadata: JSON.stringify({ serviceTimeMinutes, autoServed: true }),
      });

      await this.db
        .update(schema.queueServices)
        .set({
          averageTime: sql`(COALESCE("average_time", 10) * 0.9 + ${serviceTimeMinutes} * 0.1)::decimal`,
          updatedAt: now,
        })
        .where(eq(schema.queueServices.id, serviceId));

      this.queueGateway.broadcastEntryServed({ entryId: calledEntry.id, serviceId });

      if (calledEntry.userId) {
        void this.notificationsService.createNotification({
          toUserId: calledEntry.userId,
          type: 'queue_called',
          title: "You've been served",
          message: 'Your visit is complete. Thank you for your patience!',
          resourceType: 'queue_entry',
          resourceId: calledEntry.id,
        });
      }
    }

    const nextEntry = await this.db.query.queueEntries.findFirst({
      where: and(
        eq(schema.queueEntries.serviceId, serviceId),
        eq(schema.queueEntries.status, 'waiting'),
      ),
      orderBy: [
        desc(schema.queueEntries.priority),
        asc(schema.queueEntries.entryTime),
      ],
      with: {
        user: { columns: { id: true, displayName: true, email: true } },
      },
    });

    if (!nextEntry) throw new NotFoundException('No waiting entries');

    const guichet = await this.db.query.guichets.findFirst({
      where: eq(schema.guichets.id, guichetId),
      columns: { name: true },
    });

    await this.db
      .update(schema.queueEntries)
      .set({ status: 'called', calledAt: now, servedByGuichetId: guichetId, updatedAt: now })
      .where(eq(schema.queueEntries.id, nextEntry.id));

    await this.db.insert(schema.queueEvents).values({
      entryId: nextEntry.id,
      eventType: 'called',
      actorId: workerId,
      metadata: JSON.stringify({ guichetId }),
    });

    this.queueGateway.broadcastQueueCalled({
      entryId: nextEntry.id,
      serviceId,
      guichetName: guichet?.name ?? 'Guichet',
      userId: nextEntry.userId ?? undefined,
    });

    if (nextEntry.userId) {
      void this.notificationsService.createNotification({
        toUserId: nextEntry.userId,
        type: 'queue_called',
        title: "It's your turn!",
        message: `Please proceed to ${guichet?.name ?? 'the window'}. You've been called!`,
        resourceType: 'queue_entry',
        resourceId: nextEntry.id,
      });
    }

    await this.recalculatePositions(serviceId);
    void this.sendQueueSnapshot(serviceId);
    return nextEntry;
  }

  async markServed(entryId: string, workerId: string) {
    const entry = await this.db.query.queueEntries.findFirst({
      where: eq(schema.queueEntries.id, entryId),
      with: { service: { columns: { averageTime: true } } },
    });
    if (!entry) throw new NotFoundException('Entry not found');

    const now = new Date();
    const calledAt = entry.calledAt ?? entry.entryTime;
    const serviceTimeMinutes = Math.ceil(
      (now.getTime() - calledAt.getTime()) / 60000,
    );

    await this.db
      .update(schema.queueEntries)
      .set({ status: 'passed', servedAt: now, updatedAt: now })
      .where(eq(schema.queueEntries.id, entryId));

    await this.db.insert(schema.queueEvents).values({
      entryId,
      eventType: 'served',
      actorId: workerId,
      metadata: JSON.stringify({ serviceTimeMinutes }),
    });

    await this.db
      .update(schema.queueServices)
      .set({
        averageTime: sql`(COALESCE("average_time", 10) * 0.9 + ${serviceTimeMinutes} * 0.1)::decimal`,
        updatedAt: now,
      })
      .where(eq(schema.queueServices.id, entry.serviceId));

    this.queueGateway.broadcastEntryServed({ entryId, serviceId: entry.serviceId });
    await this.recalculatePositions(entry.serviceId);
    void this.sendQueueSnapshot(entry.serviceId);

    if (entry.userId) {
      void this.notificationsService.createNotification({
        toUserId: entry.userId,
        type: 'queue_called',
        title: "You've been served",
        message: 'Your visit is complete. Thank you for your patience!',
        resourceType: 'queue_entry',
        resourceId: entryId,
      });
    }

    return { success: true };
  }

  async getMyQueueEntry(userId: string, serviceId: string) {
    const entry = await this.db.query.queueEntries.findFirst({
      where: and(
        eq(schema.queueEntries.userId, userId),
        eq(schema.queueEntries.serviceId, serviceId),
        eq(schema.queueEntries.status, 'waiting'),
      ),
      with: {
        service: {
          with: { business: { columns: { id: true, name: true } } },
        },
      },
    });
    return entry ?? null;
  }

  async getQueueByEntry(entryId: string) {
    const entry = await this.db.query.queueEntries.findFirst({
      where: eq(schema.queueEntries.id, entryId),
      with: {
        service: {
          with: {
            business: { columns: { id: true, name: true, logoUrl: true, latitude: true, longitude: true, location: true } },
            guichets: { where: eq(schema.guichets.status, 'open') },
          },
        },
      },
    });
    if (!entry) throw new NotFoundException('Queue entry not found');
    // Derive deadline from when the estimate was last written, so clients
    // can resume an accurate countdown even after a page refresh.
    const updatedMs = entry.updatedAt ? new Date(entry.updatedAt).getTime() : Date.now();
    const deadlineAt = updatedMs + (Number(entry.estimatedWaitMinutes) || 0) * 60 * 1000;
    return { ...entry, deadlineAt };
  }

  async getServiceQueue(serviceId: string, limit = 50) {
    const activeWhere = and(
      eq(schema.queueEntries.serviceId, serviceId),
      inArray(schema.queueEntries.status, ['waiting', 'called']),
    );

    const [rows, totalResult] = await Promise.all([
      this.db.query.queueEntries.findMany({
        where: activeWhere,
        orderBy: [
          desc(schema.queueEntries.priority),
          asc(schema.queueEntries.entryTime),
        ],
        with: {
          user: {
            columns: { id: true, displayName: true, avatarUrl: true, username: true },
          },
        },
        limit,
      }),
      this.db
        .select({ count: count() })
        .from(schema.queueEntries)
        .where(activeWhere),
    ]);

    const total = Number(totalResult[0]?.count ?? 0);
    // Assign position from row order — never trust the stored DB column
    let waitingIndex = 0;
    const entries = rows.map((e) => {
      const position = e.status === 'waiting' ? ++waitingIndex : 0;
      return {
        ...e,
        position,
        deadlineAt:
          (e.updatedAt ? new Date(e.updatedAt).getTime() : Date.now()) +
          (Number(e.estimatedWaitMinutes) || 0) * 60 * 1000,
      };
    });

    return { entries, total, hasMore: total > limit };
  }

  private async sendQueueSnapshot(serviceId: string) {
    const data = await this.getServiceQueue(serviceId);
    this.queueGateway.broadcastQueueSnapshot({ serviceId, ...data });
  }

  async getEntryNeighborhood(entryId: string) {
    const entry = await this.db.query.queueEntries.findFirst({
      where: eq(schema.queueEntries.id, entryId),
      columns: { id: true, serviceId: true, status: true },
    });
    if (!entry) throw new NotFoundException('Queue entry not found');

    const range = 3;

    // Fetch all waiting entries in queue order to compute positions dynamically
    const [allWaiting, totalResult] = await Promise.all([
      this.db.query.queueEntries.findMany({
        where: and(
          eq(schema.queueEntries.serviceId, entry.serviceId),
          eq(schema.queueEntries.status, 'waiting'),
        ),
        columns: { id: true, groupSize: true },
        orderBy: [desc(schema.queueEntries.priority), asc(schema.queueEntries.entryTime)],
      }),
      this.db
        .select({ count: count() })
        .from(schema.queueEntries)
        .where(
          and(
            eq(schema.queueEntries.serviceId, entry.serviceId),
            eq(schema.queueEntries.status, 'waiting'),
          ),
        ),
    ]);

    const userIndex = allWaiting.findIndex((e) => e.id === entryId);
    const userPosition = userIndex >= 0 ? userIndex + 1 : 0;

    const sliceStart = Math.max(0, userIndex - range);
    const sliceEnd = Math.min(allWaiting.length, userIndex + range + 1);
    const neighbors = allWaiting.slice(sliceStart, sliceEnd);

    return {
      userPosition,
      totalWaiting: totalResult[0]?.count ?? 0,
      entries: neighbors.map((n, i) => ({
        id: n.id,
        position: sliceStart + i + 1,
        groupSize: n.groupSize ?? 1,
        isCurrentUser: n.id === entryId,
      })),
    };
  }

  async addWalkIn(
    serviceId: string,
    data: { name?: string; phone?: string; groupSize?: number; notes?: string; priority?: 'normal' | 'priority' | 'urgent' },
    actorId: string,
  ) {
    const service = await this.db.query.queueServices.findFirst({
      where: eq(schema.queueServices.id, serviceId),
      columns: { maxCapacity: true, isActive: true, averageTime: true },
    });
    if (!service || !service.isActive) throw new NotFoundException('Service not found or inactive');

    const currentCount = await this.db
      .select({ count: count() })
      .from(schema.queueEntries)
      .where(
        and(
          eq(schema.queueEntries.serviceId, serviceId),
          eq(schema.queueEntries.status, 'waiting'),
        ),
      );

    const waiting = currentCount[0]?.count ?? 0;
    if (waiting >= (service.maxCapacity ?? 200)) throw new BadRequestException('Queue is at maximum capacity');

    const position = waiting + 1;
    const avgTime = Number(service.averageTime ?? 10);
    const estimatedWaitMinutes = Math.round((position - 1) * avgTime);

    const noteParts: string[] = [];
    if (data.name) noteParts.push(`Walk-in: ${data.name}`);
    if (data.notes) noteParts.push(data.notes);
    const notes = noteParts.length ? noteParts.join(' — ') : 'Walk-in customer';

    const [entry] = await this.db
      .insert(schema.queueEntries)
      .values({
        serviceId,
        userId: null,
        anonymousPhone: data.phone,
        anonymousToken: `walkin-${Date.now()}`,
        groupSize: data.groupSize ?? 1,
        priority: data.priority ?? 'normal',
        status: 'waiting',
        estimatedWaitMinutes,
        notes,
      })
      .returning();

    await this.db.insert(schema.queueEvents).values({
      entryId: entry.id,
      eventType: 'joined',
      actorId,
      metadata: JSON.stringify({ walkIn: true, position }),
    });

    this.queueGateway.broadcastPositionUpdate({
      entryId: entry.id,
      serviceId,
      position,
      estimatedWaitMinutes,
      deadlineAt: Date.now() + estimatedWaitMinutes * 60 * 1000,
      status: 'waiting',
    });

    void this.sendQueueSnapshot(serviceId);
    return entry;
  }

  async markNoShow(entryId: string, actorId: string) {
    const entry = await this.db.query.queueEntries.findFirst({
      where: eq(schema.queueEntries.id, entryId),
    });
    if (!entry) throw new NotFoundException('Entry not found');

    await this.db
      .update(schema.queueEntries)
      .set({ status: 'no_show', updatedAt: new Date() })
      .where(eq(schema.queueEntries.id, entryId));

    await this.db.insert(schema.queueEvents).values({
      entryId,
      eventType: 'no_show',
      actorId,
    });

    await this.recalculatePositions(entry.serviceId);
    void this.sendQueueSnapshot(entry.serviceId);
    return { success: true };
  }

  private async recalculatePositions(serviceId: string) {
    const waiting = await this.db.query.queueEntries.findMany({
      where: and(
        eq(schema.queueEntries.serviceId, serviceId),
        eq(schema.queueEntries.status, 'waiting'),
      ),
      orderBy: [desc(schema.queueEntries.priority), asc(schema.queueEntries.entryTime)],
      with: {
        service: { columns: { averageTime: true } },
      },
    });

    for (let i = 0; i < waiting.length; i++) {
      const entry = waiting[i];
      const position = i + 1;
      const avgTime = Number(entry.service?.averageTime ?? 10);
      const estimatedWaitMinutes = Math.round(i * avgTime);
      const deadlineAt = Date.now() + estimatedWaitMinutes * 60 * 1000;

      await this.db
        .update(schema.queueEntries)
        .set({ estimatedWaitMinutes, updatedAt: new Date() })
        .where(eq(schema.queueEntries.id, entry.id));

      // Notify personal tracker via entry room
      this.queueGateway.broadcastPositionUpdate({
        entryId: entry.id,
        serviceId,
        position,
        estimatedWaitMinutes,
        deadlineAt,
        status: 'waiting',
      });
    }
  }
}
