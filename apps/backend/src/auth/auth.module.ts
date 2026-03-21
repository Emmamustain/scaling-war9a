import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { BetterAuthService } from './better-auth.service';
import { BetterAuthController } from './better-auth.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { authRateLimit } from '../common/middleware/rate-limit.middleware';

@Module({
  imports: [DrizzleModule],
  controllers: [BetterAuthController],
  providers: [BetterAuthService],
  exports: [BetterAuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(authRateLimit).forRoutes('auth/*path');
  }
}
