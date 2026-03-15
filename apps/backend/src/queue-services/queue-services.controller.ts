import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { QueueServicesService } from './queue-services.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

class CreateServiceDto {
  @IsString() name!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() averageTime?: string;
  @IsOptional() @IsNumber() @Min(1) @Max(10000) maxCapacity?: number;
}

class UpdateServiceDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() averageTime?: string;
  @IsOptional() @IsNumber() maxCapacity?: number;
}

@Controller('businesses/:businessId/services')
export class QueueServicesController {
  constructor(private readonly queueServicesService: QueueServicesService) {}

  @Get()
  findAll(@Param('businessId') businessId: string) {
    return this.queueServicesService.findByBusiness(businessId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Param('businessId') businessId: string, @Body() body: CreateServiceDto) {
    return this.queueServicesService.create(businessId, body);
  }

  @Put(':serviceId')
  @UseGuards(JwtAuthGuard)
  update(@Param('serviceId') serviceId: string, @Body() body: UpdateServiceDto) {
    return this.queueServicesService.update(serviceId, body);
  }

  @Delete(':serviceId')
  @UseGuards(JwtAuthGuard)
  delete(@Param('serviceId') serviceId: string) {
    return this.queueServicesService.delete(serviceId);
  }
}
