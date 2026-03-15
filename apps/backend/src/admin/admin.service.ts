import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DrizzleDB, schema } from '@shared/drizzle';
import { eq, ilike, desc, and, or, count } from '@shared/drizzle/operators';
import { DRIZZLE } from '../drizzle/drizzle.module';

@Injectable()
export class AdminService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async getUsers(query?: { search?: string; role?: string; page?: number; limit?: number }) {
    const page = query?.page ?? 1;
    const limit = Math.min(query?.limit ?? 20, 100);
    const offset = (page - 1) * limit;

    const conditions = [];
    if (query?.search) {
      conditions.push(
        or(
          ilike(schema.users.email, `%${query.search}%`),
          ilike(schema.users.username, `%${query.search}%`),
          ilike(schema.users.displayName, `%${query.search}%`),
        ),
      );
    }
    if (query?.role) {
      conditions.push(
        eq(schema.users.role, query.role as typeof schema.users.$inferSelect['role']),
      );
    }

    const [users, total] = await Promise.all([
      this.db.query.users.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        limit,
        offset,
        orderBy: [desc(schema.users.createdAt)],
      }),
      this.db
        .select({ count: count() })
        .from(schema.users)
        .where(conditions.length > 0 ? and(...conditions) : undefined),
    ]);

    return { data: users, total: total[0]?.count ?? 0, page, limit };
  }

  async banUser(userId: string, banReason: string) {
    const [updated] = await this.db
      .update(schema.users)
      .set({ isBanned: true, banReason, updatedAt: new Date() })
      .where(eq(schema.users.id, userId))
      .returning({ id: schema.users.id });
    if (!updated) throw new NotFoundException('User not found');
    return { success: true };
  }

  async unbanUser(userId: string) {
    await this.db
      .update(schema.users)
      .set({ isBanned: false, banReason: null, updatedAt: new Date() })
      .where(eq(schema.users.id, userId));
    return { success: true };
  }

  async updateUserRole(userId: string, role: string) {
    const [updated] = await this.db
      .update(schema.users)
      .set({ role: role as typeof schema.users.$inferSelect['role'], updatedAt: new Date() })
      .where(eq(schema.users.id, userId))
      .returning();
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async getBusinesses(query?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query?.page ?? 1;
    const limit = Math.min(query?.limit ?? 20, 100);
    const offset = (page - 1) * limit;

    const conditions = [];
    if (query?.search) {
      conditions.push(
        or(
          ilike(schema.businesses.name, `%${query.search}%`),
          ilike(schema.businesses.city, `%${query.search}%`),
        ),
      );
    }
    if (query?.status) {
      conditions.push(
        eq(schema.businesses.status, query.status as typeof schema.businesses.$inferSelect['status']),
      );
    }

    const [businesses, total] = await Promise.all([
      this.db.query.businesses.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        limit,
        offset,
        orderBy: [desc(schema.businesses.createdAt)],
        with: {
          owner: { columns: { id: true, displayName: true, email: true } },
          categories: { with: { category: true } },
        },
      }),
      this.db
        .select({ count: count() })
        .from(schema.businesses)
        .where(conditions.length > 0 ? and(...conditions) : undefined),
    ]);

    return { data: businesses, total: total[0]?.count ?? 0, page, limit };
  }

  async approveBusiness(businessId: string) {
    const [updated] = await this.db
      .update(schema.businesses)
      .set({ status: 'active', updatedAt: new Date() })
      .where(eq(schema.businesses.id, businessId))
      .returning({ id: schema.businesses.id });
    if (!updated) throw new NotFoundException('Business not found');
    return { success: true };
  }

  async suspendBusiness(businessId: string) {
    await this.db
      .update(schema.businesses)
      .set({ status: 'suspended', updatedAt: new Date() })
      .where(eq(schema.businesses.id, businessId));
    return { success: true };
  }

  async featureBusiness(businessId: string, featured: boolean) {
    await this.db
      .update(schema.businesses)
      .set({ featured, updatedAt: new Date() })
      .where(eq(schema.businesses.id, businessId));
    return { success: true };
  }
}
