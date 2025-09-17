# 🚀 ApiCeChat Frontend - Contexto de Desenvolvimento

## 📋 **Visão Geral do Projeto**

Sistema de chat/CRM para **agentes de atendimento** integrado com a API NestJS ApiCeChat. Interface web moderna para gerenciar conversas do WhatsApp Business API em tempo real.

### **Stack Técnico**
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: TailwindCSS + Headless UI + Heroicons
- **Estado**: Zustand (planejado)
- **API**: Axios + JWT Auth
- **WebSocket**: Socket.io Client
- **Forms**: React Hook Form + Yup
- **Roteamento**: React Router DOM

## 🗺️ **Arquitetura da API Backend**

### **Entidades Principais**
```typescript
// User
{
  id: number, name: string, username: string, 
  role_id: number, online: boolean, role: Role
}

// Conversation  
{
  id: number, contact_id: number, integration_id: number,
  assigned_user: number | null, assigned_bot: number | null,
  status: 'queue' | 'active' | 'closed' | 'transferred'
}

// Message
{
  id: number, conversation_id: number, 
  sender_type: 'contact' | 'user' | 'bot' | 'system',
  body: string, created_at: string, attachments: MessageAttachment[]
}

// Contact
{
  id: number, external_id: string, name: string, 
  phone_number: string, tags: Tag[]
}
```

### **Endpoints Principais**
```bash
# Auth
POST /auth/login        # { username, password } -> { access_token, user }
POST /auth/logout

# Conversations
GET /conversations                     # Lista com filtros (status, assigned_user, etc.)
GET /conversations/:id                 # Detalhes da conversa
PATCH /conversations/:id/assign        # Atribuir a usuário/bot
PATCH /conversations/:id/close         # Fechar conversa

# Messages  
GET /messages/conversation/:id         # Mensagens da conversa (paginação)
GET /messages/conversation/:id/cursor  # Cursor pagination
POST /messages                         # Enviar mensagem
PATCH /messages/mark-as-read          # Marcar como lidas
GET /messages/unread-count            # Contagem não lidas

# WebSocket Events (/crm namespace)
- message:new, message:read, message:typing
- conversation:assigned, conversation:status_changed  
- user:online, user:offline, user:typing
- join:conversation, leave:conversation
```

## 🎯 **Status Atual do Desenvolvimento**

### ✅ **FASE 1 CONCLUÍDA** - Setup & Autenticação

#### **Arquivos Implementados:**

**🔐 Autenticação & Contextos**
- `src/contexts/AuthContext.tsx` - Context React com login/logout
- `src/components/auth/ProtectedRoute.tsx` - Proteção de rotas

**🌐 Services & API**
- `src/services/api.service.ts` - HTTP client Axios com interceptors
- `src/services/auth.service.ts` - Autenticação JWT
- `src/services/conversation.service.ts` - CRUD conversas
- `src/services/message.service.ts` - CRUD mensagens
- `src/services/websocket.service.ts` - Socket.io client com events

**📝 Types TypeScript**
- `src/types/user.types.ts` - User, Role, LoginRequest/Response
- `src/types/conversation.types.ts` - Conversation, ConversationStatus, etc.
- `src/types/message.types.ts` - Message, MessageAttachment, etc.
- `src/types/contact.types.ts` - Contact + CRUD DTOs
- `src/types/tag.types.ts` - Tag + CRUD DTOs  
- `src/types/bot.types.ts` - Bot + CRUD DTOs

**🎨 UI Components & Layout**
- `src/components/ui/LoadingSpinner.tsx` - Spinner reutilizável
- `src/components/layout/DashboardLayout.tsx` - Layout principal
- `src/pages/LoginPage.tsx` - Página de login completa
- `src/pages/DashboardPage.tsx` - Dashboard (placeholder)
- `src/utils/cn.ts` - Utility para classes CSS

