import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsappIntegrationConfigService } from './services/whatsapp-integration-config.service';
import { WhatsappIntegrationConfigController } from './controllers/whatsapp-integration-config.controller';
import { WhatsappIntegrationConfig } from './entities/whatsapp-integration-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WhatsappIntegrationConfig])],
  controllers: [WhatsappIntegrationConfigController],
  providers: [WhatsappIntegrationConfigService],
  exports: [WhatsappIntegrationConfigService],
})
export class WhatsappIntegrationConfigModule {}
