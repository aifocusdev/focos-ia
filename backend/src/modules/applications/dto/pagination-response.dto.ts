import { Application } from '../entities/application.entity';

export class PaginationResponseDto {
  data: Application[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
