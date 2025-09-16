# 🚀 FOCOS IA - Sistema CRM Inteligente com Integração WhatsApp Business

## 📋 Visão Geral do Sistema

O **FOCOS IA** é uma plataforma CRM completa e moderna que integra comunicação via WhatsApp Business API com automação inteligente através de N8N, oferecendo gerenciamento avançado de conversas, contatos e equipes em tempo real.

## 🎯 Propósito e Objetivo

Transformar o atendimento ao cliente através de uma plataforma unificada que combina:
- **Comunicação Centralizada**: Todas as conversas do WhatsApp em um único lugar
- **Automação Inteligente**: Bots e workflows customizáveis via N8N
- **Gestão de Equipe**: Distribuição e monitoramento de atendimentos
- **Análise de Dados**: Métricas e insights em tempo real

## 🏗️ Arquitetura Técnica

### Backend - API NestJS
```
backend/
├── src/
│   ├── auth/                 # Autenticação JWT com Passport
│   ├── common/               # Utilitários compartilhados
│   ├── modules/              # 16 módulos de domínio
│   │   ├── users/           # Gestão de usuários
│   │   ├── contacts/        # Gestão de contatos
│   │   ├── conversations/   # Gestão de conversas
│   │   ├── messages/        # Sistema de mensagens
│   │   ├── meta-whatsapp/   # Integração WhatsApp API
│   │   ├── n8n-bot/         # Integração N8N
│   │   └── ...              # Outros módulos
│   └── websocket/           # Gateway Socket.io
```

**Stack Backend:**
- NestJS + TypeScript
- PostgreSQL + TypeORM
- Redis (Cache)
- Socket.io (Real-time)
- JWT + Passport (Auth)
- Supabase (Storage)

### Frontend - React + TypeScript
```
frontend/
├── src/
│   ├── pages/               # 4 páginas principais
│   ├── components/          # Componentes reutilizáveis
│   ├── services/           # Camada de serviços API
│   ├── stores/             # Estado global (Zustand)
│   ├── hooks/              # Custom React hooks
│   └── types/              # TypeScript types
```

**Stack Frontend:**
- React 19 + TypeScript
- Vite (Build tool)
- TailwindCSS 4
- Zustand (State)
- React Router DOM
- React Hook Form + Yup
- Axios + Socket.io Client

## 🔄 Fluxo de Funcionamento

### 1. Fluxo de Mensagens WhatsApp
```mermaid
WhatsApp User → WhatsApp API → Webhook → Backend
                                           ↓
Frontend ← WebSocket ← Database ← Message Processing
                                           ↓
                                     Bot (N8N) Integration
```

### 2. Fluxo de Autenticação
```mermaid
Login → JWT Generation → Token Storage → API Requests
         ↓                               ↓
    User Session                   Protected Routes
```

### 3. Fluxo de Conversas
```mermaid
Nova Mensagem → Criar/Atualizar Conversa → Atribuição (Bot/Usuário)
                        ↓                           ↓
                  Cache Update              WebSocket Broadcast
```

## 💡 Funcionalidades Principais

### 🔐 Sistema de Autenticação
- **JWT com expiração de 2 dias**
- **Roles**: Admin, Supervisor, Operador
- **Guards e Decorators personalizados**
- **Logout automático em 401**

### 👥 Gestão de Usuários
- **CRUD completo com validações**
- **Tipos de contato**: ADS, SUPPORT, ALL
- **Restrições de acesso por tipo**
- **Status online/offline**

### 📞 Gestão de Contatos
- **Importação automática do WhatsApp**
- **Sistema de Tags coloridas**
- **Múltiplas contas por contato**
- **Tipos**: ADS ou SUPPORT**
- **Busca e filtros avançados**

### 💬 Sistema de Conversas
- **Atribuição para usuários ou bots**
- **Status: lido/não lido**
- **Histórico completo**
- **Paginação cursor-based**
- **Cache de última mensagem**

### 📨 Sistema de Mensagens
- **Suporte a texto e mídia**
- **Anexos via Supabase**
- **Status de entrega WhatsApp**
- **Mensagens de bot**
- **Respostas rápidas**

### 🤖 Integração N8N Bot
- **Webhooks customizados**
- **Logging completo**
- **Timeout de 20s**
- **Processamento assíncrono**
- **URLs obfuscadas para segurança**

### 📱 Integração WhatsApp Business API
- **Versão v23.0 da Meta API**
- **Webhook processing**
- **Download/upload de mídia**
- **Status tracking**
- **Multi-conta suportado**

