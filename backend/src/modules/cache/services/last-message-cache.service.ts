import { Injectable, Logger } from '@nestjs/common';
import { Message } from '../../messages/entities/message.entity';

interface CacheEntry {
  message: Message;
  timestamp: number;
}

@Injectable()
export class LastMessageCacheService {
  private readonly logger = new Logger(LastMessageCacheService.name);
  private readonly cache = new Map<number, CacheEntry>();
  private readonly TTL = 30000; // 30 seconds

  get(conversationId: number): Message | null {
    const entry = this.cache.get(conversationId);

    if (!entry) {
      return null;
    }

    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(conversationId);
      return null;
    }

    return entry.message;
  }

  set(conversationId: number, message: Message): void {
    this.cache.set(conversationId, {
      message,
      timestamp: Date.now(),
    });
  }

  invalidate(conversationId: number): void {
    this.cache.delete(conversationId);
  }
  private cleanExpired(): void {
    const now = Date.now();

    for (const [conversationId, entry] of this.cache) {
      if (now - entry.timestamp > this.TTL) {
        this.cache.delete(conversationId);
      }
    }
  }

  // Start periodic cleanup (call once on module init)
  startPeriodicCleanup(): void {
    setInterval(() => {
      this.cleanExpired();
    }, this.TTL / 2); // Clean every 15 seconds
  }
}
