import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../../../common/cache/cache.service';
import { WhatsappIntegrationConfig } from '../../whatsapp-integration-config/entities/whatsapp-integration-config.entity';
import { WhatsappIntegrationConfigService } from '../../whatsapp-integration-config/services/whatsapp-integration-config.service';

@Injectable()
export class WhatsappIntegrationCacheService {
  private readonly logger = new Logger(WhatsappIntegrationCacheService.name);
  private readonly CACHE_TTL = 600; // 10 minutes

  constructor(
    private readonly cacheService: CacheService,
    private readonly whatsappIntegrationConfigService: WhatsappIntegrationConfigService,
  ) {}

  async getIntegrationByPhoneNumberId(
    phoneNumberId: string,
  ): Promise<WhatsappIntegrationConfig | null> {
    const cacheKey = this.generateCacheKey('phone', phoneNumberId);

    // Try to get from cache first
    const cachedIntegration =
      await this.cacheService.getObject<WhatsappIntegrationConfig>(cacheKey);

    if (cachedIntegration) {
      return cachedIntegration;
    }

    // If not in cache, query database
    const integration =
      await this.whatsappIntegrationConfigService.findByPhoneNumberId(
        phoneNumberId,
      );

    if (integration) {
      await this.cacheIntegration(integration);
    }

    return integration;
  }

  async cacheIntegration(
    integration: WhatsappIntegrationConfig,
  ): Promise<void> {
    const phoneKey = this.generateCacheKey(
      'phone',
      integration.phone_number_id,
    );
    const idKey = this.generateCacheKey('id', integration.id.toString());

    await Promise.all([
      this.cacheService.setObject(phoneKey, integration, this.CACHE_TTL),
      this.cacheService.setObject(idKey, integration, this.CACHE_TTL),
    ]);
  }

  async invalidateIntegration(phoneNumberId: string): Promise<void> {
    const phoneKey = this.generateCacheKey('phone', phoneNumberId);
    await this.cacheService.del(phoneKey);
  }

  async invalidateIntegrationById(id: number): Promise<void> {
    const idKey = this.generateCacheKey('id', id.toString());
    await this.cacheService.del(idKey);
  }

  private generateCacheKey(type: 'phone' | 'id', value: string): string {
    return this.cacheService.generateKey(
      'whatsapp',
      'integration',
      type,
      value,
    );
  }
}
