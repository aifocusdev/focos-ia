# Cache Module

Este módulo contém os serviços de cache da aplicação.

## Serviços

### LastMessageCacheService
- Cache em memória para últimas mensagens de conversas
- TTL de 30 segundos
- Limpeza automática de entradas expiradas
- Usado para otimizar listagem de conversas

## Uso

```typescript
import { CacheModule } from '../cache';

@Module({
  imports: [CacheModule],
  // ...
})
export class YourModule {}
```

## Futuras Expansões

Esta pasta pode abrigar outros serviços de cache como:
- Redis cache para dados compartilhados
- Cache de unread counts agregados
- Cache de dados de usuários online
- Etc.