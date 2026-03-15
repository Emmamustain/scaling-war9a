import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client as MinioClient } from 'minio';
import sharp from 'sharp';
import { fileTypeFromBuffer } from 'file-type';
import { randomUUID } from 'crypto';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly minio: MinioClient;
  private readonly publicEndpoint: string;
  private readonly useSSL: boolean;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT') ?? 'localhost';
    const port = Number(this.configService.get<string>('MINIO_PORT') ?? 9000);
    const useSSL = this.configService.get<string>('MINIO_USE_SSL') === 'true';

    this.minio = new MinioClient({
      endPoint: endpoint,
      port,
      useSSL,
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY') ?? 'minioadmin',
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY') ?? 'minioadmin',
    });

    const publicEndpoint = this.configService.get<string>('MINIO_PUBLIC_ENDPOINT') ?? endpoint;
    const publicSSL = this.configService.get<string>('MINIO_PUBLIC_SSL') === 'true';
    this.publicEndpoint = publicEndpoint;
    this.useSSL = publicSSL;
  }

  async uploadImage(
    buffer: Buffer,
    bucket: string,
    options?: { maxWidth?: number; maxHeight?: number; quality?: number },
  ): Promise<string> {
    if (buffer.length > MAX_IMAGE_SIZE) {
      throw new BadRequestException('Image size exceeds 5MB limit');
    }

    const fileType = await fileTypeFromBuffer(buffer);
    if (!fileType || !ALLOWED_IMAGE_TYPES.includes(fileType.mime)) {
      throw new BadRequestException('Invalid image type. Allowed: JPEG, PNG, WebP, GIF');
    }

    const processedBuffer = await sharp(buffer)
      .resize(options?.maxWidth ?? 1200, options?.maxHeight ?? 1200, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: options?.quality ?? 85 })
      .toBuffer();

    const filename = `${randomUUID()}.jpg`;
    const size = processedBuffer.length;

    await this.minio.putObject(bucket, filename, processedBuffer, size, {
      'Content-Type': 'image/jpeg',
    });

    const protocol = this.useSSL ? 'https' : 'https';
    return `${protocol}://${this.publicEndpoint}/${bucket}/${filename}`;
  }

  async deleteObject(bucket: string, objectName: string): Promise<void> {
    try {
      await this.minio.removeObject(bucket, objectName);
    } catch (error) {
      this.logger.warn(`Failed to delete object ${bucket}/${objectName}`, error);
    }
  }
}
