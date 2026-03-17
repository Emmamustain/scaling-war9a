import { BadRequestException, ConflictException, Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DrizzleDB, schema } from '@shared/drizzle';
import { and, eq } from '@shared/drizzle/operators';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';

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
    data: { userId?: string; email?: string; role?: string },
  ) {
    let userId = data.userId;

    if (!userId && data.email) {
      const user = await this.db.query.users.findFirst({
        where: eq(schema.users.email, data.email),
        columns: { id: true },
      });
      if (!user) throw new NotFoundException(`No user found with email ${data.email}`);
      userId = user.id;
    }

    if (!userId) {
      throw new BadRequestException('Either userId or email is required');
    }

    const inviteToken = !userId ? randomBytes(20).toString('hex') : undefined;

    const [worker] = await this.db
      .insert(schema.businessWorkers)
      .values({
        businessId,
        userId,
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

  async provisionWorker(
    businessId: string,
    data: { email: string; displayName: string; role?: string },
  ) {
    const existing = await this.db.query.users.findFirst({
      where: eq(schema.users.email, data.email),
      columns: { id: true },
    });
    if (existing) throw new ConflictException('A user with this email already exists — search for them instead');

    // Generate a readable temp password: War9a-XXXXXX
    const tempPassword = `War9a-${randomBytes(3).toString('hex').toUpperCase()}`;
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Derive a unique username from email prefix
    const baseUsername = data.email.split('@')[0]!.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    let username = baseUsername;
    let suffix = 0;
    while (true) {
      const taken = await this.db.query.users.findFirst({
        where: eq(schema.users.username, username),
        columns: { id: true },
      });
      if (!taken) break;
      suffix += 1;
      username = `${baseUsername}${suffix}`;
    }

    const [user] = await this.db
      .insert(schema.users)
      .values({
        email: data.email,
        displayName: data.displayName,
        username,
        emailVerified: false,
        usernameNeedsSetup: true,
        role: 'worker',
      })
      .returning();

    await this.db.insert(schema.accounts).values({
      accountId: data.email,
      providerId: 'credential',
      userId: user.id,
      password: hashedPassword,
    });

    const [worker] = await this.db
      .insert(schema.businessWorkers)
      .values({
        businessId,
        userId: user.id,
        role: (data.role ?? 'worker') as typeof schema.businessWorkers.$inferInsert['role'],
      })
      .returning();

    return { worker, user: { id: user.id, email: user.email, displayName: user.displayName }, tempPassword };
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
