import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuickRepliesService } from './services/quick-replies.service';
import { QuickRepliesController } from './controllers/quick-replies.controller';
import { QuickReply } from './entities/quick-reply.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QuickReply])],
  controllers: [QuickRepliesController],
  providers: [QuickRepliesService],
  exports: [QuickRepliesService],
})
export class QuickRepliesModule {}
