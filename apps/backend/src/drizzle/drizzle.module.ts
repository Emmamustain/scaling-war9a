import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createDrizzle, DrizzleDB } from '@shared/drizzle';

export const DRIZZLE = Symbol('drizzle-connection');

@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<DrizzleDB> => {
        const connectionString = configService.get<string>('DATABASE_URL');
        if (!connectionString) {
          throw new Error('DATABASE_URL is not defined');
        }
        return createDrizzle(connectionString);
      },
    },
  ],
  imports: [ConfigModule],
  exports: [DRIZZLE],
})
export class DrizzleModule {}
