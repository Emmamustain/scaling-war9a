import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { TReqUser } from '@shared/types';
import { IsString } from 'class-validator';

class PushSubscriptionDto {
  @IsString() endpoint!: string;
  @IsString() p256dhKey!: string;
  @IsString() authKey!: string;
}

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getNotifications(
    @AuthUser() user: TReqUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notificationsService.getForUser(
      user.userId,
      Number(page ?? 1),
      Number(limit ?? 20),
    );
  }

  @Put(':id/read')
  markRead(@AuthUser() user: TReqUser, @Param('id') id: string) {
    return this.notificationsService.markRead(id, user.userId);
  }

  @Put('read-all')
  markAllRead(@AuthUser() user: TReqUser) {
    return this.notificationsService.markAllRead(user.userId);
  }

  @Post('push/subscribe')
  savePushSubscription(
    @AuthUser() user: TReqUser,
    @Body() body: PushSubscriptionDto,
  ) {
    return this.notificationsService.savePushSubscription(user.userId, body);
  }
}
