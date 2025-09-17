import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateMessageAttachmentDto } from './create-message-attachment.dto';

export class UpdateMessageAttachmentDto extends PartialType(
  OmitType(CreateMessageAttachmentDto, ['message_id'] as const),
) {}
