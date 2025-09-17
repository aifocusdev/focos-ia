import { User } from '../entities/user.entity';

export class PaginationResponseDto {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
