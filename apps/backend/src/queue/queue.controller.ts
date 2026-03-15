import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { QueueService } from './queue.service';
import { JwtAuthGuard, OptionalJwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { TReqUser } from '@shared/types';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

class JoinQueueDto {
  @IsOptional() @IsString() anonymousPhone?: string;
  @IsOptional() @IsNumber() @Min(1) @Max(20) groupSize?: number;
  @IsOptional() @IsIn(['normal', 'priority', 'urgent']) priority?: 'normal' | 'priority' | 'urgent';
  @IsOptional() @IsString() notes?: string;
}

class CallNextDto {
  @IsUUID() guichetId!: string;
}

@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Get('service/:serviceId/status')
  getServiceStatus(@Param('serviceId') serviceId: string) {
    return this.queueService.getServiceQueueStatus(serviceId);
  }

  @Get('service/:serviceId/entries')
  @UseGuards(JwtAuthGuard)
  getServiceQueue(@Param('serviceId') serviceId: string) {
    return this.queueService.getServiceQueue(serviceId);
  }

  @Get('entry/:entryId')
  @UseGuards(OptionalJwtAuthGuard)
  getEntry(@Param('entryId') entryId: string) {
    return this.queueService.getQueueByEntry(entryId);
  }

  @Get('my/:serviceId')
  @UseGuards(JwtAuthGuard)
  getMyEntry(
    @AuthUser() user: TReqUser,
    @Param('serviceId') serviceId: string,
  ) {
    return this.queueService.getMyQueueEntry(user.userId, serviceId);
  }

  @Post('service/:serviceId/join')
  @UseGuards(OptionalJwtAuthGuard)
  joinQueue(
    @Param('serviceId') serviceId: string,
    @Body() body: JoinQueueDto,
    @AuthUser() user?: TReqUser,
  ) {
    return this.queueService.joinQueue(serviceId, {
      userId: user?.userId,
      ...body,
    });
  }

  @Delete('entry/:entryId/leave')
  @UseGuards(OptionalJwtAuthGuard)
  leaveQueue(
    @Param('entryId') entryId: string,
    @AuthUser() user?: TReqUser,
  ) {
    return this.queueService.leaveQueue(entryId, user?.userId);
  }

  @Post('service/:serviceId/call-next')
  @UseGuards(JwtAuthGuard)
  callNext(
    @Param('serviceId') serviceId: string,
    @Body() body: CallNextDto,
    @AuthUser() user: TReqUser,
  ) {
    return this.queueService.callNext(serviceId, body.guichetId, user.userId);
  }

  @Put('entry/:entryId/served')
  @UseGuards(JwtAuthGuard)
  markServed(
    @Param('entryId') entryId: string,
    @AuthUser() user: TReqUser,
  ) {
    return this.queueService.markServed(entryId, user.userId);
  }
}