**⚙️ Configurações**
- `tailwind.config.js` - Config customizada com cores/animações
- `src/index.css` - Classes CSS customizadas
- `.env` - Variáveis ambiente (VITE_API_URL=http://localhost:3000)

#### **Funcionalidades Implementadas:**
✅ Sistema de autenticação JWT funcional  
✅ Interceptors Axios para tokens/erros  
✅ WebSocket service com auto-reconnect  
✅ Layout responsivo 3-painéis  
✅ Design system TailwindCSS  
✅ Types completos da API  
✅ Build sem erros ✅  
✅ Dev server funcional (port 5174)  

### 🔄 **FASE 2 EM ANDAMENTO** - Estado Global & WebSocket

#### **Próximas Implementações:**
```typescript
// Stores Zustand a criar:
- authStore      // usuário logado, status online
- conversationStore // lista conversas, filtros, selecionada  
- messageStore   // mensagens por conversa, typing
- uiStore        // loading, modais, notificações
```

#### **Tasks Pendentes:**
- [ ] Criar Zustand stores (auth, conversations, messages, ui)
- [ ] Configurar WebSocket listeners nos stores
- [ ] Sistema de notificações toast
- [ ] Hooks customizados (useConversations, useMessages, etc.)

## 🛠️ **Comandos de Desenvolvimento**

```bash
# Setup
npm install                     # Instalar dependências
cp .env.example .env           # Configurar environment

# Development  
npm run dev                    # Dev server (porta 5174)
npm run build                  # Build produção
npm run preview               # Preview build
npm run lint                  # ESLint

# API Backend (separado)
cd ../apicechat-api
pnpm run start:dev            # API em localhost:3000
```

## 🎨 **Design System**

### **Classes CSS Customizadas**
```css
/* Buttons */
.btn-primary    /* Azul primário */
.btn-secondary  /* Cinza */  
.btn-success    /* Verde */
.btn-danger     /* Vermelho */
.btn-outline    /* Outline */

/* Status Badges */
.status-queue       /* Amarelo - na fila */
.status-active      /* Verde - ativa */
.status-closed      /* Cinza - fechada */
.status-transferred /* Azul - transferida */

/* Inputs */
.input         /* Input padrão */
.input-error   /* Input com erro */

/* Layout */
.card          /* Card branco com sombra */
.scrollbar-thin /* Scrollbar customizada */
```

### **Cores do Theme**
```javascript
primary: { 500: '#3b82f6', 600: '#2563eb' }  // Azul
success: { 500: '#22c55e', 600: '#16a34a' }  // Verde  
warning: { 500: '#f59e0b', 600: '#d97706' }  // Amarelo
danger:  { 500: '#ef4444', 600: '#dc2626' }  // Vermelho
```

## 📱 **Interface Planejada**

### **Layout Dashboard (3 painéis)**
```
┌─────────────────┬──────────────────┬────────────────┐
│   CONVERSAS     │      CHAT        │    DETALHES    │
│                 │                  │                │
│ - Filtros       │ - Cabeçalho      │ - Info Contato │
│ - Lista         │ - Mensagens      │ - Tags         │
│ - Busca         │ - Input          │ - Histórico    │
│ - Status        │ - Anexos         │ - Ações        │
│                 │                  │                │
└─────────────────┴──────────────────┴────────────────┘
```

### **Funcionalidades por Painel**

**Painel Esquerdo - Lista Conversas:**
- [x] Scroll infinito
- [x] Filtros (status, atribuição)
- [x] Busca por contato/telefone
- [x] Badges mensagens não lidas
- [x] Status visual (queue/active/closed)

**Painel Central - Chat:**
- [x] Lista mensagens com scroll
- [x] Tipos: texto, mídia, sistema
- [x] Status entrega (enviado/lido)
- [x] Input com anexos
- [x] Indicador "digitando"

**Painel Direito - Detalhes:**
- [x] Dados do contato
- [x] Tags editáveis  
- [x] Ações (atribuir, fechar)
- [x] Histórico conversas

## 🔄 **Fluxos de Dados**

### **Autenticação**
1. Login → AuthService.login() → JWT token → localStorage
2. AuthContext → user state → ProtectedRoute
3. Axios interceptors → Authorization header
4. Token expired → redirect /login

### **Conversas (Planejado)**
1. ConversationStore.fetch() → API → lista conversas
2. WebSocket → conversation:updated → store.update()  
3. User seleciona → store.setSelected() → fetch messages
4. Atribuir conversa → API → WebSocket broadcast

### **Mensagens (Planejado)**  
1. MessageStore.fetchByConversation() → cursor pagination
2. WebSocket → message:new → store.addMessage()
3. Enviar mensagem → API → WebSocket → store update
4. Typing indicators → WebSocket events

### **Real-time Events**
```typescript
// WebSocket listeners necessários:
websocket.on('message:new', (data) => messageStore.addMessage(data))
websocket.on('conversation:assigned', (data) => conversationStore.update(data))  
websocket.on('user:typing', (data) => messageStore.setTyping(data))
websocket.on('user:online', (data) => authStore.updatePresence(data))
```

## 🎯 **Próximos Passos**

### **Fase 2 - Estado & WebSocket** (2-3 dias)
1. **Zustand Stores**: Implementar stores para auth, conversations, messages, ui
2. **WebSocket Integration**: Conectar events aos stores  
3. **Notification System**: Toast notifications
4. **Custom Hooks**: useConversations, useMessages, useAuth

### **Fase 3 - Interface Principal** (3-4 dias)
1. **ConversationList**: Lista conversas com filtros/busca
2. **ChatArea**: Interface de mensagens  
3. **ContactPanel**: Detalhes e ações
4. **MessageInput**: Composição mensagens + anexos

### **Fase 4 - Features Avançadas** (2-3 dias)
1. **Search**: Busca avançada mensagens
2. **Media Viewer**: Visualizador mídia
3. **Tag Management**: CRUD tags
4. **Dashboard**: Métricas básicas

### **Fase 5 - Polish** (1-2 dias)  
1. **Performance**: Memoização, lazy loading
2. **Responsive**: Mobile optimization
3. **Accessibility**: A11y
4. **Testing**: Testes essenciais

## 💾 **Estado Atual dos Dados**

### **localStorage Keys**
- `accessToken` - JWT token autenticação
- `currentUser` - Dados usuário logado (temp solution)

### **API Configuration**
- Base URL: `http://localhost:3000` 
- WebSocket: `/crm` namespace
- Timeout: 10s
- Auto token refresh: ❌ (implementar)

## 🐛 **Problemas Conhecidos & Soluções**

### **Resolvidos:**
✅ Socket.io import issues → `import ioClient from 'socket.io-client'`  
✅ TypeScript verbatimModuleSyntax → type imports  
✅ erasableSyntaxOnly conflitos → removido do tsconfig  
✅ Build errors → todos corrigidos  

### **A Implementar:**
- [ ] API /me endpoint (ou JWT decode para currentUser)
- [ ] Token refresh automático  
- [ ] Error boundaries React
- [ ] Loading states globais
- [ ] Retry logic para requests falhados

## 📁 **Estrutura de Arquivos Atual**

```
src/
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx
│   ├── layout/
│   │   └── DashboardLayout.tsx  
│   └── ui/
│       └── LoadingSpinner.tsx
├── contexts/
│   └── AuthContext.tsx
├── pages/
│   ├── DashboardPage.tsx
│   └── LoginPage.tsx
├── services/
│   ├── api.service.ts
│   ├── auth.service.ts  
│   ├── conversation.service.ts
│   ├── message.service.ts
│   └── websocket.service.ts
├── types/
│   ├── bot.types.ts
│   ├── contact.types.ts
│   ├── conversation.types.ts
│   ├── message.types.ts
│   ├── tag.types.ts
│   └── user.types.ts
├── utils/
│   └── cn.ts
├── App.tsx
├── main.tsx
└── index.css
```

---

## 🚀 **Como Continuar o Desenvolvimento**

1. **Ler este arquivo** para recuperar contexto completo
2. **Verificar todo list** atual no arquivo
3. **Iniciar Fase 2** com implementação dos Zustand stores
4. **Testar continuamente** com `npm run dev` e `npm run build`
5. **Manter este arquivo atualizado** conforme progresso

**Última atualização**: Fase 1 concluída com sucesso ✅