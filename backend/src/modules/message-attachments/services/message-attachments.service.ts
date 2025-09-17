import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageAttachment } from '../entities/message-attachment.entity';
import { CreateMessageAttachmentDto } from '../dto/create-message-attachment.dto';
import { UpdateMessageAttachmentDto } from '../dto/update-message-attachment.dto';
import { FindAllMessageAttachmentsDto } from '../dto/find-all-message-attachments.dto';
import { PaginationResponseDto } from '../dto/pagination-response.dto';
import { MESSAGE_ATTACHMENT_ERRORS } from '../constants/message-attachment.constants';
import { UploadService } from '../../../common/upload/upload.service';
import { FileUploadResult } from '../../../common/storage/local-storage.service';
import { MediaMetadataService } from '../../../common/services/media-metadata.service';

@Injectable()
export class MessageAttachmentsService {
  constructor(
    @InjectRepository(MessageAttachment)
    private readonly messageAttachmentRepository: Repository<MessageAttachment>,
    private readonly uploadService: UploadService,
    private readonly mediaMetadataService: MediaMetadataService,
  ) {}

  async create(
    createMessageAttachmentDto: CreateMessageAttachmentDto,
  ): Promise<MessageAttachment> {
    try {
      const attachment = this.messageAttachmentRepository.create(
        createMessageAttachmentDto,
      );
      return await this.messageAttachmentRepository.save(attachment);
    } catch {
      throw new BadRequestException(MESSAGE_ATTACHMENT_ERRORS.INVALID_URL);
    }
  }

  async findAll(
    queryDto: FindAllMessageAttachmentsDto,
  ): Promise<PaginationResponseDto> {
    const { message_id, kind, page = 1, limit = 10 } = queryDto;

    const queryBuilder = this.messageAttachmentRepository
      .createQueryBuilder('attachment')
      .leftJoinAndSelect('attachment.message', 'message');

    if (message_id) {
      queryBuilder.andWhere('attachment.message_id = :message_id', {
        message_id,
      });
    }

    if (kind) {
      queryBuilder.andWhere('attachment.kind = :kind', { kind });
    }

    queryBuilder
      .orderBy('attachment.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<MessageAttachment> {
    const attachment = await this.messageAttachmentRepository.findOne({
      where: { id },
      relations: ['message'],
    });

    if (!attachment) {
      throw new NotFoundException(MESSAGE_ATTACHMENT_ERRORS.NOT_FOUND);
    }

    return attachment;
  }

  async findByMessage(messageId: number): Promise<MessageAttachment[]> {
    return await this.messageAttachmentRepository.find({
      where: { message_id: messageId },
      relations: ['message'],
    });
  }

  async update(
    id: number,
    updateMessageAttachmentDto: UpdateMessageAttachmentDto,
  ): Promise<MessageAttachment> {
    await this.findOne(id);

    try {
      await this.messageAttachmentRepository.update(
        id,
        updateMessageAttachmentDto,
      );
      return await this.findOne(id);
    } catch {
      throw new BadRequestException(MESSAGE_ATTACHMENT_ERRORS.INVALID_URL);
    }
  }

  async remove(id: number): Promise<void> {
    const attachment = await this.findOne(id);
    await this.messageAttachmentRepository.remove(attachment);
  }

  async removeByMessage(messageId: number): Promise<void> {
    await this.messageAttachmentRepository.delete({ message_id: messageId });
  }

  async createFromUploadedFile(
    messageId: number,
    file: Express.Multer.File,
    folder?: string,
  ): Promise<MessageAttachment> {
    // Extract metadata from file
    const metadata = this.mediaMetadataService.extractMetadata(file);

    // Upload file to Supabase
    let uploadResult: FileUploadResult;

    if (metadata.isImage) {
      uploadResult = await this.uploadService.uploadImage(file, {
        folder: folder || 'message-images',
      });
    } else if (metadata.isVideo) {
      uploadResult = await this.uploadService.uploadVideo(file, {
        folder: folder || 'message-videos',
      });
    } else if (metadata.isAudio) {
      uploadResult = await this.uploadService.uploadAudio(file, {
        folder: folder || 'message-audio',
      });
    } else {
      uploadResult = await this.uploadService.uploadDocument(file, {
        folder: folder || 'message-documents',
      });
    }

    // Determine attachment kind based on metadata
    let kind: string;
    if (metadata.isImage) {
      kind = 'image';
    } else if (metadata.isVideo) {
      kind = 'video';
    } else if (metadata.isAudio) {
      kind = 'audio';
    } else {
      kind = 'document';
    }

    // Generate preview/thumbnail URLs
    const previewUrl = this.mediaMetadataService.generatePreviewUrl(
      uploadResult.url,
      kind,
    );

    // Create attachment record with metadata
    const createDto: CreateMessageAttachmentDto = {
      message_id: messageId,
      kind: kind as any,
      url: uploadResult.url,
      name: uploadResult.name,
      size: uploadResult.size,
      mime_type: uploadResult.mimeType,
      width: metadata.width,
      height: metadata.height,
      duration_ms: metadata.duration_ms,
    };

    const attachment = this.messageAttachmentRepository.create({
      ...createDto,
      preview_url: previewUrl,
      thumbnail_url: previewUrl, // For now, same as preview
    });

    return await this.messageAttachmentRepository.save(attachment);
  }

  async createMultipleFromUploadedFiles(
    messageId: number,
    files: Express.Multer.File[],
    folder?: string,
  ): Promise<MessageAttachment[]> {
    const attachmentPromises = files.map((file) =>
      this.createFromUploadedFile(messageId, file, folder),
    );

    return Promise.all(attachmentPromises);
  }
}
