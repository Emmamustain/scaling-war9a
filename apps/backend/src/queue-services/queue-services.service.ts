import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DrizzleDB, schema } from '@shared/drizzle';
import { and, eq } from '@shared/drizzle/operators';
import { DRIZZLE } from '../drizzle/drizzle.module';

@Injectable()
export class QueueServicesService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findByBusiness(businessId: string) {
    return this.db.query.queueServices.findMany({
      where: and(
        eq(schema.queueServices.businessId, businessId),
        eq(schema.queueServices.isActive, true),
      ),
      with: {
        guichets: {
          with: { currentWorker: { columns: { id: true, displayName: true, avatarUrl: true } } },
        },
      },
    });
  }

  async create(
    businessId: string,
    data: { name: string; description?: string; averageTime?: string; maxCapacity?: number },
  ) {
    const [service] = await this.db
      .insert(schema.queueServices)
      .values({ ...data, businessId })
      .returning();
    return service;
  }

  async update(
    serviceId: string,
    data: { name?: string; description?: string; averageTime?: string; maxCapacity?: number; isActive?: boolean },
  ) {
    const [updated] = await this.db
      .update(schema.queueServices)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.queueServices.id, serviceId))
      .returning();
    if (!updated) throw new NotFoundException('Service not found');
    return updated;
  }

  async delete(serviceId: string) {
    await this.db
      .update(schema.queueServices)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(schema.queueServices.id, serviceId));
  }
}
