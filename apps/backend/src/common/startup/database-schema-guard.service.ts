import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { DRIZZLE } from '../../drizzle/drizzle.module';
import { DrizzleDB } from '@shared/drizzle';
import { sql } from '@shared/drizzle/operators';

@Injectable()
export class DatabaseSchemaGuardService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSchemaGuardService.name);

  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async onModuleInit(): Promise<void> {
    const requiredTables = [
      'users',
      'sessions',
      'accounts',
      'businesses',
      'queue_services',
      'guichets',
      'queue_entries',
      'notifications',
    ];

    try {
      const result = await this.db.execute(
        sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`,
      );
      const existingTables = new Set(
        (result.rows as Array<{ table_name: string }>).map((r) => r.table_name),
      );

      for (const table of requiredTables) {
        if (!existingTables.has(table)) {
          throw new Error(
            `Required table "${table}" does not exist. Run migrations first.`,
          );
        }
      }
      this.logger.log('database_schema_guard_passed');
    } catch (error) {
      this.logger.error('database_schema_guard_failed', error);
      throw error;
    }
  }
}
