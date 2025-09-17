import { PartialType } from '@nestjs/mapped-types';
import { CreateWhatsappIntegrationConfigDto } from './create-whatsapp-integration-config.dto';

export class UpdateWhatsappIntegrationConfigDto extends PartialType(
  CreateWhatsappIntegrationConfigDto,
) {}
