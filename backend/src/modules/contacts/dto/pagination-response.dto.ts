import { Contact } from '../entities/contact.entity';

export class PaginationResponseDto {
  data: Contact[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
