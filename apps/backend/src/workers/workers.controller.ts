import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { WorkersService } from './workers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsIn, IsOptional, IsUUID } from 'class-validator';

class AddWorkerDto {
  @IsUUID() userId!: string;
  @IsOptional() @IsIn(['worker', 'manager']) role?: string;
}

class UpdateRoleDto {
  @IsIn(['worker', 'manager']) role!: string;
}

@Controller('businesses/:businessId/workers')
export class WorkersController {
  constructor(private readonly workersService: WorkersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getWorkers(@Param('businessId') businessId: string) {
    return this.workersService.getBusinessWorkers(businessId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  addWorker(@Param('businessId') businessId: string, @Body() body: AddWorkerDto) {
    return this.workersService.addWorker(businessId, body);
  }

  @Delete(':workerId')
  @UseGuards(JwtAuthGuard)
  removeWorker(@Param('workerId') workerId: string) {
    return this.workersService.removeWorker(workerId);
  }

  @Put(':workerId/role')
  @UseGuards(JwtAuthGuard)
  updateRole(@Param('workerId') workerId: string, @Body() body: UpdateRoleDto) {
    return this.workersService.updateWorkerRole(workerId, body.role);
  }
}
