import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateConversationDto } from './create-conversation.dto';

export class UpdateConversationDto extends PartialType(
  OmitType(CreateConversationDto, ['contact_id', 'integration_id'] as const),
) {}
