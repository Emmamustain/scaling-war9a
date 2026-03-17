import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { GuichetsService } from './guichets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { TReqUser } from '@shared/types';
import { IsOptional, IsString, IsUUID, IsIn } from 'class-validator';

class CreateGuichetDto {
  @IsString() name!: string;
  @IsOptional() @IsUUID() serviceId?: string;
}

class UpdateStatusDto {
  @IsIn(['open', 'closed', 'paused']) status!: 'open' | 'closed' | 'paused';
}

class AssignWorkerDto {
  @IsOptional() @IsUUID() workerId?: string | null;
}

class AssignServiceDto {
  @IsOptional() @IsUUID() serviceId?: string | null;
}

@Controller('businesses/:businessId/guichets')
export class GuichetsController {
  constructor(private readonly guichetsService: GuichetsService) {}

  @Get()
  findAll(@Param('businessId') businessId: string) {
    return this.guichetsService.findByBusiness(businessId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Param('businessId') businessId: string, @Body() body: CreateGuichetDto) {
    return this.guichetsService.create(businessId, body);
  }

  @Put(':guichetId/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(
    @Param('guichetId') guichetId: string,
    @Body() body: UpdateStatusDto,
    @AuthUser() user: TReqUser,
  ) {
    return this.guichetsService.updateStatus(guichetId, body.status, user.userId);
  }

  @Put(':guichetId/assign-worker')
  @UseGuards(JwtAuthGuard)
  assignWorker(
    @Param('guichetId') guichetId: string,
    @Body() body: AssignWorkerDto,
  ) {
    return this.guichetsService.assignWorker(guichetId, body.workerId ?? null);
  }

  @Put(':guichetId/assign-service')
  @UseGuards(JwtAuthGuard)
  assignService(
    @Param('guichetId') guichetId: string,
    @Body() body: AssignServiceDto,
  ) {
    return this.guichetsService.assignService(guichetId, body.serviceId ?? null);
  }

  @Delete(':guichetId')
  @UseGuards(JwtAuthGuard)
  remove(@Param('guichetId') guichetId: string) {
    return this.guichetsService.remove(guichetId);
  }
}
