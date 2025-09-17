import { Server } from '../entities/server.entity';

export class PaginationResponseDto {
  data: Server[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
