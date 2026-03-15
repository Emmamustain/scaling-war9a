import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { DrizzleDB, schema } from '@shared/drizzle';
import { and, eq, count, asc, gt, sql } from '@shared/drizzle/operators';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { QueueGateway } from './queue.gateway';
import { randomBytes } from 'crypto';

@Injectable()
export class QueueService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly queueGateway: QueueGateway,
  ) {}

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
      const existing = await this.db.query.queueEntries.findFirst({
        where: and(
          eq(schema.queueEntries.serviceId, serviceId),
          eq(schema.queueEntries.userId, options.userId),
          eq(schema.queueEntries.status, 'waiting'),
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
    if (waiting >= (service.maxCapacity ?? 200)) {
      throw new BadRequestException('Queue is at maximum capacity');
    }

    const position = waiting + 1;
    const avgTime = Number(service.averageTime ?? 10);
    const estimatedWaitMinutes = (position - 1) * avgTime;

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
        position,
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

    this.queueGateway.broadcastPositionUpdate({
      entryId: entry.id,
      serviceId,
      position,
      estimatedWaitMinutes,
      status: 'waiting',
    });

    return { ...entry, position, estimatedWaitMinutes };
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

    return { success: true };
  }

  async callNext(serviceId: string, guichetId: string, workerId: string) {
    const nextEntry = await this.db.query.queueEntries.findFirst({
      where: and(
        eq(schema.queueEntries.serviceId, serviceId),
        eq(schema.queueEntries.status, 'waiting'),
      ),
      orderBy: [
        asc(schema.queueEntries.priority),
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

    const now = new Date();
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

    await this.recalculatePositions(serviceId);

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
            business: { columns: { id: true, name: true, logoUrl: true } },
            guichets: { where: eq(schema.guichets.status, 'open') },
          },
        },
      },
    });
    if (!entry) throw new NotFoundException('Queue entry not found');
    return entry;
  }

  async getServiceQueue(serviceId: string) {
    return this.db.query.queueEntries.findMany({
      where: and(
        eq(schema.queueEntries.serviceId, serviceId),
        eq(schema.queueEntries.status, 'waiting'),
      ),
      orderBy: [
        asc(schema.queueEntries.priority),
        asc(schema.queueEntries.entryTime),
      ],
      with: {
        user: {
          columns: { id: true, displayName: true, avatarUrl: true, username: true },
        },
      },
    });
  }

  private async recalculatePositions(serviceId: string) {
    const waiting = await this.db.query.queueEntries.findMany({
      where: and(
        eq(schema.queueEntries.serviceId, serviceId),
        eq(schema.queueEntries.status, 'waiting'),
      ),
      orderBy: [asc(schema.queueEntries.priority), asc(schema.queueEntries.entryTime)],
      with: {
        service: { columns: { averageTime: true } },
      },
    });

    for (let i = 0; i < waiting.length; i++) {
      const entry = waiting[i];
      const position = i + 1;
      const avgTime = Number(entry.service?.averageTime ?? 10);
      const estimatedWaitMinutes = i * avgTime;

      await this.db
        .update(schema.queueEntries)
        .set({ position, estimatedWaitMinutes, updatedAt: new Date() })
        .where(eq(schema.queueEntries.id, entry.id));

      this.queueGateway.broadcastPositionUpdate({
        entryId: entry.id,
        serviceId,
        position,
        estimatedWaitMinutes,
        status: 'waiting',
      });
    }
  }
}
