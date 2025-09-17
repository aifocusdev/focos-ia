import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageAttachmentsService } from './services/message-attachments.service';
import { MessageAttachmentsController } from './controllers/message-attachments.controller';
import { MessageAttachment } from './entities/message-attachment.entity';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([MessageAttachment]), CommonModule],
  controllers: [MessageAttachmentsController],
  providers: [MessageAttachmentsService],
  exports: [MessageAttachmentsService],
})
export class MessageAttachmentsModule {}
