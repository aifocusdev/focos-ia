import { Module } from '@nestjs/common';
import { LastMessageCacheService } from './services/last-message-cache.service';

@Module({
  providers: [LastMessageCacheService],
  exports: [LastMessageCacheService],
})
export class CacheModule {}
