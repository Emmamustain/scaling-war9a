import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DrizzleDB, schema } from '@shared/drizzle';
import { and, eq } from '@shared/drizzle/operators';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { randomBytes } from 'crypto';

@Injectable()
export class WorkersService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async getBusinessWorkers(businessId: string) {
    return this.db.query.businessWorkers.findMany({
      where: eq(schema.businessWorkers.businessId, businessId),
      with: {
        user: {
          columns: {
            id: true, displayName: true, username: true, avatarUrl: true, email: true,
          },
        },
      },
    });
  }

  async addWorker(
    businessId: string,
    data: { userId?: string; role?: string },
  ) {
    const inviteToken = !data.userId
      ? randomBytes(20).toString('hex')
      : undefined;

    const [worker] = await this.db
      .insert(schema.businessWorkers)
      .values({
        businessId,
        userId: data.userId!,
        role: (data.role ?? 'worker') as typeof schema.businessWorkers.$inferInsert['role'],
        inviteToken,
      })
      .returning();
    return worker;
  }

  async removeWorker(workerId: string) {
    const [removed] = await this.db
      .delete(schema.businessWorkers)
      .where(eq(schema.businessWorkers.id, workerId))
      .returning();
    if (!removed) throw new NotFoundException('Worker not found');
    return { success: true };
  }

  async updateWorkerRole(workerId: string, role: string) {
    const [updated] = await this.db
      .update(schema.businessWorkers)
      .set({ role: role as typeof schema.businessWorkers.$inferInsert['role'], updatedAt: new Date() })
      .where(eq(schema.businessWorkers.id, workerId))
      .returning();
    if (!updated) throw new NotFoundException('Worker not found');
    return updated;
  }

  async getWorkerProfile(userId: string, businessId: string) {
    return this.db.query.businessWorkers.findFirst({
      where: and(
        eq(schema.businessWorkers.userId, userId),
        eq(schema.businessWorkers.businessId, businessId),
      ),
      with: {
        business: { columns: { id: true, name: true, logoUrl: true } },
      },
    });
  }
}
