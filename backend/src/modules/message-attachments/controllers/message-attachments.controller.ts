import {
  Controller,
  Post,
  Param,
  ParseIntPipe,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MessageAttachmentsService } from '../services/message-attachments.service';
import { MessageAttachment } from '../entities/message-attachment.entity';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';

@Controller('message-attachments')
@UseGuards(JwtAuthGuard)
export class MessageAttachmentsController {
  constructor(
    private readonly messageAttachmentsService: MessageAttachmentsService,
  ) {}

  @Post('upload-multiple/:messageId')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultipleAttachments(
    @Param('messageId', ParseIntPipe) messageId: number,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<MessageAttachment[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required');
    }

    return this.messageAttachmentsService.createMultipleFromUploadedFiles(
      messageId,
      files,
    );
  }
}
