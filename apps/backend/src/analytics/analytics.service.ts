import { Injectable, Inject } from '@nestjs/common';
import { DrizzleDB, schema } from '@shared/drizzle';
import { and, avg, count, eq, gte, lte, sql } from '@shared/drizzle/operators';
import { DRIZZLE } from '../drizzle/drizzle.module';

@Injectable()
export class AnalyticsService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async getBusinessAnalytics(
    businessId: string,
    from?: Date,
    to?: Date,
  ) {
    const fromDate = from ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate = to ?? new Date();

    const conditions = [
      eq(schema.queueEntries.serviceId, sql`ANY(
        SELECT id FROM queue_services WHERE business_id = ${businessId}
      )`),
      gte(schema.queueEntries.createdAt, fromDate),
      lte(schema.queueEntries.createdAt, toDate),
    ];

    const [totalEntries, servedEntries, avgWaitTime, avgRating] =
      await Promise.all([
        this.db
          .select({ count: count() })
          .from(schema.queueEntries)
          .where(and(...conditions)),
        this.db
          .select({ count: count() })
          .from(schema.queueEntries)
          .where(and(...conditions, eq(schema.queueEntries.status, 'passed'))),
        this.db
          .select({ avg: avg(schema.queueEntries.estimatedWaitMinutes) })
          .from(schema.queueEntries)
          .where(and(...conditions, eq(schema.queueEntries.status, 'passed'))),
        this.db
          .select({ avg: avg(schema.serviceFeedback.rating) })
          .from(schema.serviceFeedback)
          .where(
            and(
              eq(schema.serviceFeedback.businessId, businessId),
              gte(schema.serviceFeedback.createdAt, fromDate),
              lte(schema.serviceFeedback.createdAt, toDate),
            ),
          ),
      ]);

    const hourlyDistribution = await this.db.execute(sql`
      SELECT EXTRACT(HOUR FROM entry_time)::integer as hour, COUNT(*) as count
      FROM queue_entries
      WHERE service_id = ANY(SELECT id FROM queue_services WHERE business_id = ${businessId})
        AND entry_time >= ${fromDate}
        AND entry_time <= ${toDate}
      GROUP BY EXTRACT(HOUR FROM entry_time)
      ORDER BY hour
    `);

    const dailyTrend = await this.db.execute(sql`
      SELECT DATE(entry_time) as date, COUNT(*) as count, AVG(estimated_wait_minutes) as avg_wait
      FROM queue_entries
      WHERE service_id = ANY(SELECT id FROM queue_services WHERE business_id = ${businessId})
        AND entry_time >= ${fromDate}
        AND entry_time <= ${toDate}
        AND status = 'passed'
      GROUP BY DATE(entry_time)
      ORDER BY date
    `);

    const workerPerformance = await this.db.execute(sql`
      SELECT 
        u.id, u.display_name, u.username, u.avatar_url,
        COUNT(qe.id) as customers_served,
        AVG(ws.avg_service_time) as avg_service_time,
        bw.score
      FROM business_workers bw
      JOIN users u ON u.id = bw.user_id
      LEFT JOIN worker_sessions ws ON ws.worker_id = u.id AND ws.business_id = ${businessId}
        AND ws.shift_start >= ${fromDate}
      LEFT JOIN queue_entries qe ON qe.served_by_guichet_id IN (
        SELECT id FROM guichets WHERE business_id = ${businessId} AND current_worker_id = u.id
      ) AND qe.status = 'passed' AND qe.served_at >= ${fromDate}
      WHERE bw.business_id = ${businessId}
      GROUP BY u.id, u.display_name, u.username, u.avatar_url, bw.score
      ORDER BY customers_served DESC
    `);

    return {
      period: { from: fromDate, to: toDate },
      summary: {
        totalEntries: totalEntries[0]?.count ?? 0,
        servedEntries: servedEntries[0]?.count ?? 0,
        avgWaitMinutes: Math.round(Number(avgWaitTime[0]?.avg ?? 0)),
        avgRating: Math.round(Number(avgRating[0]?.avg ?? 0) * 10) / 10,
        servedRate:
          totalEntries[0]?.count
            ? Math.round((Number(servedEntries[0]?.count ?? 0) / Number(totalEntries[0].count)) * 100)
            : 0,
      },
      hourlyDistribution: hourlyDistribution.rows,
      dailyTrend: dailyTrend.rows,
      workerPerformance: workerPerformance.rows,
    };
  }

  async getAdminAnalytics() {
    const [
      totalUsers,
      totalBusinesses,
      totalEntriesToday,
      topCities,
      topCategories,
    ] = await Promise.all([
      this.db.select({ count: count() }).from(schema.users),
      this.db
        .select({ count: count() })
        .from(schema.businesses)
        .where(eq(schema.businesses.status, 'active')),
      this.db
        .select({ count: count() })
        .from(schema.queueEntries)
        .where(gte(schema.queueEntries.createdAt, new Date(Date.now() - 86400000))),
      this.db.execute(sql`
        SELECT city, COUNT(*) as count
        FROM businesses
        WHERE status = 'active'
        GROUP BY city
        ORDER BY count DESC
        LIMIT 10
      `),
      this.db.execute(sql`
        SELECT c.name, c.slug, COUNT(bc.business_id) as count
        FROM categories c
        LEFT JOIN business_categories bc ON bc.category_id = c.id
        LEFT JOIN businesses b ON b.id = bc.business_id AND b.status = 'active'
        GROUP BY c.id, c.name, c.slug
        ORDER BY count DESC
      `),
    ]);

    return {
      totalUsers: totalUsers[0]?.count ?? 0,
      totalBusinesses: totalBusinesses[0]?.count ?? 0,
      entriesToday: totalEntriesToday[0]?.count ?? 0,
      activeBusinesses: totalBusinesses[0]?.count ?? 0,
      topCities: topCities.rows,
      topCategories: topCategories.rows,
    };
  }
}
