import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BusinessesService } from './businesses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { TReqUser } from '@shared/types';
import {
  IsOptional,
  IsString,
  MaxLength,
  IsArray,
  IsUUID,
} from 'class-validator';

class CreateBusinessDto {
  @IsString() @MaxLength(200) name!: string;
  @IsString() description!: string;
  @IsString() location!: string;
  @IsString() city!: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() latitude?: string;
  @IsOptional() @IsString() longitude?: string;
  @IsOptional() @IsString() zipCode?: string;
  @IsOptional() @IsArray() @IsUUID('4', { each: true }) categoryIds?: string[];
}

class UpdateBusinessDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() phone?: string;
}

@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Get()
  findAll(
    @Query('city') city?: string,
    @Query('search') search?: string,
    @Query('featured') featured?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.businessesService.findAll({
      city,
      search,
      featured: featured === 'true',
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  getMyBusinesses(@AuthUser() user: TReqUser) {
    return this.businessesService.findByOwner(user.userId);
  }

  @Get('worker')
  @UseGuards(JwtAuthGuard)
  getWorkerBusinesses(@AuthUser() user: TReqUser) {
    return this.businessesService.findWorkerBusinesses(user.userId);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.businessesService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@AuthUser() user: TReqUser, @Body() body: CreateBusinessDto) {
    return this.businessesService.create(user.userId, body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @AuthUser() user: TReqUser,
    @Param('id') id: string,
    @Body() body: UpdateBusinessDto,
  ) {
    return this.businessesService.update(id, user.userId, body);
  }
}
