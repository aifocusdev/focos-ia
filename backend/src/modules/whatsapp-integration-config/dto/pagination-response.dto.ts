import { WhatsappIntegrationConfig } from '../entities/whatsapp-integration-config.entity';

export class WhatsappIntegrationConfigPaginationResponseDto {
  data: WhatsappIntegrationConfig[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
