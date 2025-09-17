import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedSocket } from '../interfaces/authenticated-socket.interface';

export const CurrentUserWs = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const client = ctx.switchToWs().getClient<AuthenticatedSocket>();
    return client.user;
  },
);
