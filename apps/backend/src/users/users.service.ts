import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DrizzleDB, schema } from '@shared/drizzle';
import { eq, or, ilike } from '@shared/drizzle/operators';
import { DRIZZLE } from '../drizzle/drizzle.module';

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async search(q: string, limit = 10) {
    if (!q || q.trim().length < 2) return [];
    const term = `%${q.trim()}%`;
    return this.db.query.users.findMany({
      where: or(
        ilike(schema.users.displayName, term),
        ilike(schema.users.email, term),
        ilike(schema.users.username, term),
      ),
      columns: { id: true, displayName: true, email: true, avatarUrl: true, username: true },
      limit,
    });
  }

  async findById(id: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, id),
    });
    if (!user) throw new NotFoundException('User not found');
    const { ...userWithoutSensitive } = user;
    return userWithoutSensitive;
  }

  async updateProfile(
    userId: string,
    data: {
      displayName?: string;
      city?: string;
      phone?: string;
      preferredLanguage?: string;
      latitude?: string;
      longitude?: string;
    },
  ) {
    const [updated] = await this.db
      .update(schema.users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.users.id, userId))
      .returning();
    return updated;
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    const [updated] = await this.db
      .update(schema.users)
      .set({ avatarUrl, updatedAt: new Date() })
      .where(eq(schema.users.id, userId))
      .returning();
    return updated;
  }

  async updateUsername(userId: string, username: string) {
    const existing = await this.db.query.users.findFirst({
      where: eq(schema.users.username, username),
      columns: { id: true },
    });
    if (existing && existing.id !== userId) {
      throw new Error('Username already taken');
    }
    const [updated] = await this.db
      .update(schema.users)
      .set({ username, usernameNeedsSetup: false, updatedAt: new Date() })
      .where(eq(schema.users.id, userId))
      .returning();
    return updated;
  }
}
