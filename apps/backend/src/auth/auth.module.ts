import { Module } from '@nestjs/common';
import { BetterAuthService } from './better-auth.service';
import { BetterAuthController } from './better-auth.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule],
  controllers: [BetterAuthController],
  providers: [BetterAuthService],
  exports: [BetterAuthService],
})
export class AuthModule {}
