import { Message } from '../entities/message.entity';

export class PaginationResponseDto {
  data: Message[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
