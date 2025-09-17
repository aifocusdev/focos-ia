import { Conversation } from '../entities/conversation.entity';

export class PaginationResponseDto {
  data: Conversation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
