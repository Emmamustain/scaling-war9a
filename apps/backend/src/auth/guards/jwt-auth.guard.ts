import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { BetterAuthService } from '../better-auth.service';
import type { Request } from 'express';
import { TReqUser } from '@shared/types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly betterAuthService: BetterAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: TReqUser }>();
    const result = await this.betterAuthService.authenticateRequest(request, {
      required: true,
    });
    if (!result) throw new UnauthorizedException();
    request.user = result.requestUser;
    return true;
  }
}

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(private readonly betterAuthService: BetterAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: TReqUser }>();
    const result = await this.betterAuthService.authenticateRequest(request, {
      required: false,
    });
    if (result) request.user = result.requestUser;
    return true;
  }
}
