import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { TReqUser } from '@shared/types';
import { IsDateString, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

class BookAppointmentDto {
  @IsUUID() serviceId!: string;
  @IsDateString() scheduledAt!: string;
  @IsOptional() @IsNumber() @Type(() => Number) durationMinutes?: number;
  @IsOptional() @IsString() notes?: string;
}

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get('mine')
  getMyAppointments(@AuthUser() user: TReqUser) {
    return this.appointmentsService.getMyAppointments(user.userId);
  }

  @Post()
  book(@AuthUser() user: TReqUser, @Body() body: BookAppointmentDto) {
    return this.appointmentsService.book(user.userId, {
      ...body,
      scheduledAt: new Date(body.scheduledAt),
    });
  }

  @Delete(':id')
  cancel(@AuthUser() user: TReqUser, @Param('id') id: string) {
    return this.appointmentsService.cancel(id, user.userId);
  }

  @Get('availability/:serviceId')
  getAvailability(
    @Param('serviceId') serviceId: string,
    @Query('date') date: string,
  ) {
    return this.appointmentsService.getServiceAvailability(
      serviceId,
      new Date(date),
    );
  }
}
