import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { TReqUser } from '@shared/types';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

class UpdateProfileDto {
  @IsOptional() @IsString() @MaxLength(100)
  displayName?: string;

  @IsOptional() @IsString()
  city?: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsString()
  preferredLanguage?: string;
}

class UpdateUsernameDto {
  @IsString() @MinLength(3) @MaxLength(50)
  username!: string;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@AuthUser() user: TReqUser) {
    return this.usersService.findById(user.userId);
  }

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch('me/profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @AuthUser() user: TReqUser,
    @Body() body: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.userId, body);
  }

  @Patch('me/username')
  @UseGuards(JwtAuthGuard)
  updateUsername(
    @AuthUser() user: TReqUser,
    @Body() body: UpdateUsernameDto,
  ) {
    return this.usersService.updateUsername(user.userId, body.username);
  }
}
