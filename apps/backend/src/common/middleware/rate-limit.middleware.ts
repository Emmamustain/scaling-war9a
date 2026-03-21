import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV !== 'production';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 10_000 : 500,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      return req.path === '/health' || req.path === '/metrics';
    },
  });

  use(req: Request, res: Response, next: NextFunction) {
    this.limiter(req, res, next);
  }
}

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 10_000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts. Try again later.' },
});

export const queueJoinRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: isDev ? 10_000 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many queue join attempts. Try again later.' },
});
