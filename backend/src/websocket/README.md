# WebSocket API Documentation

Este documento descreve a API WebSocket do CRM para comunicação em tempo real.

## Conexão

### Endpoint
```
ws://localhost:3000/crm
```

### Autenticação
Todas as conexões WebSocket devem incluir um token JWT válido:

**Opção 1: Headers**
```javascript
const socket = io('/crm', {
  extraHeaders: {
    Authorization: 'Bearer your-jwt-token'
  }
});
```

**Opção 2: Auth Object**
```javascript
const socket = io('/crm', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

## Eventos Disponíveis

### Eventos de Conversa

#### `join:conversation`
Entrar em uma sala de conversa para receber eventos em tempo real.

**Enviar:**
```javascript
socket.emit('join:conversation', { conversationId: 123 });
```

**Resposta:**
```javascript
socket.on('joined_conversation', (data) => {
  console.log('Entrou na conversa:', data.conversationId);
});
```

#### `leave:conversation`
Sair de uma sala de conversa.

**Enviar:**
```javascript
socket.emit('leave:conversation', { conversationId: 123 });
```

### Eventos de Mensagem

#### `message:new`
Recebido quando uma nova mensagem é criada.

```javascript
socket.on('message:new', (data) => {
  console.log('Nova mensagem:', data.message);
  console.log('Timestamp:', data.timestamp);
});
```

#### `message:read`
Recebido quando mensagens são marcadas como lidas.

```javascript
socket.on('message:read', (data) => {
  console.log('Mensagem lida:', data.messageId);
  console.log('Conversa:', data.conversationId);
  console.log('Lida em:', data.readAt);
});
```

### Eventos de Digitação

#### `user:typing`
Indicar que o usuário está digitando.

**Enviar:**
```javascript
socket.emit('user:typing', { conversationId: 123 });
```

**Receber:**
```javascript
socket.on('user:typing', (data) => {
  console.log(`Usuário ${data.userId} está digitando na conversa ${data.conversationId}`);
});
```

#### `user:stop_typing`
Parar de indicar digitação.

**Enviar:**
```javascript
socket.emit('user:stop_typing', { conversationId: 123 });
```

**Receber:**
```javascript
socket.on('user:stop_typing', (data) => {
  console.log(`Usuário ${data.userId} parou de digitar na conversa ${data.conversationId}`);
});
```

### Eventos de Status de Conversa

#### `conversation:assigned`
Recebido quando uma conversa é atribuída ou desatribuída.

```javascript
socket.on('conversation:assigned', (data) => {
  console.log('Conversa atribuída:', data.conversationId);
  console.log('Usuário:', data.assignedUser);
  console.log('Bot:', data.assignedBot);
});
```

#### `conversation:status_changed`
Recebido quando o status de uma conversa muda.

```javascript
socket.on('conversation:status_changed', (data) => {
  console.log('Status da conversa mudou:', data.conversationId);
  console.log('De:', data.previousStatus);
  console.log('Para:', data.newStatus);
});
```

### Eventos de Presença de Usuário

#### `user:set_status`
Definir seu status de presença.

**Enviar:**
```javascript
socket.emit('user:set_status', { 
  status: 'online' // 'online', 'away', 'busy', 'offline'
});
```

#### `user:online` / `user:offline`
Recebido quando usuários ficam online ou offline.

```javascript
socket.on('user:online', (data) => {
  console.log(`Usuário ${data.userId} ficou online`);
});

socket.on('user:offline', (data) => {
  console.log(`Usuário ${data.userId} ficou offline`);
});
```

#### `user:get_presence`
Obter informações de presença dos usuários.

**Enviar:**
```javascript
socket.emit('user:get_presence', { 
  conversationId: 123 // opcional
});
```

**Receber:**
```javascript
socket.on('user:presence_data', (data) => {
  console.log('Usuários online:', data.users);
});
```

### Eventos de Notificação

#### `notification`
Recebido quando há uma nova notificação.

```javascript
socket.on('notification', (notification) => {
  console.log('Nova notificação:', notification.title);
  console.log('Conteúdo:', notification.body);
  console.log('Tipo:', notification.type);
  console.log('Dados:', notification.data);
});
```

#### `offline_notifications_summary`
Recebido ao conectar com notificações perdidas.

```javascript
socket.on('offline_notifications_summary', (data) => {
  console.log(`Você tem ${data.count} notificações perdidas`);
  data.notifications.forEach(notification => {
    console.log('Notificação perdida:', notification.title);
  });
});
```

## Exemplo Completo de Uso

```javascript
import { io } from 'socket.io-client';

// Conectar com autenticação
const socket = io('/crm', {
  auth: {
    token: localStorage.getItem('jwt_token')
  }
});

// Eventos de conexão
socket.on('connect', () => {
  console.log('Conectado ao WebSocket');
  
  // Entrar na conversa ativa
  const currentConversationId = 123;
  socket.emit('join:conversation', { conversationId: currentConversationId });
  
  // Obter presença dos usuários
  socket.emit('user:get_presence');
});

socket.on('disconnect', () => {
  console.log('Desconectado do WebSocket');
});

// Eventos de mensagem
socket.on('message:new', (data) => {
  // Adicionar mensagem à UI
  addMessageToUI(data.message);
  
  // Marcar como lida se necessário
  markMessageAsRead(data.message.id);
});

// Eventos de digitação
let typingTimer;
const messageInput = document.getElementById('messageInput');

messageInput.addEventListener('input', () => {
  // Enviar evento de digitação
  socket.emit('user:typing', { conversationId: currentConversationId });
  
  // Parar de digitar após 3 segundos de inatividade
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    socket.emit('user:stop_typing', { conversationId: currentConversationId });
  }, 3000);
});

// Receber eventos de digitação
socket.on('user:typing', (data) => {
  showTypingIndicator(data.userId, data.conversationId);
});

socket.on('user:stop_typing', (data) => {
  hideTypingIndicator(data.userId, data.conversationId);
});

// Eventos de presença
socket.on('user:presence_data', (data) => {
  updateUserPresenceUI(data.users);
});

// Notificações
socket.on('notification', (notification) => {
  showNotification(notification.title, notification.body);
});

// Tratamento de erros
socket.on('connect_error', (error) => {
  console.error('Erro de conexão:', error);
  
  if (error.message === 'Unauthorized') {
    // Redirecionar para login
    window.location.href = '/login';
  }
});
```

## Rate Limiting

- Máximo de 30 requisições por minuto por usuário
- Timeouts automáticos para digitação após 3 segundos
- Cleanup automático de estados obsoletos

## Segurança

- Autenticação JWT obrigatória
- Validação de permissões por conversa
- Rate limiting por usuário
- Logs de auditoria para eventos críticos

## Estados de Usuário

- `online`: Usuário ativo e disponível
- `away`: Usuário ausente (inativo por mais de 5 minutos)  
- `busy`: Usuário ocupado (não recebe notificações)
- `offline`: Usuário desconectado

## Troubleshooting

### Erro: "Unauthorized"
- Verifique se o token JWT é válido
- Certifique-se de que o token não expirou
- Confirme se o usuário existe no sistema

### Erro: "Access denied to this conversation"
- Usuário não tem permissão para acessar a conversa
- Apenas usuários atribuídos, admins ou supervisores podem acessar

### Erro: "Too many requests"
- Rate limiting ativo - aguarde antes de enviar mais requisições
- Máximo de 30 requisições por minuto por usuário