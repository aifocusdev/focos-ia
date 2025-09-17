import { Device } from '../entities/device.entity';

export class PaginationResponseDto {
  data: Device[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
