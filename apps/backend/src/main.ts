import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { RedisIoAdapter } from './adapters/redis-io.adapter';
import { ConfigService } from '@nestjs/config';
import { RateLimitMiddleware } from './common/middleware/rate-limit.middleware';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import { TrustedOriginMiddleware } from './common/middleware/trusted-origin.middleware';
import type { NextFunction, Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
          connectSrc: ["'self'", 'wss:', 'ws:', 'https:'],
          fontSrc: ["'self'", 'data:'],
          mediaSrc: ["'self'", 'blob:'],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.use(cookieParser());
  app.enableShutdownHooks();

  const configService = app.get(ConfigService);
  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  const trustProxyConfig = configService
    .get<string>('TRUST_PROXY')
    ?.trim()
    .toLowerCase();
  const trustProxy =
    trustProxyConfig === 'true'
      ? 1
      : trustProxyConfig === 'false'
        ? false
        : isProduction
          ? 1
          : false;

  app.set('trust proxy', trustProxy);

  const allowedOrigins =
    configService
      .get<string>('CORS_ALLOWED_ORIGINS')
      ?.split(',')
      .map((o) => o.trim())
      .filter(Boolean) ?? [];

  app.enableCors({
    origin:
      allowedOrigins.length > 0
        ? allowedOrigins
        : isProduction
          ? false
          : ['http://localhost:3000', 'https://war9a.localhost'],
    credentials: true,
  });

  const trustedOriginMiddleware = new TrustedOriginMiddleware(configService);
  app.use((req: Request, res: Response, next: NextFunction) =>
    trustedOriginMiddleware.use(req, res, next),
  );

  const rateLimitMiddleware = new RateLimitMiddleware();
  app.use((req: Request, res: Response, next: NextFunction) =>
    rateLimitMiddleware.use(req, res, next),
  );

  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader(
      'Permissions-Policy',
      'geolocation=(self), microphone=(), camera=(self)',
    );
    next();
  });

  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis(
    process.env.REDIS_URL ?? 'redis://localhost:6379',
  );
  app.useWebSocketAdapter(redisIoAdapter);

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`War9a API running on port ${port}`);
}

void bootstrap();
