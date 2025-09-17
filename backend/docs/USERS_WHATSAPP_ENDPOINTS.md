# Endpoints - Usuários e WhatsApp Integration Config

Esta documentação cobre os endpoints para gerenciamento de usuários e configurações de integração WhatsApp.

---

## 1. Endpoints de Usuários

⚠️ **Todos os endpoints de usuários são restritos a administradores**

### 1.1 Criar Usuário

**POST /users**

Cria um novo usuário no sistema.

**Acesso:** Admin apenas

**Request Body:**
```json
{
  "name": "João Silva",
  "username": "joao.silva",
  "password": "senha123456",
  "role_id": 2
}
```

**Validações:**
- `name`: Obrigatório, string, máximo 100 caracteres
- `username`: Obrigatório, string única, máximo 150 caracteres  
- `password`: Obrigatório, string, mínimo 6 caracteres, máximo 255
- `role_id`: Obrigatório, número positivo (deve existir)

**Response (201):**
```json
{
  "id": 5,
  "name": "João Silva",
  "username": "joao.silva",
  "role_id": 2,
  "online": false,
  "created_at": "2024-01-01T15:00:00.000Z",
  "updated_at": "2024-01-01T15:00:00.000Z"
}
```

### 1.2 Listar Usuários

**GET /users**

Lista todos os usuários com paginação e filtros.

**Acesso:** Admin apenas

**Query Parameters:**
```
?page=1&limit=10&name=João&username=joao&role_id=1&online=true
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

### 1.3 Buscar Usuário por ID

**GET /users/:id**

Retorna os dados de um usuário específico.

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

### 1.4 Atualizar Usuário

**PATCH /users/:id**

Atualiza os dados de um usuário existente.

**Acesso:** Admin apenas

**Request Body:**
```json
{
  "name": "Updated Name",
  "username": "updated_username",
  "password": "new_password123",
  "role_id": 2,
  "online": false
}
```

**Validações:**
- `name`: Opcional, string, máximo 100 caracteres
- `username`: Opcional, string única, máximo 150 caracteres
- `password`: Opcional, string, mínimo 6 caracteres, máximo 255
- `role_id`: Opcional, número positivo (deve existir)
- `online`: Opcional, boolean

**Nota:** Todos os campos são opcionais. Se `password` for fornecido, será automaticamente hasheado.

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

### 1.5 Remover Usuário

**DELETE /users/:id**

Remove um usuário do sistema.

**Acesso:** Admin apenas

**Response (204):** Sem conteúdo

---

## 2. Endpoints de WhatsApp Integration Config

⚠️ **Todos os endpoints de WhatsApp Integration Config são restritos a administradores**

### 2.1 Criar Configuração

**POST /whatsapp-integration-config**

Cadastra uma nova configuração de integração com WhatsApp Business API.

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

### 2.2 Listar Configurações

**GET /whatsapp-integration-config**

Lista todas as configurações de integração com paginação.

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

### 2.3 Buscar Configuração por ID

**GET /whatsapp-integration-config/:id**

Retorna uma configuração específica.

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

### 2.4 Atualizar Configuração

**PATCH /whatsapp-integration-config/:id**

Atualiza uma configuração de integração existente.

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

### 2.5 Remover Configuração

**DELETE /whatsapp-integration-config/:id**

Remove uma configuração de integração.

**Acesso:** Admin apenas

**Response (204):** Sem conteúdo

---

## Códigos de Erro

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

---

## Observações Importantes

### Autenticação
- Todos os endpoints requerem token JWT válido
- Apenas usuários com role 'admin' podem acessar estes endpoints

### Segurança
- Senhas e access_tokens são excluídos das respostas
- Validação rigorosa de dados de entrada
- Usernames devem ser únicos no sistema

### WhatsApp Integration
- Requer Meta Developer Account e Business App
- O access_token deve ter permissões adequadas para WhatsApp Business API
- O phone_number_id deve ser um número verificado na conta Business