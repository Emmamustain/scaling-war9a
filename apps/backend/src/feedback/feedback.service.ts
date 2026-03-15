import { Injectable, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import { DrizzleDB, schema } from '@shared/drizzle';
import { and, avg, count, eq } from '@shared/drizzle/operators';
import { DRIZZLE } from '../drizzle/drizzle.module';

@Injectable()
export class FeedbackService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async submitFeedback(
    entryId: string,
    userId: string,
    data: { rating: number; comment?: string },
  ) {
    const entry = await this.db.query.queueEntries.findFirst({
      where: and(
        eq(schema.queueEntries.id, entryId),
        eq(schema.queueEntries.userId, userId),
        eq(schema.queueEntries.status, 'passed'),
      ),
      with: { service: { columns: { businessId: true } } },
    });
    if (!entry) throw new NotFoundException('Queue entry not found or not eligible for feedback');

    const existing = await this.db.query.serviceFeedback.findFirst({
      where: eq(schema.serviceFeedback.entryId, entryId),
    });
    if (existing) throw new ConflictException('Feedback already submitted for this visit');

    const [feedback] = await this.db
      .insert(schema.serviceFeedback)
      .values({
        entryId,
        userId,
        businessId: entry.service!.businessId,
        rating: data.rating,
        comment: data.comment,
      })
      .returning();

    const avgResult = await this.db
      .select({ avg: avg(schema.serviceFeedback.rating) })
      .from(schema.serviceFeedback)
      .where(eq(schema.serviceFeedback.businessId, entry.service!.businessId));

    const avgRating = Math.round(Number(avgResult[0]?.avg ?? 0));
    await this.db
      .update(schema.businesses)
      .set({ avgWaitTime: avgRating, updatedAt: new Date() })
      .where(eq(schema.businesses.id, entry.service!.businessId));

    return feedback;
  }

  async getBusinessFeedback(businessId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const [feedback, stats] = await Promise.all([
      this.db.query.serviceFeedback.findMany({
        where: eq(schema.serviceFeedback.businessId, businessId),
        limit,
        offset,
        orderBy: (f, { desc }) => [desc(f.createdAt)],
        with: {
          user: { columns: { id: true, displayName: true, avatarUrl: true, username: true } },
        },
      }),
      this.db
        .select({ avg: avg(schema.serviceFeedback.rating), count: count() })
        .from(schema.serviceFeedback)
        .where(eq(schema.serviceFeedback.businessId, businessId)),
    ]);

    return {
      feedback,
      avgRating: Math.round(Number(stats[0]?.avg ?? 0) * 10) / 10,
      totalReviews: stats[0]?.count ?? 0,
    };
  }
}
