import { Bot } from '../entities/bot.entity';

export class PaginationResponseDto {
  data: Bot[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
