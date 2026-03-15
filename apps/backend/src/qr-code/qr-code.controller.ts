import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { QrCodeService } from './qr-code.service';

@Controller('qr')
export class QrCodeController {
  constructor(private readonly qrCodeService: QrCodeService) {}

  @Get('service/:serviceId')
  async getServiceQr(@Param('serviceId') serviceId: string, @Res() res: Response) {
    const buffer = await this.qrCodeService.generateServiceQrCode(serviceId);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `inline; filename="queue-${serviceId}.png"`);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(buffer);
  }

  @Get('business/:slug')
  async getBusinessQr(@Param('slug') slug: string, @Res() res: Response) {
    const buffer = await this.qrCodeService.generateBusinessQrCode(slug);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `inline; filename="business-${slug}.png"`);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(buffer);
  }
}
