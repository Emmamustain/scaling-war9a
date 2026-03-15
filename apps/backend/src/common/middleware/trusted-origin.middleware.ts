import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class TrustedOriginMiddleware implements NestMiddleware {
  private readonly trustedOrigins: Set<string>;

  constructor(private readonly configService: ConfigService) {
    const origins = new Set<string>();
    const addOrigins = (raw: string | undefined) => {
      if (!raw) return;
      for (const origin of raw.split(',')) {
        const normalized = origin.trim();
        if (normalized.length > 0) origins.add(normalized);
      }
    };
    addOrigins(this.configService.get<string>('TRUSTED_ORIGINS'));
    addOrigins(this.configService.get<string>('CORS_ALLOWED_ORIGINS'));
    addOrigins(this.configService.get<string>('FRONTEND_URL'));
    this.trustedOrigins = origins;
  }

  use(req: Request, res: Response, next: NextFunction) {
    const origin = req.headers['origin'];
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    if (
      isProduction &&
      this.trustedOrigins.size > 0 &&
      origin &&
      !this.trustedOrigins.has(origin)
    ) {
      res.status(403).json({ message: 'Origin not trusted' });
      return;
    }

    next();
  }
}
