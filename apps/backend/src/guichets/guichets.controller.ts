import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
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
}
