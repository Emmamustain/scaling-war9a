import { Module } from '@nestjs/common';
import { GuichetsService } from './guichets.service';
import { GuichetsController } from './guichets.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DrizzleModule, AuthModule],
  controllers: [GuichetsController],
  providers: [GuichetsService],
  exports: [GuichetsService],
})
export class GuichetsModule {}
