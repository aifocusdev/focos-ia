import { ContactUserAccount } from '../entities/contact-user-account.entity';

export class PaginationResponseDto {
  data: ContactUserAccount[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
