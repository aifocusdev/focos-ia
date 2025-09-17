import { MessageAttachment } from '../entities/message-attachment.entity';

export class PaginationResponseDto {
  data: MessageAttachment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
