# ApiceChat API - Contexto Técnico e de Negócio

## Visão Geral do Projeto

A **ApiceChat API** é uma solução completa de CRM integrado ao WhatsApp Business, construída com NestJS e TypeScript. O sistema permite gerenciar conversas, contatos, mensagens e automatizações através de bots, oferecendo uma interface robusta para atendimento via WhatsApp.

## Arquitetura Técnica

### Stack Principal
- **Framework**: NestJS com TypeScript
- **Banco de Dados**: PostgreSQL com TypeORM
- **Autenticação**: JWT com Passport.js (estratégias Local e JWT)
- **Cache**: Redis com IORedis
- **WebSocket**: Socket.IO para comunicação em tempo real
- **Integração**: WhatsApp Business API (Meta)
- **Upload**: Supabase para armazenamento de arquivos
- **Rate Limiting**: ThrottlerModule (100 req/min)

### Configuração
- **Porta**: 3000 (configurável via PORT)
- **CORS**: Habilitado globalmente
- **Validação**: Global ValidationPipe com whitelist e transformação
- **Guards**: JWT Auth Guard e Throttle Guard globais

## Modelo de Dados

### Entidades Principais

#### **User** (`users`)
```typescript
- id: number (PK)
- name: string(100)
- username: string(150) UNIQUE
- password: string(255) [ENCRYPTED]
- role_id: number (FK -> Role)
- online: boolean (default: false)
- created_at, updated_at: timestamp
```

#### **Contact** (`contact`)
```typescript
- id: number (PK)
- external_id: string(50) UNIQUE
- name: string(150) nullable
- phone_number: string(20) UNIQUE nullable
- tags: Tag[] (many-to-many)
- created_at, updated_at: timestamp
```

#### **Conversation** (`conversation`)
```typescript
- id: number (PK)
- contact_id: number (FK -> Contact)
- integration_id: number (FK -> WhatsappIntegrationConfig)
- assigned_user: number nullable (FK -> User)
- assigned_bot: number nullable (FK -> Bot)
- status: ConversationStatus (QUEUE|ACTIVE|CLOSED|TRANSFERRED)
- created_at, updated_at: timestamp

// Constraint: Apenas um de assigned_user OU assigned_bot pode estar preenchido
```

#### **Message** (`message`)
```typescript
- id: number (PK)
- conversation_id: number (FK -> Conversation)
- sender_type: MessageSender (CONTACT|USER|BOT|SYSTEM)
- sender_user: number nullable (FK -> User)
- sender_bot: number nullable (FK -> Bot)
- body: text nullable
- whatsapp_message_id: string(255) nullable
- whatsapp_status: string(50) default 'pending'
- sent_at, delivered_at, read_at, failed_at: timestamp nullable
- attachments: MessageAttachment[]
- created_at: timestamp

// Constraints: sender_user obrigatório se sender_type='user'
//             sender_bot obrigatório se sender_type='bot'
```

#### **WhatsappIntegrationConfig** (`whatsapp_integration_config`)
```typescript
- id: number (PK)
- access_token: text [ENCRYPTED]
- phone_number_id: string(50)
- business_account_id: string(50) nullable
- api_version: string(10) default 'v16.0'
- created_at, updated_at: timestamp
```

#### **Bot** (`bot`)
```typescript
- id: number (PK)
- name: string(100)
- description: text nullable
- created_at: timestamp
```

### Enums Importantes

```typescript
ConversationStatus {
  QUEUE = 'queue',      // Aguardando atendimento
  ACTIVE = 'active',    // Conversa ativa
  CLOSED = 'closed',    // Finalizada
  TRANSFERRED = 'transferred' // Transferida
}

MessageSender {
  CONTACT = 'contact',  // Mensagem do cliente
  USER = 'user',        // Mensagem do atendente
  BOT = 'bot',         // Mensagem automática do bot
  SYSTEM = 'system'     // Mensagem do sistema
}
```

## Regras de Negócio

### Fluxo de Conversas
1. **Criação**: Conversas são criadas automaticamente quando um contato envia primeira mensagem
2. **Fila**: Novas conversas entram em status QUEUE
3. **Atribuição**: Conversas podem ser atribuídas a um usuário OU bot (exclusivo)
4. **Status**: Transições: QUEUE → ACTIVE → CLOSED/TRANSFERRED
5. **Transferência**: Conversas podem ser transferidas entre usuários/bots

### Sistema de Mensagens
- **Tracking completo**: sent_at, delivered_at, read_at, failed_at
- **Status WhatsApp**: Sincronização com status da API do WhatsApp
- **Anexos**: Suporte a attachments via MessageAttachment
- **Remetente**: Sistema flex entre contact/user/bot/system

### Integração WhatsApp
- **Webhook**: Recebe eventos do WhatsApp (mensagens, status)
- **API**: Envia mensagens via WhatsApp Business API
- **Verificação**: Token de verificação para webhook
- **Multi-instância**: Suporte a múltiplas configurações de WhatsApp

### Sistema de Tags
- **Categorização**: Contatos podem ter múltiplas tags
- **Organização**: Facilita segmentação e organização de contatos

## Módulos Principais

