import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TReqUser } from '@shared/types';
import type { Request } from 'express';

export const AuthUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TReqUser | undefined => {
    const request = ctx.switchToHttp().getRequest<Request & { user?: TReqUser }>();
    return request.user;
  },
);
