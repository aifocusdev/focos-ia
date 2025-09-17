# Endpoints de Contatos

## Listagem de Contatos

### GET /contacts
Retorna uma lista paginada de contatos com filtros opcionais.

**Parâmetros de Query:**
- `page` (number, opcional): Número da página (padrão: 1)
- `limit` (number, opcional): Quantidade de itens por página (padrão: 10)
- `search` (string, opcional): Busca unificada por nome, telefone ou username dos contact-user-accounts (busca parcial, case-insensitive)
- `external_id` (string, opcional): Filtrar por ID externo (busca parcial, case-insensitive)
- `tag_ids` (number[], opcional): Filtrar por IDs de tags
- `include_tags` (boolean, opcional): Incluir tags do contato na resposta
- `date_exp_from` (string ISO date, opcional): Filtrar contatos com accounts que expiram a partir desta data
- `date_exp_to` (string ISO date, opcional): Filtrar contatos com accounts que expiram até esta data

**Exemplo de Request:**
```
GET /contacts?page=1&limit=20&search=João&include_tags=true
GET /contacts?search=joao.silva (busca por username)
GET /contacts?search=11999999999 (busca por telefone)
GET /contacts?date_exp_from=2024-01-01&date_exp_to=2024-12-31 (contatos com accounts expirando em 2024)
GET /contacts?date_exp_from=2024-12-01 (contatos com accounts expirando a partir de dezembro de 2024)
GET /contacts?date_exp_to=2024-06-30 (contatos com accounts expirando até junho de 2024)
```

**Resposta:**
```json
{
  "data": [
    {
      "id": 1,
      "external_id": "ext_123",
      "name": "João Silva",
      "phone_number": "+5511999999999",
      "notes": "Cliente VIP",
      "accepts_remarketing": true,
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-01T10:00:00Z",
      "tags": [
        {
          "id": 1,
          "name": "VIP",
          "color": "#FF0000"
        }
      ]
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

## Perfil do Contato

### GET /contacts/:id
Retorna os detalhes completos de um contato específico.

**Parâmetros:**
- `id` (number): ID do contato

**Resposta:**
```json
{
  "id": 1,
  "external_id": "ext_123",
  "name": "João Silva",
  "phone_number": "+5511999999999",
  "notes": "Cliente VIP com histórico de compras frequentes. Preferência por atendimento via WhatsApp.",
  "accepts_remarketing": true,
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z",
  "tags": [
    {
      "id": 1,
      "name": "VIP",
      "color": "#FF0000",
      "created_at": "2024-01-01T09:00:00Z"
    },
    {
      "id": 2,
      "name": "Ativo",
      "color": "#00FF00",
      "created_at": "2024-01-01T09:00:00Z"
    }
  ]
}
```

## Contact-User-Accounts do Contato

Para obter os contact-user-accounts vinculados a um contato, você precisará usar o endpoint dos contact-user-accounts com filtro por contact_id.

### GET /contact-user-accounts?contact_id=:contact_id
Retorna os accounts vinculados a um contato específico.

**Parâmetros de Query:**
- `contact_id` (number): ID do contato
- `page` (number, opcional): Número da página (padrão: 1)
- `limit` (number, opcional): Quantidade de itens por página (padrão: 10)

**Exemplo de Request:**
```
GET /contact-user-accounts?contact_id=1&page=1&limit=10
```

**Resposta:**
```json
{
  "data": [
    {
      "id": 1,
      "contact_id": 1,
      "username_final": "joao.silva",
      "server_id": 1,
      "id_line_server": 123,
      "date_exp": "2024-12-31T23:59:59Z",
      "application_id": 1,
      "device_id": 1,
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-01T10:00:00Z",
      "server": {
        "id": 1,
        "name": "Servidor Principal",
        "host": "server1.example.com"
      },
      "application": {
        "id": 1,
        "name": "WhatsApp Business"
      },
      "device": {
        "id": 1,
        "name": "iPhone 13"
      }
    }
  ],
  "total": 3,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

## Tags do Contato

### GET /contacts/:id/tags
Retorna apenas as tags de um contato específico.

**Parâmetros:**
- `id` (number): ID do contato

**Resposta:**
```json
[
  {
    "id": 1,
    "name": "VIP",
    "color": "#FF0000",
    "created_at": "2024-01-01T09:00:00Z",
    "updated_at": "2024-01-01T09:00:00Z"
  },
  {
    "id": 2,
    "name": "Ativo",
    "color": "#00FF00",
    "created_at": "2024-01-01T09:00:00Z",
    "updated_at": "2024-01-01T09:00:00Z"
  }
]
```

## Buscar por External ID

### GET /contacts/external-id/:external_id
Busca um contato pelo seu ID externo.

**Parâmetros:**
- `external_id` (string): ID externo do contato

**Resposta:**
```json
{
  "id": 1,
  "external_id": "ext_123",
  "name": "João Silva",
  "phone_number": "+5511999999999",
  "notes": "Cliente VIP",
  "accepts_remarketing": true,
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z"
}
```

## Notas de Implementação

1. **Busca Unificada**: O parâmetro `search` busca simultaneamente em nome, telefone e usernames dos contact-user-accounts vinculados ao contato.

2. **Perfil Completo**: Para montar uma tela de perfil completo, combine:
   - `GET /contacts/:id` (dados básicos + tags)
   - `GET /contact-user-accounts?contact_id=:id` (accounts vinculados)

3. **Autenticação**: Todos os endpoints requerem autenticação e role 'admin' para listagem geral.

4. **Paginação**: Todos os endpoints de listagem suportam paginação com `page` e `limit`.

5. **Filtros**: A busca é case-insensitive e suporta busca parcial em todos os campos.

6. **Filtro por Data de Expiração**: Os parâmetros `date_exp_from` e `date_exp_to` filtram contatos que possuem pelo menos um contact-user-account com data de expiração dentro do intervalo especificado. As datas devem estar no formato ISO (YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ss.sssZ).