import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { AuthenticatedSocket } from '../interfaces/authenticated-socket.interface';

@Injectable()
export class WsThrottleGuard implements CanActivate {
  private readonly requests = new Map<string, number[]>();
  private readonly windowMs = 60000; // 1 minute
  private readonly maxRequests = 30; // Max 30 requests per minute

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<AuthenticatedSocket>();
    const userId = client.user?.id;

    if (!userId) {
      throw new WsException('Unauthorized');
    }

    const now = Date.now();
    const userKey = `user_${userId}`;
    const userRequests = this.requests.get(userKey) || [];

    // Remove old requests outside the window
    const validRequests = userRequests.filter(
      (timestamp) => now - timestamp < this.windowMs,
    );

    if (validRequests.length >= this.maxRequests) {
      throw new WsException('Too many requests. Please slow down.');
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(userKey, validRequests);

    return true;
  }

  // Cleanup method to run periodically
  cleanup() {
    const now = Date.now();

    this.requests.forEach((timestamps, key) => {
      const validRequests = timestamps.filter(
        (timestamp) => now - timestamp < this.windowMs,
      );

      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    });
  }
}