### 🚀 Sistema Real-Time
- **WebSocket com Socket.io**
- **Autenticação JWT no handshake**
- **Rooms por conversa**
- **Rate limiting**
- **Eventos tipados**

### 💾 Sistema de Cache
- **Redis para cache distribuído**
- **Cache de última mensagem (30s TTL)**
- **Cache de integrações (10min TTL)**
- **Cache em memória para performance**

### 📁 Upload de Arquivos
- **Supabase Storage**
- **Validação de tipos MIME**
- **Limites: Imagens 10MB, Vídeos 100MB**
- **Organização automática por tipo**

## 🔧 Configuração e Instalação

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- pnpm (backend) e npm (frontend)

### Backend Setup
```bash
cd backend
cp .env.example .env
# Configure as variáveis de ambiente
pnpm install
pnpm run start:dev
```

### Frontend Setup
```bash
cd frontend
cp .env.example .env
# Configure VITE_API_URL
npm install
npm run dev
```

### Variáveis de Ambiente Necessárias

**Backend (.env):**
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=focos_ia_chat

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=2d

# WhatsApp
WHATSAPP_VERIFY_TOKEN=verify-token

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Supabase
SUPABASE_URL=https://project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_BUCKET=uploads

# N8N
N8N_BOT_ENDPOINT=https://n8n-webhook-url
N8N_BOT_TIMEOUT=20000
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000
```

## 📊 Estrutura do Banco de Dados

### Principais Entidades
- **users**: Usuários do sistema com roles
- **contacts**: Contatos do WhatsApp
- **conversations**: Conversas ativas
- **messages**: Mensagens trocadas
- **message_attachments**: Arquivos anexados
- **whatsapp_integration_configs**: Configurações WhatsApp
- **bots**: Configurações de bots
- **tags**: Sistema de etiquetas
- **quick_replies**: Respostas rápidas

### Relacionamentos Chave
- User ↔ Role (N:1)
- Contact ↔ Conversation (1:N)
- Conversation ↔ Message (1:N)
- Message ↔ Attachment (1:N)
- Contact ↔ Tag (N:N)
- Conversation ↔ User/Bot (N:1)

## 🔒 Segurança Implementada

### Backend
- **Autenticação JWT obrigatória**
- **Rate limiting global**
- **Validação de DTOs**
- **Máscaras de dados sensíveis**
- **Guards para roles**
- **Sanitização de inputs**

### Frontend
- **Rotas protegidas**
- **Token em localStorage**
- **Auto-logout em 401**
- **Validação de formulários**
- **Sanitização de exibição**

## 🎨 Interface do Usuário

### Design System
- **Tema Dark**: Gray-900 base
- **Cor Primária**: Red-900 (FOCOS IA)
- **Componentes CVA**: Variantes consistentes
- **Mobile-first**: Totalmente responsivo
- **Acessibilidade**: Headless UI

### Páginas Principais
1. **Login**: Autenticação segura
2. **Usuários**: Gestão completa da equipe
3. **Contatos**: CRM com tags e filtros
4. **Integração WhatsApp**: Configuração de contas

## 📈 Métricas e Performance

### Otimizações Implementadas
- **Paginação cursor-based para grandes volumes**
- **Cache multi-nível (Redis + Memory)**
- **Índices otimizados no banco**
- **Lazy loading de componentes**
- **Debounce em buscas**
- **Memoização de componentes pesados**

### Capacidades
- ✅ Suporta 10.000+ contatos
- ✅ 1.000+ mensagens/segundo
- ✅ Múltiplas contas WhatsApp
- ✅ Real-time para 500+ usuários simultâneos

## 🚧 Roadmap Futuro

### Em Desenvolvimento
- [ ] Dashboard com métricas
- [ ] Relatórios avançados
- [ ] Campanhas de mensagens
- [ ] Integração com mais canais

### Planejado
- [ ] IA para respostas automáticas
- [ ] Análise de sentimento
- [ ] Transcrição de áudio
- [ ] Mobile app
- [ ] Marketplace de integrações

## 🤝 Equipe de Desenvolvimento

Desenvolvido pela **FOCOS IA** - Transformando conversas em oportunidades.

## 📄 Licença

Propriedade privada da FOCOS IA © 2024. Todos os direitos reservados.

---

**Versão**: 1.0.0
**Status**: Produção
**Última Atualização**: Dezembro 2024