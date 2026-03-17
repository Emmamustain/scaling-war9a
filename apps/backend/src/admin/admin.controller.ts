import { Body, Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

class BanUserDto {
  @IsString() banReason!: string;
}

class UpdateRoleDto {
  @IsString() role!: string;
}

class FeatureBusinessDto {
  @IsBoolean() featured!: boolean;
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super', 'founder')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  getUsers(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getUsers({
      search,
      role,
      page: Number(page ?? 1),
      limit: Number(limit ?? 20),
    });
  }

  @Put('users/:id/ban')
  banUser(@Param('id') id: string, @Body() body: BanUserDto) {
    return this.adminService.banUser(id, body.banReason);
  }

  @Put('users/:id/unban')
  unbanUser(@Param('id') id: string) {
    return this.adminService.unbanUser(id);
  }

  @Put('users/:id/role')
  updateUserRole(@Param('id') id: string, @Body() body: UpdateRoleDto) {
    return this.adminService.updateUserRole(id, body.role);
  }

  @Get('businesses')
  getBusinesses(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getBusinesses({
      search,
      status,
      page: Number(page ?? 1),
      limit: Number(limit ?? 20),
    });
  }

  @Put('businesses/:id/approve')
  approveBusiness(@Param('id') id: string) {
    return this.adminService.approveBusiness(id);
  }

  @Put('businesses/:id/suspend')
  suspendBusiness(@Param('id') id: string) {
    return this.adminService.suspendBusiness(id);
  }

  @Put('businesses/:id/feature')
  featureBusiness(@Param('id') id: string, @Body() body: FeatureBusinessDto) {
    return this.adminService.featureBusiness(id, body.featured);
  }
}
