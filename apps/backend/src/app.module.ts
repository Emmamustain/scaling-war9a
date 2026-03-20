import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DrizzleModule } from './drizzle/drizzle.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { UsersModule } from './users/users.module';
import { BusinessesModule } from './businesses/businesses.module';
import { QueueServicesModule } from './queue-services/queue-services.module';
import { GuichetsModule } from './guichets/guichets.module';
import { QueueModule } from './queue/queue.module';
import { WorkersModule } from './workers/workers.module';
import { CategoriesModule } from './categories/categories.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AdminModule } from './admin/admin.module';
import { UploadsModule } from './uploads/uploads.module';
import { QrCodeModule } from './qr-code/qr-code.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { FeedbackModule } from './feedback/feedback.module';
import { DatabaseSchemaGuardService } from './common/startup/database-schema-guard.service';
import { validateEnvironment } from './config/env.validation';
import { MetricsModule } from './metrics/metrics.module';
import { MetricsMiddleware } from './metrics/metrics.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    DrizzleModule,
    RedisModule,
    EmailModule,
    AuthModule,
    UsersModule,
    BusinessesModule,
    QueueServicesModule,
    GuichetsModule,
    QueueModule,
    WorkersModule,
    CategoriesModule,
    NotificationsModule,
    AnalyticsModule,
    AdminModule,
    UploadsModule,
    QrCodeModule,
    AppointmentsModule,
    FeedbackModule,
    MetricsModule,
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseSchemaGuardService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MetricsMiddleware).forRoutes('*');
  }
}
