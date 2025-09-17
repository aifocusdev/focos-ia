import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

export interface CacheOptions {
  ttl?: number;
  key?: string;
}

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return await this.cacheManager.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  reset(): void {
    // Note: reset method may not be available in all cache-manager versions
    // Using store.clear() as alternative if available
    const store = (this.cacheManager as any).store as { clear?: () => void };
    if (typeof store?.clear === 'function') {
      void store.clear();
    }
  }

  // Helper method to generate cache keys
  generateKey(prefix: string, ...params: (string | number)[]): string {
    return `${prefix}:${params.join(':')}`;
  }

  // Cache with automatic serialization for objects
  async setObject<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttl);
  }

  async getObject<T>(key: string): Promise<T | undefined> {
    const cached = await this.get<string>(key);
    if (cached) {
      try {
        return JSON.parse(cached) as T;
      } catch {
        // If parsing fails, remove invalid cache entry
        await this.del(key);
        return undefined;
      }
    }
    return undefined;
  }

  // Cache with TTL based on data type
  async cacheWithTTL<T>(
    key: string,
    value: T,
    type:
      | 'user'
      | 'contact'
      | 'conversation'
      | 'message'
      | 'general' = 'general',
  ): Promise<void> {
    const ttlMap = {
      user: 900, // 15 minutes
      contact: 600, // 10 minutes
      conversation: 300, // 5 minutes
      message: 180, // 3 minutes
      general: 300, // 5 minutes
    };

    await this.set(key, value, ttlMap[type]);
  }
}
