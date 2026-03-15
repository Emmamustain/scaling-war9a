import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS = Symbol('redis-connection');

@Global()
@Module({
  providers: [
    {
      provide: REDIS,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Redis => {
        const redisUrl = configService.get<string>('REDIS_URL') ?? 'redis://localhost:6379';
        const password = configService.get<string>('REDIS_PASSWORD');
        return new Redis(redisUrl, {
          password: password || undefined,
          lazyConnect: false,
          retryStrategy: (times) => Math.min(times * 100, 3000),
        });
      },
    },
  ],
  imports: [ConfigModule],
  exports: [REDIS],
})
export class RedisModule {}
