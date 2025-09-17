import { Tag } from '../entities/tag.entity';

export class PaginationResponseDto {
  data: Tag[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
