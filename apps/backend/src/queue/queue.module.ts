import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';
import { QueueGateway } from './queue.gateway';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { queueJoinRateLimit } from '../common/middleware/rate-limit.middleware';

@Module({
  imports: [DrizzleModule, AuthModule, NotificationsModule],
  controllers: [QueueController],
  providers: [QueueService, QueueGateway],
  exports: [QueueService, QueueGateway],
})
export class QueueModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(queueJoinRateLimit)
      .forRoutes('queue/service/*/join', 'queue/service/*/walk-in');
  }
}
