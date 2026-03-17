import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { TReqUser } from '@shared/types';
import { BadRequestException } from '@nestjs/common';

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @AuthUser() _user: TReqUser,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    const url = await this.uploadsService.uploadImage(file.buffer, 'avatars', {
      maxWidth: 400,
      maxHeight: 400,
      quality: 80,
    });
    return { url };
  }

  @Post('business/:bucket')
  @UseInterceptors(FileInterceptor('file'))
  async uploadBusinessImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('bucket') bucket: string,
    @AuthUser() _user: TReqUser,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    const allowedBuckets = ['logos', 'covers'];
    if (!allowedBuckets.includes(bucket)) {
      throw new BadRequestException('Invalid bucket');
    }
    const url = await this.uploadsService.uploadImage(file.buffer, bucket, {
      maxWidth: bucket === 'logos' ? 400 : 1200,
      maxHeight: bucket === 'logos' ? 400 : 400,
      quality: 85,
    });
    return { url };
  }
}
