# Meta WhatsApp Integration - WebSocket Events

## Eventos WebSocket Disponíveis

### 1. Mensagens Recebidas
**Evento:** `whatsapp:message`
```json
{
  "conversationId": 123,
  "message": {
    "id": 456,
    "body": "Olá!",
    "sender_type": "contact",
    "delivered_at": "2024-01-01T10:00:00Z"
  },
  "contact": {
    "id": 789,
    "name": "João Silva",
    "phone_number": "5511999999999"
  }
}
```

### 2. Mensagens Enviadas
**Evento:** `whatsapp:message_sent`
```json
{
  "messageId": 456,
  "conversationId": 123,
  "message": {
    "id": 456,
    "body": "Resposta automática",
    "sender_type": "user",
    "delivered_at": "2024-01-01T10:01:00Z"
  },
  "type": "sent",
  "platform": "whatsapp"
}
```

### 3. Status de Mensagem
**Evento:** `whatsapp:message_status`
```json
{
  "messageId": 456,
  "status": "read",
  "timestamp": "1641024060"
}
```

## Rooms Específicos

### Room de Conversa
**Room:** `conversation:{conversationId}`
- Recebe eventos específicos da conversa

### Room de Mensagem
**Room:** `message:{messageId}`
- Recebe atualizações de status da mensagem

## Exemplo de Cliente WebSocket

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000/crm', {
  auth: {
    token: 'seu-jwt-token'
  }
});

// Escutar mensagens recebidas
socket.on('whatsapp:message', (data) => {
  console.log('Nova mensagem recebida:', data);
});

// Escutar mensagens enviadas
socket.on('whatsapp:message_sent', (data) => {
  console.log('Mensagem enviada:', data);
});

// Escutar status de mensagem
socket.on('whatsapp:message_status', (data) => {
  console.log('Status da mensagem:', data);
});

// Entrar em room específico de conversa
socket.emit('join_conversation', { conversationId: 123 });
```

## Configuração Necessária

Certifique-se de que as seguintes variáveis de ambiente estão configuradas:

```env
WHATSAPP_ACCESS_TOKEN=seu_token_meta
WHATSAPP_PHONE_NUMBER_ID=seu_phone_number_id
WHATSAPP_VERIFY_TOKEN=seu_verify_token
WHATSAPP_BUSINESS_ACCOUNT_ID=seu_business_account_id
```

## Endpoints

- **GET** `/meta-whatsapp/webhook` - Verificação do webhook
- **POST** `/meta-whatsapp/webhook` - Recebimento de eventos do Meta