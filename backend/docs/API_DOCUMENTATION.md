# API Documentation

## Visão Geral

Esta API oferece funcionalidades para gerenciamento de usuários e configuração de integração com WhatsApp (Meta). O sistema utiliza autenticação JWT e controle de acesso baseado em roles.

## Autenticação

### Base URL
```
http://localhost:3000
```

### JWT Token
Todos os endpoints protegidos requerem o header:
```
Authorization: Bearer <jwt_token>
```

---

## 1. Autenticação e Login

### 1.1 Login
Autentica um usuário no sistema.

**Endpoint:** `POST /auth/login`

**Acesso:** Público (com rate limiting: 5 tentativas por minuto)

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Validações:**
- `username`: Obrigatório, string
- `password`: Obrigatório, string, mínimo 6 caracteres

**Response Success (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "username": "admin",
    "role_id": 1,
    "online": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "role": {
      "id": 1,
      "name": "admin"
    }
  }
}
```

**Response Error (401):**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 1.2 Logout
Finaliza a sessão do usuário.

**Endpoint:** `POST /auth/logout`

**Acesso:** Usuários autenticados

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

---

## 2. Gerenciamento de Usuários

⚠️ **Todos os endpoints de usuários são restritos a usuários com role 'admin'**

### 2.1 Listar Usuários
Lista todos os usuários com paginação e filtros.

**Endpoint:** `GET /users`

**Acesso:** Admin apenas

**Query Parameters:**
```
?page=1&limit=10&name=John&username=john&role_id=1&online=true
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Admin User",
      "username": "admin",
      "role_id": 1,
      "online": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

### 2.2 Buscar Usuário por ID
Retorna os dados de um usuário específico.

**Endpoint:** `GET /users/:id`

**Acesso:** Admin apenas

**Query Parameters:**
- `includeRole=true` (opcional): Inclui dados do role do usuário

**Response (200):**
```json
{
  "id": 1,
  "name": "Admin User",
  "username": "admin",
  "role_id": 1,
  "online": true,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z",
  "role": {
    "id": 1,
    "name": "admin"
  }
}
```

### 2.3 Atualizar Usuário
Atualiza os dados de um usuário existente.

**Endpoint:** `PATCH /users/:id`

**Acesso:** Admin apenas

**Request Body:**
```json
{
  "name": "Updated Name",
  "username": "updated_username",
  "password": "new_password",
  "role_id": 2,
  "online": false
}
```

**Validações:**
- `name`: String, máximo 100 caracteres
- `username`: String única, máximo 150 caracteres
- `password`: String, mínimo 6 caracteres, máximo 255
- `role_id`: Número positivo
- `online`: Boolean

**Response (200):**
```json
{
  "id": 1,
  "name": "Updated Name",
  "username": "updated_username",
  "role_id": 2,
  "online": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T12:00:00.000Z"
}
```

### 2.4 Remover Usuário
Remove um usuário do sistema.

**Endpoint:** `DELETE /users/:id`

**Acesso:** Admin apenas

**Response (204):** Sem conteúdo

---

## 3. Configuração de Integração WhatsApp

⚠️ **Todos os endpoints de WhatsApp Integration Config são restritos a usuários com role 'admin'**

### 3.1 Criar Configuração
Cadastra uma nova configuração de integração com WhatsApp Business API.

**Endpoint:** `POST /whatsapp-integration-config`

**Acesso:** Admin apenas

**Request Body:**
```json
{
  "access_token": "EAABxxxxxxxxxxxxxxxx",
  "phone_number_id": "1234567890123456",
  "business_account_id": "1234567890123456",
  "api_version": "v16.0"
}
```

**Validações:**
- `access_token`: Obrigatório, string (token de acesso da Meta)
- `phone_number_id`: Obrigatório, string, máximo 50 caracteres
- `business_account_id`: Opcional, string, máximo 50 caracteres
- `api_version`: Opcional, string, máximo 10 caracteres, padrão "v16.0"

**Response (201):**
```json
{
  "id": 1,
  "phone_number_id": "1234567890123456",
  "business_account_id": "1234567890123456",
  "api_version": "v16.0",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

**Nota:** O `access_token` é excluído das respostas por motivos de segurança.

### 3.2 Listar Configurações
Lista todas as configurações de integração com paginação.

**Endpoint:** `GET /whatsapp-integration-config`

**Acesso:** Admin apenas

**Query Parameters:**
```
?page=1&limit=10&phone_number_id=123&api_version=v16.0
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "phone_number_id": "1234567890123456",
      "business_account_id": "1234567890123456",
      "api_version": "v16.0",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

### 3.3 Buscar Configuração por ID
Retorna uma configuração específica.

**Endpoint:** `GET /whatsapp-integration-config/:id`

**Acesso:** Admin apenas

