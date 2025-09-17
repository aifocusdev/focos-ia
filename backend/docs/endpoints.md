# API Endpoints Documentation

Esta documentação descreve como usar os endpoints disponíveis na API.

## Base URL
```
http://localhost:3000
```

## Formato de Resposta Padrão

### Paginação
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

### Entidade Única
```json
{
  "id": 1,
  "name": "Nome",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

---

## 🖥️ Servers

### GET /servers
Lista todos os servidores com paginação e filtro de busca.

**Query Parameters:**
- `search` (optional): Busca servidores por nome (busca parcial, case-insensitive)
- `page` (optional): Número da página (default: 1)
- `limit` (optional): Itens por página (default: 10, máximo: 100)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Server Principal",
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

**Exemplos de Uso:**
```bash
# Listar todos os servidores
GET /servers

# Buscar servidores que contenham "principal" no nome
GET /servers?search=principal

# Buscar servidores com "prod" e paginação
GET /servers?search=prod&page=1&limit=20
```

### GET /servers/:id
Busca um servidor específico por ID.

**Parameters:**
- `id`: ID do servidor

**Response:**
```json
{
  "id": 1,
  "name": "Server Principal",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### POST /servers
Cria um novo servidor.

**Body:**
```json
{
  "name": "Novo Servidor"
}
```

**Validações:**
- `name`: String obrigatória, máximo 100 caracteres, deve ser única

**Response:**
```json
{
  "id": 2,
  "name": "Novo Servidor",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### PATCH /servers/:id
Atualiza um servidor existente.

**Parameters:**
- `id`: ID do servidor

**Body:**
```json
{
  "name": "Nome Atualizado"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Nome Atualizado",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T12:00:00.000Z"
}
```

### DELETE /servers/:id
Remove um servidor.

**Parameters:**
- `id`: ID do servidor

**Response:** Status 200 (sem conteúdo)

---

## 🏷️ Tags

### GET /tags
Lista todas as tags com paginação e filtro de busca.

**Query Parameters:**
- `search` (optional): Busca tags por nome (busca parcial, case-insensitive)
- `page` (optional): Número da página (default: 1)
- `limit` (optional): Itens por página (default: 10, máximo: 100)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "VIP",
      "color": "#FF0000",
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

**Exemplos de Uso:**
```bash
# Listar todas as tags
GET /tags

# Buscar tags que contenham "VIP" no nome
GET /tags?search=VIP

# Buscar tags com "premium" e paginação
GET /tags?search=premium&page=1&limit=20

# Buscar tags que contenham "client" (case-insensitive)
GET /tags?search=client
```

### GET /tags/:id
Busca uma tag específica por ID.

**Parameters:**
- `id`: ID da tag

**Response:**
```json
{
  "id": 1,
  "name": "VIP",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### POST /tags
Cria uma nova tag.

**Body:**
```json
{
  "name": "Premium"
}
```

**Validações:**
- `name`: String obrigatória, máximo 100 caracteres, deve ser única

**Response:**
```json
{
  "id": 2,
  "name": "Premium",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### PATCH /tags/:id
Atualiza uma tag existente.

**Parameters:**
- `id`: ID da tag

**Body:**
```json
{
  "name": "Premium Atualizado"
}
```

**Response:**
```json
{
  "id": 2,
  "name": "Premium Atualizado",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T12:00:00.000Z"
}
```

### DELETE /tags/:id
Remove uma tag.

**Parameters:**
- `id`: ID da tag

**Response:** Status 200 (sem conteúdo)

---

## 📱 Devices

### GET /devices
Lista todos os dispositivos com paginação e filtro de busca.

**Query Parameters:**
- `search` (optional): Busca dispositivos por nome (busca parcial, case-insensitive)
- `page` (optional): Número da página (default: 1)
- `limit` (optional): Itens por página (default: 10, máximo: 100)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "iPhone 15",
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

**Exemplos de Uso:**
```bash
# Listar todos os dispositivos
GET /devices

# Buscar dispositivos que contenham "iphone" no nome
GET /devices?search=iphone

# Buscar dispositivos com "samsung" e paginação
GET /devices?search=samsung&page=1&limit=20
```

### GET /devices/:id
Busca um dispositivo específico por ID.

**Parameters:**
- `id`: ID do dispositivo

**Response:**
```json
{
  "id": 1,
  "name": "iPhone 15",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### POST /devices
Cria um novo dispositivo.

**Body:**
```json
{
  "name": "Samsung Galaxy S24"
}
```

**Validações:**
- `name`: String obrigatória, máximo 100 caracteres, deve ser única

**Response:**
```json
{
  "id": 2,
  "name": "Samsung Galaxy S24",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### PATCH /devices/:id
Atualiza um dispositivo existente.

**Parameters:**
- `id`: ID do dispositivo

**Body:**
```json
{
  "name": "Samsung Galaxy S24 Ultra"
}
```

**Response:**
```json
{
  "id": 2,
  "name": "Samsung Galaxy S24 Ultra",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T12:00:00.000Z"
}
```

### DELETE /devices/:id
Remove um dispositivo.

**Parameters:**
- `id`: ID do dispositivo

**Response:** Status 200 (sem conteúdo)

---

## 📱 Applications

### GET /applications
Lista todas as aplicações com paginação e filtro de busca.

**Query Parameters:**
- `search` (optional): Busca aplicações por nome (busca parcial, case-insensitive)
- `page` (optional): Número da página (default: 1)
- `limit` (optional): Itens por página (default: 10, máximo: 100)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "WhatsApp",
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

**Exemplos de Uso:**
```bash
# Listar todas as aplicações
GET /applications

# Buscar aplicações que contenham "whats" no nome
GET /applications?search=whats

# Buscar aplicações com "telegram" e paginação
GET /applications?search=telegram&page=1&limit=20
```

### GET /applications/:id
Busca uma aplicação específica por ID.

**Parameters:**
- `id`: ID da aplicação

**Response:**
```json
{
  "id": 1,
  "name": "WhatsApp",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### POST /applications
Cria uma nova aplicação.

**Body:**
```json
{
  "name": "Telegram"
}
```

**Validações:**
- `name`: String obrigatória, máximo 100 caracteres, deve ser única

**Response:**
```json
{
  "id": 2,
  "name": "Telegram",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### PATCH /applications/:id
Atualiza uma aplicação existente.

**Parameters:**
- `id`: ID da aplicação

**Body:**
```json
{
  "name": "Telegram Premium"
}
```

**Response:**
```json
{
  "id": 2,
  "name": "Telegram Premium",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T12:00:00.000Z"
}
```

### DELETE /applications/:id
Remove uma aplicação.

**Parameters:**
- `id`: ID da aplicação

**Response:** Status 200 (sem conteúdo)

---

## 👤 Contact User Accounts

### GET /contact-user-accounts
Lista todas as contas de usuário de contatos com paginação.

**Query Parameters:**
- `page` (optional): Número da página (default: 1)
- `limit` (optional): Itens por página (default: 20)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "contact_id": 5,
      "username_final": "user123",
      "server_id": 1,
      "id_line_server": 100,
      "date_exp": "2024-12-31T23:59:59.000Z",
      "application_id": 1,
      "device_id": 1,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

### GET /contact-user-accounts/:id
Busca uma conta específica por ID.

**Parameters:**
- `id`: ID da conta

**Response:**
```json
{
  "id": 1,
  "contact_id": 5,
  "username_final": "user123",
  "server_id": 1,
  "id_line_server": 100,
  "date_exp": "2024-12-31T23:59:59.000Z",
  "application_id": 1,
  "device_id": 1,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### GET /contact-user-accounts/contact/:contactId
Busca todas as contas de um contato específico.

**Parameters:**
- `contactId`: ID do contato

**Response:**
```json
[
  {
    "id": 1,
    "contact_id": 5,
    "username_final": "user123",
    "server_id": 1,
    "id_line_server": 100,
    "date_exp": "2024-12-31T23:59:59.000Z",
    "application_id": 1,
    "device_id": 1,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### POST /contact-user-accounts
Cria uma nova conta de usuário para um contato.

**Body:**
```json
{
  "contact_id": 5,
  "username_final": "newuser456",
  "password_final": "senha123",
  "server_id": 1,
  "id_line_server": 101,
  "date_exp": "2024-12-31T23:59:59.000Z",
  "application_id": 1,
  "device_id": 1
}
```

**Validações:**
- `contact_id`: Número inteiro obrigatório
- `username_final`: String obrigatória, máximo 150 caracteres
- `password_final`: String obrigatória, máximo 255 caracteres
- `server_id`: Número inteiro obrigatório
- `id_line_server`: Número inteiro opcional
- `date_exp`: Data opcional no formato ISO 8601
- `application_id`: Número inteiro opcional
- `device_id`: Número inteiro opcional

**Response:**
```json
{
  "id": 2,
  "contact_id": 5,
  "username_final": "newuser456",
  "server_id": 1,
  "id_line_server": 101,
  "date_exp": "2024-12-31T23:59:59.000Z",
  "application_id": 1,
  "device_id": 1,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### PATCH /contact-user-accounts/:id
Atualiza uma conta existente.

**Parameters:**
- `id`: ID da conta

**Body:** (todos os campos são opcionais)
```json
{
  "username_final": "updated_user",
  "password_final": "nova_senha",
  "server_id": 2,
  "id_line_server": 101,
  "date_exp": "2025-12-31T23:59:59.000Z",
  "application_id": 2,
  "device_id": 2
}
```

**Response:**
```json
{
  "id": 1,
  "contact_id": 5,
  "username_final": "updated_user",
  "server_id": 1,
  "id_line_server": 100,
  "date_exp": "2025-12-31T23:59:59.000Z",
  "application_id": 2,
  "device_id": 2,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T12:00:00.000Z"
}
```

### DELETE /contact-user-accounts/:id
Remove uma conta.

**Parameters:**
- `id`: ID da conta

**Response:** Status 200 (sem conteúdo)

---

## 📇 Contacts

### GET /contacts
Lista todos os contatos com paginação e filtros avançados.

**Query Parameters:**
- `page` (optional): Número da página (default: 1)
- `limit` (optional): Itens por página (default: 10, máximo: 100)
- `name` (optional): Filtra por nome do contato (busca parcial, case-insensitive)
- `external_id` (optional): Filtra por ID externo (busca parcial, case-insensitive)
- `phone_number` (optional): Filtra por número de telefone (busca parcial, case-insensitive)
- `include_tags` (optional): Inclui as tags do contato na resposta (true/false)
- `tag_ids` (optional): Array de IDs de tags para filtrar contatos que possuem essas tags

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "external_id": "5511999999999@c.us",
      "name": "João Silva",
      "phone_number": "5511999999999",
      "notes": "Cliente VIP",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "tags": [
        {
          "id": 1,
          "name": "VIP",
          "color": "#FF0000",
          "created_at": "2024-01-01T00:00:00.000Z",
          "updated_at": "2024-01-01T00:00:00.000Z"
        }
      ]
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

**Exemplos de Uso:**
```bash
# Listar todos os contatos
GET /contacts

# Buscar contatos por nome
GET /contacts?name=João

# Buscar contatos com tags específicas
GET /contacts?tag_ids=1,2&include_tags=true

# Filtros combinados com paginação
GET /contacts?name=Silva&include_tags=true&page=1&limit=20

# Buscar por número de telefone
GET /contacts?phone_number=5511999999999
```

### GET /contacts/:id
Busca um contato específico por ID.

**Parameters:**
- `id`: ID do contato

**Response:**
```json
{
  "id": 1,
  "external_id": "5511999999999@c.us",
  "name": "João Silva",
  "phone_number": "5511999999999",
  "notes": "Cliente VIP",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z",
  "tags": [
    {
      "id": 1,
      "name": "VIP",
      "color": "#FF0000",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /contacts/external-id/:external_id
Busca um contato por ID externo (ex: WhatsApp ID).

**Parameters:**
- `external_id`: ID externo do contato

**Response:**
```json
{
  "id": 1,
  "external_id": "5511999999999@c.us",
  "name": "João Silva",
  "phone_number": "5511999999999",
  "notes": "Cliente VIP",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### PATCH /contacts/:id
Atualiza um contato existente.

**Parameters:**
- `id`: ID do contato

**Body:** (todos os campos são opcionais)
```json
{
  "external_id": "5511888888888@c.us",
  "name": "João Santos Silva",
  "phone_number": "5511888888888",
  "notes": "Cliente Premium VIP"
}
```

**Validações:**
- `external_id`: String única, máximo 50 caracteres
- `name`: String, máximo 150 caracteres
- `phone_number`: String única, máximo 20 caracteres
- `notes`: Texto livre

**Response:**
```json
{
  "id": 1,
  "external_id": "5511888888888@c.us",
  "name": "João Santos Silva",
  "phone_number": "5511888888888",
  "notes": "Cliente Premium VIP",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T12:00:00.000Z"
}
```

### DELETE /contacts/:id
Remove um contato.

**Parameters:**
- `id`: ID do contato

**Response:** Status 204 (sem conteúdo)

---

### 🏷️ Gerenciamento de Tags em Contacts

### POST /contacts/:id/tags
Adiciona tags a um contato específico.

**Parameters:**
- `id`: ID do contato

**Body:**
```json
{
  "tag_ids": [1, 2, 3]
}
```

**Validações:**
- `tag_ids`: Array obrigatório de números inteiros (IDs das tags)
- Tags devem existir no sistema
- Tags duplicadas são ignoradas automaticamente

**Response:**
```json
{
  "id": 1,
  "external_id": "5511999999999@c.us",
  "name": "João Silva",
  "phone_number": "5511999999999",
  "notes": "Cliente VIP",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T12:00:00.000Z",
  "tags": [
    {
      "id": 1,
      "name": "VIP",
      "color": "#FF0000",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Premium",
      "color": "#00FF00",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Exemplos de Uso:**
```bash
# Adicionar uma tag ao contato
POST /contacts/1/tags
{"tag_ids": [1]}

# Adicionar múltiplas tags ao contato
POST /contacts/1/tags
{"tag_ids": [1, 2, 3]}
```

### DELETE /contacts/:id/tags
Remove tags de um contato específico.

**Parameters:**
- `id`: ID do contato

**Body:**
```json
{
  "tag_ids": [1, 3]
}
```

**Validações:**
- `tag_ids`: Array obrigatório de números inteiros (IDs das tags)
- Tags inexistentes no contato são ignoradas

**Response:**
```json
{
  "id": 1,
  "external_id": "5511999999999@c.us",
  "name": "João Silva",
  "phone_number": "5511999999999",
  "notes": "Cliente VIP",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T12:00:00.000Z",
  "tags": [
    {
      "id": 2,
      "name": "Premium",
      "color": "#00FF00",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /contacts/:id/tags
Lista todas as tags de um contato específico.

**Parameters:**
- `id`: ID do contato

**Response:**
```json
[
  {
    "id": 1,
    "name": "VIP",
    "color": "#FF0000",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": 2,
    "name": "Premium",
    "color": "#00FF00",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### GET /contacts/by-tag/:tagId
Lista todos os contatos que possuem uma tag específica.

**Parameters:**
- `tagId`: ID da tag

**Response:**
```json
[
  {
    "id": 1,
    "external_id": "5511999999999@c.us",
    "name": "João Silva",
    "phone_number": "5511999999999",
    "notes": "Cliente VIP",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": 2,
    "external_id": "5511888888888@c.us",
    "name": "Maria Santos",
    "phone_number": "5511888888888",
    "notes": "Cliente Premium",
    "created_at": "2024-01-02T00:00:00.000Z",
    "updated_at": "2024-01-02T00:00:00.000Z"
  }
]
```

**Exemplos de Uso:**
```bash
# Ver tags de um contato
GET /contacts/1/tags

# Remover tags específicas
DELETE /contacts/1/tags
{"tag_ids": [1, 3]}

# Encontrar todos os contatos VIP
GET /contacts/by-tag/1

# Listar contatos com filtro de tags
GET /contacts?tag_ids=1,2&include_tags=true
```

---

## 💬 Conversations

### GET /conversations
Lista todas as conversas com paginação e filtros avançados.

**Query Parameters:**
- `page` (optional): Número da página (default: 1)
- `limit` (optional): Itens por página (default: 10, máximo: 100)
- `sortBy` (optional): Campo para ordenação (default: 'last_activity_at')
  - Valores permitidos: 'id', 'created_at', 'updated_at', 'last_activity_at'
- `sortOrder` (optional): Ordem de classificação (default: 'desc')
  - Valores permitidos: 'asc', 'desc'
- `contact_id` (optional): Filtra por ID do contato específico
- `assigned_bot` (optional): Filtra conversas atribuídas a bots (true/false)
- `unassignment` (optional): Filtra apenas conversas não atribuídas (true/false)
- `unread` (optional): Filtra por status de leitura
  - `true`: Apenas conversas não lidas
  - `false`: Apenas conversas lidas
- `tag_id` (optional): Filtra conversas onde o contato possui a tag específica
- `search` (optional): Busca por nome do contato, telefone ou username

**Regras de Acesso:**
- Por padrão, mostra apenas conversas atribuídas ao usuário atual
- Se `unassignment=true`: mostra conversas não atribuídas
- Se `assigned_bot=true`: mostra conversas com bots

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "contact_id": 5,
      "integration_id": 1,
      "assigned_user": 2,
      "assigned_bot": null,
      "unread_count": 3,
      "read": false,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T12:00:00.000Z",
      "last_activity_at": "2024-01-01T12:00:00.000Z",
      "last_contact_message_at": "2024-01-01T11:45:00.000Z",
      "contact": {
        "id": 5,
        "external_id": "5511999999999@c.us",
        "name": "João Silva",
        "phone_number": "5511999999999",
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z",
        "tags": [
          {
            "id": 1,
            "name": "VIP",
            "color": "#FF0000",
            "created_at": "2024-01-01T00:00:00.000Z",
            "updated_at": "2024-01-01T00:00:00.000Z"
          }
        ]
      },
      "integration": {
        "id": 1,
        "name": "WhatsApp Business",
        "phone_number": "5511888888888",
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      },
      "user": {
        "id": 2,
        "name": "Atendente Maria",
        "email": "maria@empresa.com",
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      },
      "bot": null,
      "last_message": {
        "id": 100,
        "conversation_id": 1,
        "direction": "inbound",
        "message_text": "Olá, preciso de ajuda!",
        "delivered_at": "2024-01-01T12:00:00.000Z",
        "user": null,
        "bot": null,
        "attachments": []
      }
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

**Exemplos de Uso:**
```bash
# Listar todas as conversas do usuário atual
GET /conversations

# Conversas não lidas com paginação
GET /conversations?unread=true&page=1&limit=20

# Conversas de contatos com tag específica
GET /conversations?tag_id=5

# Conversas não atribuídas
GET /conversations?unassignment=true

# Buscar por nome/telefone do contato
GET /conversations?search=João

# Combinar filtros: conversas não lidas de contatos VIP
GET /conversations?unread=true&tag_id=1

# Conversas de um contato específico
GET /conversations?contact_id=5

# Conversas atribuídas a bots
GET /conversations?assigned_bot=true
```

### GET /conversations/:id
Busca uma conversa específica por ID.

**Parameters:**
- `id`: ID da conversa

**Response:**
```json
{
  "id": 1,
  "contact_id": 5,
  "integration_id": 1,
  "assigned_user": 2,
  "assigned_bot": null,
  "unread_count": 3,
  "read": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T12:00:00.000Z",
  "last_activity_at": "2024-01-01T12:00:00.000Z",
  "last_contact_message_at": "2024-01-01T11:45:00.000Z",
  "contact": {
    "id": 5,
    "external_id": "5511999999999@c.us",
    "name": "João Silva",
    "phone_number": "5511999999999"
  },
  "integration": {
    "id": 1,
    "name": "WhatsApp Business"
  },
  "user": {
    "id": 2,
    "name": "Atendente Maria",
    "email": "maria@empresa.com"
  },
  "bot": null
}
```

### PATCH /conversations/:id/assign
Atribui uma conversa a um usuário.

**Parameters:**
- `id`: ID da conversa

**Body:**
```json
{
  "assigned_user": 3
}
```
*Nota: Se `assigned_user` não for fornecido, a conversa será atribuída ao usuário atual.*

**Validações:**
- `assigned_user` (optional): ID do usuário para atribuição
- Conversa não pode já estar atribuída a outro usuário
- Usuário de destino deve existir

**Response:**
```json
{
  "id": 1,
  "assigned_user": 3,
  "assigned_bot": null,
  "unread_count": 0,
  "updated_at": "2024-01-01T13:00:00.000Z"
}
```

**Eventos WebSocket Emitidos:**
- `conversation:assigned`
- `conversation:unread_reset`

### PATCH /conversations/:id/unassign
Remove a atribuição de uma conversa.

**Parameters:**
- `id`: ID da conversa

**Response:**
```json
{
  "id": 1,
  "assigned_user": null,
  "assigned_bot": null,
  "updated_at": "2024-01-01T13:00:00.000Z"
}
```

**Eventos WebSocket Emitidos:**
- `conversation:assigned`

### PATCH /conversations/:id/read
Marca uma conversa como lida.

**Parameters:**
- `id`: ID da conversa

**Body:**
```json
{}
```

**Validações:**
- Usuário deve ter acesso à conversa (próprias conversas, não atribuídas, ou conversas com bots)

**Response:**
```json
{
  "id": 1,
  "read": true,
  "unread_count": 0,
  "updated_at": "2024-01-01T13:00:00.000Z"
}
```

**Eventos WebSocket Emitidos:**
- `conversation:read`

### PATCH /conversations/:id/unread
Marca uma conversa como não lida.

**Parameters:**
- `id`: ID da conversa

**Body:**
```json
{}
```

**Validações:**
- Usuário deve ter acesso à conversa

**Response:**
```json
{
  "id": 1,
  "read": false,
  "unread_count": 5,
  "updated_at": "2024-01-01T13:00:00.000Z"
}
```

**Eventos WebSocket Emitidos:**
- `conversation:unread`

### POST /conversations/auto-assignment/execute
Executa manualmente o processo de auto-atribuição de conversas.

**Body:** Nenhum

**Response:**
```json
{
  "processed": 15,
  "errors": 2
}
```

**Descrição:**
- Processa conversas não atribuídas baseado nas regras de auto-atribuição configuradas
- Retorna quantidade de conversas processadas e erros encontrados

---

## ⚠️ Códigos de Erro Comuns

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": [
    "name should not be empty",
    "name must be a string"
  ],
  "error": "Bad Request"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Entity not found",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Name already exists",
  "error": "Conflict"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## 📝 Notas Importantes

1. **Autenticação**: Alguns endpoints podem requerer autenticação (verifique com a equipe de desenvolvimento)

2. **Rate Limiting**: A API pode ter limites de taxa para prevenir abuso

3. **Validação**: Todos os campos obrigatórios devem ser fornecidos e validados

4. **Relacionamentos**: 
   - Contact User Accounts têm relacionamentos com Contacts, Servers, Applications e Devices
   - Tags têm relacionamentos Many-to-Many com Contacts
   - Contacts podem ter múltiplas tags e tags podem ser associadas a múltiplos contatos
   - Conversations têm relacionamentos com Contacts e podem filtrar por tags do contato

5. **Campos Únicos**:
   - Server.name deve ser único
   - Tag.name deve ser único  
   - Device.name deve ser único
   - Application.name deve ser único
   - Contact.external_id deve ser único
   - Contact.phone_number deve ser único (quando fornecido)

6. **Campos Sensíveis**:
   - `password_final` em Contact User Accounts é excluído da serialização por segurança

7. **Timestamps**: Todos os recursos incluem `created_at` e `updated_at` automaticamente