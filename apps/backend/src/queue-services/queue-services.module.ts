import { Module } from '@nestjs/common';
import { QueueServicesService } from './queue-services.service';
import { QueueServicesController } from './queue-services.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DrizzleModule, AuthModule],
  controllers: [QueueServicesController],
  providers: [QueueServicesService],
  exports: [QueueServicesService],
})
export class QueueServicesModule {}
