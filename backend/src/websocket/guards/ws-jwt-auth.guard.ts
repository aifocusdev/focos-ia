import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UsersService } from '../../modules/users/services/users.service';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { AuthenticatedSocket } from '../interfaces/authenticated-socket.interface';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const token = this.extractTokenFromHandshake(client);

    if (!token) {
      throw new WsException('Unauthorized: No token provided');
    }

    try {
      const payload: JwtPayload = this.jwtService.verify(token);
      const user = await this.usersService.findOne(payload.sub, true);

      if (!user) {
        throw new WsException('Unauthorized: User not found');
      }

      (client as AuthenticatedSocket).user = user;
      return true;
    } catch {
      throw new WsException('Unauthorized: Invalid token');
    }
  }

  private extractTokenFromHandshake(client: Socket): string | null {
    const token =
      client.handshake.auth?.token || client.handshake.headers?.authorization;

    if (!token) {
      return null;
    }

    if (typeof token === 'string' && token.startsWith('Bearer ')) {
      return token.substring(7);
    }

    return typeof token === 'string' ? token : null;
  }
}
