import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private readonly metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    if (req.path === '/metrics' || req.path === '/health') {
      return next();
    }

    const start = process.hrtime.bigint();

    res.on('finish', () => {
      const durationNs = Number(process.hrtime.bigint() - start);
      const durationSeconds = durationNs / 1e9;

      const route = req.route?.path ?? req.path;

      this.metricsService.httpRequestsTotal.inc({
        method: req.method,
        route,
        status_code: res.statusCode,
      });

      this.metricsService.httpRequestDuration.observe(
        { method: req.method, route, status_code: res.statusCode },
        durationSeconds,
      );
    });

    next();
  }
}
