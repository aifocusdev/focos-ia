# 📊 **FOCOS IA - Documentação Completa do Sistema**

## 🏗️ **ARQUITETURA GERAL**

### **Visão Macro**
```
┌─────────────────────────────────────────────────────────────┐
│                      FOCOS IA Platform                       │
├───────────────────┬─────────────────────┬──────────────────┤
│     Frontend      │      Backend        │    Database      │
│   React 19 + TS   │   NestJS + TS      │   PostgreSQL     │
│   Port: 5174      │   Port: 3001       │   Port: 5432     │
└───────────────────┴─────────────────────┴──────────────────┘
```

## 🎯 **BACKEND - API NestJS**

### **Estrutura Modular**
```
backend/
├── src/
│   ├── main.ts                 # Entry point (porta 3001)
│   ├── app.module.ts           # Módulo raiz
│   ├── auth/                   # Autenticação JWT
│   ├── common/                 # Recursos compartilhados
│   ├── config/                 # Configurações
│   ├── modules/                # 16 módulos de domínio
│   └── websocket/              # Gateway Socket.io
```

### **Módulos do Sistema (16)**

#### **1. Autenticação & Usuários**
- **auth/** - JWT com Passport.js, login/logout, guards
- **users/** - CRUD usuários, perfis, status online
- **roles/** - Gerenciamento de papéis (admin, user, supervisor)

#### **2. Comunicação & Mensagens**
- **conversations/** - Conversas WhatsApp, atribuição automática
- **messages/** - Mensagens com paginação cursor, status de leitura
- **message-attachments/** - Mídia (imagem, vídeo, áudio, documento)
- **quick-replies/** - Respostas rápidas predefinidas

#### **3. Contatos & CRM**
- **contacts/** - Gestão de contatos, notas, preferências
- **contact-user-accounts/** - Múltiplas contas por contato
- **tags/** - Sistema de etiquetas para categorização

#### **4. Integrações**
- **meta-whatsapp/** - WhatsApp Business API, webhooks Meta
- **whatsapp-integration-config/** - Configurações de números WhatsApp
- **n8n-bot/** - Integração com automação N8N
- **bots/** - Configuração de bots automatizados

#### **5. Infraestrutura**
- **servers/** - Servidores de aplicação
- **devices/** - Dispositivos conectados
- **applications/** - Aplicações externas integradas

### **Recursos Técnicos Backend**

#### **Banco de Dados**
- **ORM**: TypeORM com migrações automáticas
- **Database**: PostgreSQL (focos_ia)
- **Relacionamentos**: ManyToOne, OneToMany, ManyToMany
- **Soft Deletes**: Implementado em todas entidades

#### **Segurança**
- **Autenticação**: JWT Bearer Token
- **Guards**: JwtAuthGuard, RolesGuard, LocalAuthGuard
- **Rate Limiting**: 100 requisições/minuto (Throttler)
- **Validação**: class-validator com DTOs
- **Senha**: bcrypt com salt rounds

#### **Comunicação Real-time**
- **WebSocket**: Socket.io para chat em tempo real
- **Eventos**: Mensagens, status, typing, presença
- **Salas**: Por conversa e usuário
- **Autenticação WS**: JWT no handshake

#### **Storage**
- **Local Storage**: Sistema de arquivos local
- **Upload Path**: `/uploads`
- **Tipos Suportados**: Imagem, vídeo, áudio, documento
- **Multer**: Para processamento de uploads

#### **Integrações Externas**
- **WhatsApp Business API**: Webhooks, envio/recebimento
- **N8N**: Webhooks para automação
- **Meta Graph API**: v18.0

## 🎨 **FRONTEND - React + TypeScript**

### **Estrutura da Aplicação**
```
frontend/
├── src/
│   ├── main.tsx               # Entry point
│   ├── App.tsx                # Rotas e providers
│   ├── pages/                 # Páginas da aplicação
│   ├── components/            # Componentes reutilizáveis
│   ├── stores/                # Estado global (Zustand)
│   ├── services/              # Comunicação com API
│   ├── hooks/                 # React hooks customizados
│   └── types/                 # TypeScript types
```

### **Páginas do Sistema**

#### **Páginas Públicas**
- **`/login`** - Tela de autenticação

#### **Páginas de Chat (Usuários Autenticados)**
- **`/conversations`** - Interface principal de chat WhatsApp
- **`/servers`** - Gerenciamento de servidores
- **`/devices`** - Dispositivos conectados
- **`/applications`** - Aplicações integradas
- **`/quick-replies`** - Respostas rápidas
- **`/tags`** - Gerenciamento de tags

#### **Páginas Administrativas (Apenas Admin)**
- **`/admin/users`** - Gerenciamento de usuários
- **`/admin/contacts`** - Gerenciamento de contatos
- **`/admin/whatsapp-integration`** - Configuração WhatsApp Business

### **Componentes Principais**

#### **Layout & Navegação**
- **MainLayout** - Layout principal com sidebar
- **Sidebar** - Menu lateral com navegação dinâmica por role
- **Navbar** - Barra superior com informações do usuário

#### **Chat & Mensagens**
- **ConversationLayout** - Container principal do chat
- **ConversationList** - Lista de conversas ativas
- **MessageList** - Lista de mensagens com scroll infinito
- **MessageComposer** - Editor de mensagens com anexos
- **MessageItem** - Renderização individual de mensagem
- **AudioPlayer** - Player de áudio para mensagens de voz
- **ImageViewer** - Visualizador de imagens
- **VideoPlayer** - Player de vídeo
- **DocumentViewer** - Visualizador de documentos

#### **UI Components**
- **Button, Input, Textarea** - Componentes de formulário
- **Table, TablePagination** - Tabelas com paginação
- **LoadingSpinner** - Indicadores de carregamento
- **ErrorBoundary** - Tratamento de erros
- **ConfirmDialog** - Diálogos de confirmação
- **Toast** - Notificações temporárias
- **Modal** - Sistema de modais

### **Gerenciamento de Estado (Zustand)**

#### **Stores Principais**
1. **authStore** - Autenticação e sessão do usuário
2. **conversationStore** - Conversas ativas e mensagens
3. **contactStore** - Informações de contatos (chat)
4. **adminContactStore** - Gerenciamento admin de contatos
5. **socketStore** - Conexão WebSocket
6. **userStore** - Gerenciamento de usuários (admin)
7. **whatsAppStore** - Configurações WhatsApp
8. **deviceStore** - Dispositivos conectados
9. **serverStore** - Servidores
10. **applicationStore** - Aplicações
11. **quickReplyStore** - Respostas rápidas
12. **tagStore** - Tags do sistema

### **Tecnologias Frontend**

#### **Core**
- **React 19.1.0** - Framework UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **React Router DOM** - Roteamento SPA

#### **Estado & Forms**
- **Zustand** - Estado global
- **React Hook Form** - Gerenciamento de formulários
- **Yup** - Validação de schemas

#### **UI & Estilo**
- **TailwindCSS** - Framework CSS utilitário
- **HeadlessUI** - Componentes acessíveis
- **Heroicons** - Ícones do sistema
- **Lucide React** - Ícones adicionais
- **CVA + clsx** - Classes condicionais

#### **Comunicação**
- **Axios** - Cliente HTTP
- **Socket.io Client** - WebSocket real-time

#### **Utilitários**
- **date-fns** - Manipulação de datas
- **emoji-picker-react** - Seletor de emojis
- **react-textarea-autosize** - Textarea expansível
- **react-mentions** - Menções @

## 🔄 **COMUNICAÇÃO FRONTEND ↔ BACKEND**

### **API RESTful**
```typescript
// Base URL: http://localhost:3001
// Headers: Authorization: Bearer {jwt_token}

// Estrutura de requisição
api.get<T>('/endpoint')
api.post<T>('/endpoint', data)
api.put<T>('/endpoint/:id', data)
api.delete('/endpoint/:id')
```

### **WebSocket (Socket.io)**
```typescript
// Conexão: ws://localhost:3001
// Autenticação: JWT no handshake

// Eventos principais:
- 'message:new' - Nova mensagem
- 'message:status' - Status de mensagem
- 'conversation:update' - Atualização de conversa
- 'user:typing' - Indicador de digitação
- 'user:online' - Status de presença
```

### **Fluxo de Autenticação**
```
1. POST /auth/login { username, password }
2. Recebe { accessToken, user }
3. Armazena token no localStorage
4. Adiciona token em todas requisições
5. Reconecta WebSocket com token
```

## 💾 **BANCO DE DADOS PostgreSQL**

### **Estrutura de Tabelas**

#### **Tabelas Principais (16)**
```sql
- users                    -- Usuários do sistema
- roles                    -- Papéis (admin, user)
- contacts                 -- Contatos WhatsApp
- conversations           -- Conversas ativas
- messages                -- Mensagens trocadas
- message_attachments     -- Anexos de mensagens
- tags                    -- Etiquetas
- contact_tags           -- Relação contato-tag
- devices                -- Dispositivos
- servers                -- Servidores
- applications           -- Aplicações
- quick_replies          -- Respostas rápidas
- bots                   -- Configuração de bots
- whatsapp_integration_config -- Config WhatsApp
- contact_user_accounts  -- Contas de usuário
- n8n_logs              -- Logs de automação
```

### **Relacionamentos**
- **users** → conversations (OneToMany)
- **contacts** → conversations (OneToMany)
- **conversations** → messages (OneToMany)
- **messages** → message_attachments (OneToMany)
- **contacts** ↔ tags (ManyToMany via contact_tags)
- **users** → role (ManyToOne)

### **Índices e Performance**
- Índices em foreign keys
- Índices em campos de busca (phone, username)
- Soft delete em todas tabelas
- Timestamps automáticos (created_at, updated_at)

## 🔐 **SEGURANÇA & AUTENTICAÇÃO**

### **JWT Token**
- **Expiração**: 7 dias
- **Secret**: Configurável via .env
- **Payload**: { sub: userId, username, role }

### **Níveis de Acesso**
1. **Public** - Apenas /login
2. **User** - Todas funcionalidades de chat
3. **Admin** - Acesso total + gerenciamento

### **Rate Limiting**
- Global: 100 req/min
- WebSocket: Throttle por evento
- Upload: Limite de 10MB

## 🚀 **FUNCIONALIDADES PRINCIPAIS**

### **1. Chat WhatsApp Multi-atendimento**
- Interface completa de chat
- Suporte a múltiplas conversas simultâneas
- Envio de texto, imagem, vídeo, áudio, documento
- Status de mensagem (enviado, entregue, lido)
- Indicador de digitação
- Busca em conversas

### **2. CRM de Contatos**
- Perfil completo de contato
- Histórico de conversas
- Tags para categorização
- Notas e observações
- Preferências de marketing
- Múltiplas contas por contato

### **3. Automação & Bots**
- Integração com N8N
- Respostas automáticas
- Fluxos de atendimento
- Webhooks personalizados

### **4. Gestão de Equipe**
- Atribuição automática de conversas
- Fila de atendimento
- Supervisão em tempo real
- Métricas de atendimento

### **5. Integrações**
- WhatsApp Business API oficial
- Webhooks Meta
- APIs externas via applications
- Storage local de mídia

## 📁 **VARIÁVEIS DE AMBIENTE**

### **Backend (.env)**
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=03101996
DB_NAME=focos_ia

# Application
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=focos-ia-chat-secret-key-2025
JWT_EXPIRES_IN=7d

# WhatsApp Business API
META_API_BASE_URL=https://graph.facebook.com/v18.0
META_WEBHOOK_VERIFY_TOKEN=focos_ia_webhook_token
META_ACCESS_TOKEN=your-meta-access-token

# N8N Integration
N8N_BOT_ENDPOINT=http://localhost:5678/webhook/dummy
```

### **Frontend (.env)**
```env
VITE_API_URL=http://localhost:3001
VITE_WEBSOCKET_URL=http://localhost:3001
VITE_WS_URL=http://localhost:3001
```

## 🔧 **COMANDOS ÚTEIS**

### **Backend**
```bash
cd backend
pnpm install          # Instalar dependências
pnpm run start:dev    # Desenvolvimento
pnpm run build        # Build produção
pnpm run start:prod   # Produção
```

### **Frontend**
```bash
cd frontend
npm install          # Instalar dependências
npm run dev          # Desenvolvimento (porta 5174)
npm run build        # Build produção
npm run preview      # Preview produção
```

### **Database**
```bash
# Criar database
psql -U postgres -c "CREATE DATABASE focos_ia;"

# Criar admin
node backend/scripts/create-admin.js
```

## 🎯 **VISÃO DO PRODUTO**

A **FOCOS IA** é uma plataforma completa de atendimento multicanal focada em WhatsApp Business, oferecendo:

1. **Central de Atendimento** - Interface profissional de chat
2. **CRM Integrado** - Gestão completa de contatos
3. **Automação Inteligente** - Bots e fluxos automatizados
4. **Gestão de Equipe** - Controle e supervisão
5. **Escalabilidade** - Arquitetura modular e extensível

O sistema foi projetado para empresas que precisam gerenciar grandes volumes de atendimento via WhatsApp, com recursos avançados de automação e gestão de equipe, mantendo a qualidade e personalização do atendimento.

## 📈 **MÉTRICAS E CAPACIDADES**

### **Performance**
- Suporta centenas de conversas simultâneas
- Mensagens em tempo real via WebSocket
- Paginação otimizada com cursor
- Cache de mensagens recentes

### **Escalabilidade**
- Arquitetura modular permite adicionar novos canais
- Separação clara entre camadas (Controller → Service → Repository)
- Possibilidade de microsserviços futuros
- Queue de mensagens preparada para fila externa

### **Monitoramento**
- Logs estruturados por módulo
- Métricas de uso da API
- Status de conexões WebSocket
- Tracking de webhooks recebidos

## 🛠️ **DESENVOLVIMENTO E DEPLOY**

### **Ambiente de Desenvolvimento**
```bash
# Clone do repositório
git clone https://github.com/aifocusdev/focos-ia.git
cd focos-ia

# Setup Backend
cd backend
pnpm install
cp .env.example .env
# Editar .env com suas configurações
pnpm run start:dev

# Setup Frontend
cd ../frontend
npm install
cp .env.example .env
# Editar .env com suas configurações
npm run dev

# Criar banco e usuário admin
psql -U postgres -c "CREATE DATABASE focos_ia;"
cd backend
node scripts/create-admin.js
```

### **Build para Produção**
```bash
# Backend
cd backend
pnpm run build
pnpm run start:prod

# Frontend
cd frontend
npm run build
# Servir pasta dist/ com nginx ou similar
```

### **Docker (Opcional)**
```bash
# Backend tem docker-compose.yml pronto
cd backend
docker-compose up -d
```

## 📝 **NOTAS IMPORTANTES**

1. **Sem Supabase**: O sistema foi migrado para usar storage local ao invés de Supabase
2. **Rate Limiting**: Configurado para 100 req/min para evitar sobrecarga
3. **Portas**: Backend (3001), Frontend (5174), PostgreSQL (5432)
4. **Admin Padrão**: username: admin, senha: admin123
5. **Repositório**: https://github.com/aifocusdev/focos-ia.git (branch master)

## 🤝 **CONTRIBUINDO**

O projeto segue a estrutura padrão NestJS no backend e React com Vite no frontend. Para contribuir:

1. Módulos backend em `src/modules/`
2. Páginas frontend em `src/pages/`
3. Componentes reutilizáveis em `src/components/`
4. Services para comunicação API em `src/services/`
5. Stores Zustand em `src/stores/`

## 📜 **LICENÇA**

Projeto proprietário da FOCOS IA.

---

**Última atualização**: Dezembro 2024
**Versão**: 1.0.0