**Response (200):**
```json
{
  "id": 1,
  "phone_number_id": "1234567890123456",
  "business_account_id": "1234567890123456",
  "api_version": "v16.0",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### 3.4 Atualizar Configuração
Atualiza uma configuração de integração existente.

**Endpoint:** `PATCH /whatsapp-integration-config/:id`

**Acesso:** Admin apenas

**Request Body:**
```json
{
  "access_token": "EAABxxxxxxxxxxxxxxxx",
  "phone_number_id": "0987654321098765",
  "business_account_id": "0987654321098765",
  "api_version": "v17.0"
}
```

**Response (200):**
```json
{
  "id": 1,
  "phone_number_id": "0987654321098765",
  "business_account_id": "0987654321098765",
  "api_version": "v17.0",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T12:00:00.000Z"
}
```

### 3.5 Remover Configuração
Remove uma configuração de integração.

**Endpoint:** `DELETE /whatsapp-integration-config/:id`

**Acesso:** Admin apenas

**Response (204):** Sem conteúdo

---

## 4. Gerenciamento de Conversas

### 4.1 Listar Conversas
Lista conversas com filtros avançados e paginação. O sistema aplica automaticamente regras de privacidade baseadas no usuário autenticado.

**Endpoint:** `GET /conversations`

**Acesso:** Usuários autenticados

#### Query Parameters

| Parâmetro | Tipo | Descrição | Valor Padrão | Validação |
|-----------|------|-----------|--------------|-----------|
| `contact_id` | `number` | Filtrar por ID do contato específico | - | Inteiro positivo |
| `assigned_bot` | `boolean` | Mostrar conversas com bots atribuídos | - | `true`/`false` |
| `unassignment` | `boolean` | Mostrar apenas conversas não atribuídas (sem usuário e sem bot) | - | `true`/`false` |
| `unread` | `boolean` | Filtrar por status de leitura (`true` = não lidas, `false` = lidas) | - | `true`/`false` |
| `tag_ids` | `number[]` | Array de IDs de tags dos contatos | - | Array de inteiros |
| `search` | `string` | Busca textual em nome, telefone, notas do contato e username | - | String |
| `page` | `number` | Página atual para paginação | `1` | Mín: 1 |
| `limit` | `number` | Limite de itens por página | `10` | Mín: 1, Máx: 2000 |
| `sortBy` | `string` | Campo para ordenação | `last_activity_at` | `id`, `created_at`, `updated_at`, `last_activity_at` |
| `sortOrder` | `string` | Direção da ordenação | `desc` | `asc`, `desc` |

#### Lógica de Privacidade e Filtros

O sistema aplica automaticamente filtros de privacidade baseados no usuário autenticado:

1. **Comportamento Padrão**: Mostra apenas conversas atribuídas ao usuário atual
2. **Filtro `unassignment=true`**: Mostra conversas não atribuídas (sem usuário e sem bot)
3. **Filtro `assigned_bot=true`**: Mostra conversas com bots (pode estar atribuída ao usuário ou não)

**Prioridade dos Filtros:**
- Se `unassignment=true`: Ignora atribuições, mostra apenas não atribuídas
- Se `assigned_bot=true`: Mostra conversas com bot + conversas do usuário atual
- Caso contrário: Mostra apenas conversas do usuário atual

#### Funcionalidade de Busca

O parâmetro `search` realiza busca textual (case-insensitive) nos seguintes campos:
- Nome do contato (`contact.name`)
- Número de telefone (`contact.phone_number`)
- Notas do contato (`contact.notes`)
- Username final das contas de usuário do contato (`contactUserAccount.username_final`)

#### Exemplos de Uso

**Listar conversas atribuídas ao usuário atual:**
```
GET /conversations?page=1&limit=20
```

**Buscar conversas não atribuídas:**
```
GET /conversations?unassignment=true&page=1&limit=50
```

**Buscar conversas com bots:**
```
GET /conversations?assigned_bot=true&sortBy=created_at&sortOrder=asc
```

**Filtrar por contato específico:**
```
GET /conversations?contact_id=123&page=1&limit=10
```

**Buscar conversas não lidas:**
```
GET /conversations?unread=true&sortBy=last_activity_at&sortOrder=desc
```

**Filtrar por tags dos contatos:**
```
GET /conversations?tag_ids[]=1&tag_ids[]=5&tag_ids[]=10
```

**Busca textual:**
```
GET /conversations?search=joão&page=1&limit=25
```

**Combinação de filtros:**
```
GET /conversations?unread=true&search=whatsapp&tag_ids[]=2&limit=100
```

#### Response (200)

```json
{
  "data": [
    {
      "id": 1,
      "contact_id": 123,
      "integration_id": 1,
      "assigned_user": 456,
      "assigned_bot": null,
      "unread_count": 3,
      "read": false,
      "created_at": "2024-01-01T10:00:00.000Z",
      "updated_at": "2024-01-01T15:30:00.000Z",
      "last_activity_at": "2024-01-01T15:30:00.000Z",
      "last_contact_message_at": "2024-01-01T15:25:00.000Z",
      "contact": {
        "id": 123,
        "name": "João Silva",
        "phone_number": "+5511999887766",
        "notes": "Cliente VIP"
      },
      "integration": {
        "id": 1,
        "phone_number_id": "1234567890123456",
        "api_version": "v16.0"
      },
      "user": {
        "id": 456,
        "name": "Atendente Maria",
        "username": "maria"
      },
      "bot": null,
      "last_message": {
        "id": 789,
        "content": "Olá, preciso de ajuda!",
        "message_type": "text",
        "direction": "incoming",
        "timestamp": "2024-01-01T15:25:00.000Z",
        "sender_name": "João Silva"
      }
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

#### Estrutura dos Dados

**Conversa (`Conversation`):**
- `id`: ID único da conversa
- `contact_id`: ID do contato relacionado
- `integration_id`: ID da configuração de integração WhatsApp
- `assigned_user`: ID do usuário atribuído (pode ser `null`)
- `assigned_bot`: ID do bot atribuído (pode ser `null`)
- `unread_count`: Contador de mensagens não lidas
- `read`: Status de leitura da conversa
- `created_at`: Data de criação
- `updated_at`: Data da última atualização
- `last_activity_at`: Data da última atividade
- `last_contact_message_at`: Data da última mensagem do contato

**Relacionamentos incluídos:**
- `contact`: Dados do contato (nome, telefone, notas)
- `integration`: Configuração da integração WhatsApp
- `user`: Usuário atribuído (se houver)
- `bot`: Bot atribuído (se houver)
- `last_message`: Última mensagem da conversa (propriedade virtual)

### 4.2 Buscar Conversa por ID
Retorna uma conversa específica com todos os relacionamentos.

**Endpoint:** `GET /conversations/:id`

**Acesso:** Usuários autenticados

**Response (200):**
```json
{
  "id": 1,
  "contact_id": 123,
  "integration_id": 1,
  "assigned_user": 456,
  "assigned_bot": null,
  "unread_count": 3,
  "read": false,
  "created_at": "2024-01-01T10:00:00.000Z",
  "updated_at": "2024-01-01T15:30:00.000Z",
  "last_activity_at": "2024-01-01T15:30:00.000Z",
  "last_contact_message_at": "2024-01-01T15:25:00.000Z",
  "contact": { ... },
  "integration": { ... },
  "user": { ... },
  "bot": null
}
```

### 4.3 Atribuir Conversa
Atribui uma conversa a um usuário específico.

**Endpoint:** `PATCH /conversations/:id/assign`

**Acesso:** Usuários autenticados

**Request Body:**
```json
{
  "user_id": 456
}
```

### 4.4 Desatribuir Conversa
Remove a atribuição de uma conversa.

**Endpoint:** `PATCH /conversations/:id/unassign`

**Acesso:** Usuários autenticados

### 4.5 Marcar como Lida
Marca uma conversa como lida pelo usuário atual.

**Endpoint:** `PATCH /conversations/:id/read`

**Acesso:** Usuários autenticados

### 4.6 Marcar como Não Lida
Marca uma conversa como não lida pelo usuário atual.

**Endpoint:** `PATCH /conversations/:id/unread`

**Acesso:** Usuários autenticados

### 4.7 Executar Auto-atribuição
Executa manualmente o processo de auto-atribuição de conversas.

**Endpoint:** `POST /conversations/auto-assignment/execute`

**Acesso:** Usuários autenticados

**Response (200):**
```json
{
  "processed": 15,
  "errors": 2
}
```

---

## Códigos de Erro Comuns

### 400 - Bad Request
```json
{
  "statusCode": 400,
  "message": ["campo é obrigatório", "formato inválido"],
  "error": "Bad Request"
}
```

### 401 - Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 - Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

### 404 - Not Found
```json
{
  "statusCode": 404,
  "message": "Recurso não encontrado"
}
```

### 409 - Conflict
```json
{
  "statusCode": 409,
  "message": "Username já existe"
}
```

### 429 - Too Many Requests
```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

---

## Notas Importantes

### Segurança
- Todos os endpoints protegidos requerem JWT válido
- Senhas e tokens são excluídos das respostas da API
- Rate limiting aplicado no endpoint de login (5 tentativas/minuto)
- Validação rigorosa de dados de entrada

### Roles e Permissões
- **Admin**: Acesso total a todos os endpoints
- **Usuários comuns**: Acesso limitado (definir conforme necessidade)

### Cadastro de Usuários
- ⚠️ **Não existe endpoint público de registro**
- Apenas administradores podem criar novos usuários via API
- Para criar o primeiro admin, usar seeds ou migrations do banco

### Integração WhatsApp
- Requires Meta Developer Account e Business App
- O `access_token` deve ter permissões adequadas para WhatsApp Business API
- O `phone_number_id` deve ser um número verificado na conta Business

### Estrutura do Banco
- **users**: Tabela principal de usuários
- **roles**: Tabela de roles/permissões
- **whatsapp_integration_config**: Configurações de integração WhatsApp