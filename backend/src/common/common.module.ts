import { Module } from '@nestjs/common';
import { PasswordService } from './services/password.service';
import { MediaMetadataService } from './services/media-metadata.service';
import { CacheModule } from './cache/cache.module';
import { StorageModule } from './storage/storage.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [CacheModule, StorageModule, UploadModule],
  providers: [PasswordService, MediaMetadataService],
  exports: [
    PasswordService,
    MediaMetadataService,
    CacheModule,
    StorageModule,
    UploadModule,
  ],
})
export class CommonModule {}
