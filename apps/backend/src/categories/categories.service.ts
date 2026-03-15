import { Injectable, Inject } from '@nestjs/common';
import { DrizzleDB, schema } from '@shared/drizzle';
import { DRIZZLE } from '../drizzle/drizzle.module';

@Injectable()
export class CategoriesService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAll() {
    return this.db.query.categories.findMany({
      orderBy: (cats, { asc }) => [asc(cats.name)],
    });
  }

  async create(data: { name: string; slug: string; description?: string; iconName?: string }) {
    const [category] = await this.db
      .insert(schema.categories)
      .values(data)
      .returning();
    return category;
  }
}
