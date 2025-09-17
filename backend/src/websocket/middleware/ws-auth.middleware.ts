import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UsersService } from '../../modules/users/services/users.service';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { AuthenticatedSocket } from '../interfaces/authenticated-socket.interface';

@Injectable()
export class WsAuthMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async authenticate(socket: Socket, next: (err?: any) => void) {
    try {
      const token = this.extractToken(socket);

      if (!token) {
        return next(new WsException('Unauthorized: No token provided'));
      }

      const payload: JwtPayload = this.jwtService.verify(token);
      const user = await this.usersService.findOne(payload.sub, true);

      if (!user) {
        return next(new WsException('Unauthorized: User not found'));
      }

      (socket as AuthenticatedSocket).user = user;
      next();
    } catch {
      next(new WsException('Unauthorized: Invalid token'));
    }
  }

  private extractToken(socket: Socket): string | null {
    const authHeader = socket.handshake.headers.authorization;
    const authToken = socket.handshake.auth?.token;

    const token = authToken || authHeader;

    if (!token) {
      return null;
    }

    if (typeof token === 'string' && token.startsWith('Bearer ')) {
      return token.substring(7);
    }

    return typeof token === 'string' ? token : null;
  }
}