### **MetaWhatsappModule**
- **Controllers**: `MetaWhatsappWebhookController`
- **Services**: 
  - `MetaWhatsappApiService`: Comunicação com API do WhatsApp
  - `WhatsappWebhookService`: Processamento de webhooks
  - `WhatsappMessageService`: Gerenciamento de mensagens
- **Endpoints**:
  - `GET /meta-whatsapp/webhook`: Verificação do webhook
  - `POST /meta-whatsapp/webhook`: Recebimento de eventos
  - `POST /meta-whatsapp/webhook/send-message`: Envio de mensagens

### **AuthModule**
- **Estratégias**: Local (login) e JWT (autenticação)
- **Tokens**: JWT com expiração configurável (padrão 15min)
- **Segurança**: Senhas encriptadas com bcrypt

### **WebsocketModule**
- **Gateway**: `CrmWebsocketGateway`
- **Funcionalidades**: Notificações em tempo real
- **Segurança**: Guards para WebSocket (auth + throttling)

### **Módulos de Domínio**
- **UsersModule**: Gerenciamento de usuários e roles
- **ContactsModule**: CRUD de contatos e tags
- **ConversationsModule**: Gerenciamento de conversas
- **MessagesModule**: Processamento de mensagens
- **BotsModule**: Configuração de bots

## Configurações de Ambiente

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=apicechat_user
DB_PASSWORD=apicechat_password
DB_NAME=apicechat_db

# Application
NODE_ENV=development
PORT=3000
JWT_SECRET=dijsfahkdgf7qg2783gf27fgiuashiofuas7f

# WhatsApp
WHATSAPP_VERIFY_TOKEN=meu_token_de_verificacao_123
WHATSAPP_ACCESS_TOKEN=test_access_token_123
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_BUSINESS_ACCOUNT_ID=business123
WHATSAPP_API_VERSION=v18.0
```

## Funcionalidades Implementadas

### 🔐 **Autenticação e Autorização**
- Login com username/password
- JWT tokens com refresh automático
- Sistema de roles e permissões
- Guards globais para proteção de endpoints

### 📱 **Integração WhatsApp**
- Recebimento de mensagens via webhook
- Envio de mensagens text/mídia
- Sincronização de status de entrega
- Suporte a múltiplas instâncias WhatsApp

### 💬 **Gerenciamento de Conversas**
- Criação automática de conversas
- Sistema de fila de atendimento
- Atribuição manual/automática (usuário ou bot)
- Transferência entre atendentes
- Estados de conversa bem definidos

### 👥 **CRM de Contatos**
- Cadastro automático via WhatsApp
- Sistema de tags para categorização
- Histórico completo de interações
- Pesquisa e filtros avançados

### 🤖 **Sistema de Bots**
- Atendimento automatizado
- Integração com conversas manuais
- Configuração flexível por bot

### 🔄 **Tempo Real**
- WebSocket para notificações instantâneas
- Sincronização de status online/offline
- Atualizações de conversa em tempo real

### 📎 **Anexos e Mídia**
- Upload via Supabase
- Suporte a múltiplos tipos de arquivo
- Metadata de arquivos
- Integração com mensagens WhatsApp

### ⚡ **Performance e Segurança**
- Cache Redis para otimização
- Rate limiting configurável
- Validação robusta de dados
- Logs estruturados

## Fluxo de Desenvolvimento

### Comandos Essenciais
```bash
pnpm install           # Instalar dependências
pnpm run start:dev     # Desenvolvimento com watch
pnpm run build         # Build para produção
pnpm run lint          # Linting com ESLint
pnpm run format        # Formatação com Prettier
pnpm run test          # Testes unitários
pnpm run test:e2e      # Testes end-to-end
```

### Estrutura de Pastas
```
src/
├── auth/              # Autenticação e autorização
├── common/            # Utilitários compartilhados
│   ├── enums/         # Enums do sistema
│   ├── services/      # Serviços utilitários
│   ├── cache/         # Módulo de cache
│   ├── storage/       # Integração Supabase
│   └── upload/        # Upload de arquivos
├── config/            # Configurações
├── modules/           # Módulos de domínio
│   ├── users/
│   ├── contacts/
│   ├── conversations/
│   ├── messages/
│   ├── bots/
│   └── meta-whatsapp/
└── websocket/         # WebSocket gateway
```

## Pontos de Atenção

### Segurança
- Tokens JWT com expiração configurável
- Senhas encriptadas com bcrypt
- Validação rigorosa de inputs
- Rate limiting para prevenir abuse
- Secrets não expostos nos logs

### Performance
- Cache Redis para dados frequentes
- Conexões WebSocket otimizadas
- Paginação em listagens
- Índices otimizados no banco

### Escalabilidade
- Arquitetura modular
- Separação clara de responsabilidades
- Suporte a múltiplas instâncias WhatsApp
- WebSocket com suporte a clusters

### Monitoramento
- Logs estruturados com contexto
- Health checks implementados
- Tracking de status de mensagens
- Métricas de performance

Este contexto fornece uma visão completa da arquitetura, regras de negócio e funcionalidades da ApiceChat API, facilitando o desenvolvimento futuro e manutenção do sistema.