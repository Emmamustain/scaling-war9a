import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DrizzleDB, schema } from '@shared/drizzle';
import { eq } from '@shared/drizzle/operators';
import { DRIZZLE } from '../drizzle/drizzle.module';

@Injectable()
export class GuichetsService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findByBusiness(businessId: string) {
    return this.db.query.guichets.findMany({
      where: eq(schema.guichets.businessId, businessId),
      with: {
        service: true,
        currentWorker: {
          columns: { id: true, displayName: true, avatarUrl: true, username: true },
        },
      },
    });
  }

  async create(businessId: string, data: { name: string; serviceId?: string }) {
    const [guichet] = await this.db
      .insert(schema.guichets)
      .values({ ...data, businessId, status: 'closed' })
      .returning();
    return guichet;
  }

  async updateStatus(
    guichetId: string,
    status: 'open' | 'closed' | 'paused',
    workerId?: string,
  ) {
    const [updated] = await this.db
      .update(schema.guichets)
      .set({
        status,
        currentWorkerId: status === 'open' ? workerId : null,
        updatedAt: new Date(),
      })
      .where(eq(schema.guichets.id, guichetId))
      .returning();
    if (!updated) throw new NotFoundException('Guichet not found');
    return updated;
  }

  async assignWorker(guichetId: string, workerId: string | null) {
    const [updated] = await this.db
      .update(schema.guichets)
      .set({ currentWorkerId: workerId, updatedAt: new Date() })
      .where(eq(schema.guichets.id, guichetId))
      .returning();
    if (!updated) throw new NotFoundException('Guichet not found');
    return updated;
  }

  async assignService(guichetId: string, serviceId: string | null) {
    const [updated] = await this.db
      .update(schema.guichets)
      .set({ serviceId: serviceId ?? undefined, updatedAt: new Date() })
      .where(eq(schema.guichets.id, guichetId))
      .returning();
    if (!updated) throw new NotFoundException('Guichet not found');
    return updated;
  }

  async remove(guichetId: string) {
    const [removed] = await this.db
      .delete(schema.guichets)
      .where(eq(schema.guichets.id, guichetId))
      .returning();
    if (!removed) throw new NotFoundException('Guichet not found');
    return { success: true };
  }
}
