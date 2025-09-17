import { QuickReply } from '../entities/quick-reply.entity';

export class QuickReplyPaginationResponseDto {
  data: QuickReply[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
