import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DrizzleDB, schema } from '@shared/drizzle';
import { and, eq, ilike, desc, sql, inArray } from '@shared/drizzle/operators';
import { DRIZZLE } from '../drizzle/drizzle.module';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class BusinessesService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAll(query?: {
    city?: string;
    category?: string;
    search?: string;
    featured?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = query?.page ?? 1;
    const limit = Math.min(query?.limit ?? 20, 200);
    const offset = (page - 1) * limit;

    const conditions = [eq(schema.businesses.status, 'active')];

    if (query?.city) {
      conditions.push(ilike(schema.businesses.city, `%${query.city}%`));
    }
    if (query?.featured) {
      conditions.push(eq(schema.businesses.featured, true));
    }
    if (query?.search) {
      conditions.push(
        ilike(schema.businesses.name, `%${query.search}%`),
      );
    }

    const [businesses, countResult] = await Promise.all([
      this.db.query.businesses.findMany({
        where: and(...conditions),
        limit,
        offset,
        orderBy: [desc(schema.businesses.featured), desc(schema.businesses.createdAt)],
        with: {
          categories: { with: { category: true } },
          services: { where: eq(schema.queueServices.isActive, true) },
        },
      }),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.businesses)
        .where(and(...conditions)),
    ]);

    const total = countResult[0]?.count ?? 0;

    return {
      data: businesses,
      total,
      page,
      limit,
      hasNextPage: offset + businesses.length < total,
    };
  }

  async findBySlug(slug: string) {
    const business = await this.db.query.businesses.findFirst({
      where: and(
        eq(schema.businesses.slug, slug),
        eq(schema.businesses.status, 'active'),
      ),
      with: {
        categories: { with: { category: true } },
        services: { where: eq(schema.queueServices.isActive, true) },
        hours: true,
      },
    });
    if (!business) throw new NotFoundException('Business not found');
    return business;
  }

  async findByOwner(ownerId: string) {
    return this.db.query.businesses.findMany({
      where: eq(schema.businesses.ownerId, ownerId),
      with: {
        categories: { with: { category: true } },
        services: true,
      },
    });
  }

  async create(
    ownerId: string,
    data: {
      name: string;
      description: string;
      location: string;
      city: string;
      phone?: string;
      latitude?: string;
      longitude?: string;
      zipCode?: string;
      categoryIds?: string[];
    },
  ) {
    let slug = slugify(data.name);
    const existing = await this.db.query.businesses.findFirst({
      where: eq(schema.businesses.slug, slug),
      columns: { id: true },
    });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-6)}`;
    }

    const [business] = await this.db
      .insert(schema.businesses)
      .values({
        name: data.name,
        ownerId,
        slug,
        description: data.description,
        location: data.location,
        city: data.city,
        phone: data.phone,
        latitude: data.latitude ?? '0',
        longitude: data.longitude ?? '0',
        zipCode: data.zipCode,
        status: 'pending',
      })
      .returning();

    if (data.categoryIds?.length) {
      await this.db.insert(schema.businessCategories).values(
        data.categoryIds.map((categoryId) => ({
          businessId: business.id,
          categoryId,
        })),
      );
    }

    return business;
  }

  async findBySlugForOwner(slug: string, ownerId: string) {
    const business = await this.db.query.businesses.findFirst({
      where: eq(schema.businesses.slug, slug),
      with: {
        categories: { with: { category: true } },
        services: true,
        hours: { orderBy: (h, { asc }) => [asc(h.dayOfWeek)] },
        workers: {
          with: {
            user: {
              columns: { id: true, displayName: true, email: true, avatarUrl: true },
            },
          },
        },
      },
    });
    if (!business) throw new NotFoundException('Business not found');
    if (business.ownerId !== ownerId) throw new ForbiddenException('Not authorized');
    return business;
  }

  async update(
    businessId: string,
    userId: string,
    data: Partial<{
      name: string;
      description: string;
      location: string;
      city: string;
      phone: string;
      latitude: string;
      longitude: string;
      logoUrl: string;
      coverUrl: string;
      isOpen: boolean;
    }>,
  ) {
    const business = await this.db.query.businesses.findFirst({
      where: eq(schema.businesses.id, businessId),
      columns: { id: true, ownerId: true },
    });
    if (!business) throw new NotFoundException('Business not found');
    if (business.ownerId !== userId) throw new ForbiddenException('Not authorized');

    const [updated] = await this.db
      .update(schema.businesses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.businesses.id, businessId))
      .returning();
    return updated;
  }

  async upsertHours(
    businessId: string,
    ownerId: string,
    hours: Array<{ dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean }>,
  ) {
    const business = await this.db.query.businesses.findFirst({
      where: eq(schema.businesses.id, businessId),
      columns: { id: true, ownerId: true },
    });
    if (!business) throw new NotFoundException('Business not found');
    if (business.ownerId !== ownerId) throw new ForbiddenException('Not authorized');

    await this.db
      .delete(schema.businessHours)
      .where(eq(schema.businessHours.businessId, businessId));

    if (hours.length > 0) {
      await this.db.insert(schema.businessHours).values(
        hours.map((h) => ({ ...h, businessId })),
      );
    }

    return this.db.query.businessHours.findMany({
      where: eq(schema.businessHours.businessId, businessId),
      orderBy: (h, { asc }) => [asc(h.dayOfWeek)],
    });
  }

  async findWorkerBusinesses(userId: string) {
    const workerProfiles = await this.db.query.businessWorkers.findMany({
      where: eq(schema.businessWorkers.userId, userId),
      with: {
        business: {
          with: {
            categories: { with: { category: true } },
            services: { where: eq(schema.queueServices.isActive, true) },
          },
        },
      },
    });
    return workerProfiles.map((wp) => ({
      ...wp.business,
      workerRole: wp.role,
      workerId: wp.id,
    }));
  }
}
