# Filtros e Parâmetros - Listagem de Conversas

## Endpoint
```
GET /conversations
```

Este endpoint lista conversas com suporte a filtros avançados, paginação e ordenação.

---

## Query Parameters Disponíveis

| Parâmetro | Tipo | Obrigatório | Valor Padrão | Validação | Descrição |
|-----------|------|-------------|--------------|-----------|-----------|
| `contact_id` | `number` | Não | - | Inteiro positivo | Filtra conversas de um contato específico |
| `assigned_bot` | `boolean` | Não | - | `true` / `false` | Mostra conversas com bots atribuídos |
| `unassignment` | `boolean` | Não | - | `true` / `false` | Mostra apenas conversas não atribuídas |
| `unread` | `boolean` | Não | - | `true` / `false` | Filtra por status de leitura |
| `tag_ids` | `number[]` | Não | - | Array de inteiros | Filtra por tags dos contatos |
| `search` | `string` | Não | - | String | Busca textual em dados do contato |
| `page` | `number` | Não | `1` | Mínimo: 1 | Página atual da paginação |
| `limit` | `number` | Não | `10` | Min: 1, Max: 2000 | Itens por página |
| `sortBy` | `string` | Não | `last_activity_at` | Ver opções abaixo | Campo para ordenação |
| `sortOrder` | `string` | Não | `desc` | `asc` / `desc` | Direção da ordenação |

### Opções para `sortBy`:
- `id` - ID da conversa
- `created_at` - Data de criação
- `updated_at` - Data de atualização
- `last_activity_at` - Data da última atividade


---

## Detalhes dos Filtros

### 1. `contact_id`
- **Formato**: `?contact_id=123`
- **Uso**: Exibe conversas de um contato específico
- **Exemplo**: `GET /conversations?contact_id=456`

### 2. `assigned_bot`
- **Formato**: `?assigned_bot=true`
- **Uso**: Mostra conversas que têm bots atribuídos
- **Comportamento**: Inclui conversas com bot (mesmo que também tenham usuário)
- **Exemplo**: `GET /conversations?assigned_bot=true`

### 3. `unassignment`
- **Formato**: `?unassignment=true`
- **Uso**: Mostra apenas conversas não atribuídas (sem usuário E sem bot)
- **Prioridade**: Sobrescreve outros filtros de atribuição
- **Exemplo**: `GET /conversations?unassignment=true`

### 4. `unread`
- **Formato**: `?unread=true` ou `?unread=false`
- **Uso**: 
  - `true` = apenas conversas não lidas
  - `false` = apenas conversas lidas
- **Exemplo**: `GET /conversations?unread=true`

### 5. `tag_ids`
- **Formato**: `?tag_ids[]=1&tag_ids[]=2&tag_ids[]=3`
- **Uso**: Filtra conversas cujos contatos têm as tags especificadas
- **Comportamento**: Busca contatos que possuem qualquer uma das tags
- **Exemplo**: `GET /conversations?tag_ids[]=5&tag_ids[]=10`

### 6. `search`
- **Formato**: `?search=texto`
- **Uso**: Busca textual (case-insensitive) nos seguintes campos:
  - Nome do contato
  - Número de telefone do contato
  - Notas do contato
  - Username das contas de usuário do contato
- **Exemplo**: `GET /conversations?search=joão`

### 7. `page` e `limit`
- **Formato**: `?page=2&limit=50`
- **Uso**: Controle de paginação
- **Limite máximo**: 2000 itens por página
- **Exemplo**: `GET /conversations?page=3&limit=25`

### 8. `sortBy` e `sortOrder`
- **Formato**: `?sortBy=created_at&sortOrder=asc`
- **Uso**: Ordenação dos resultados
- **Padrão**: Ordenado por última atividade (mais recente primeiro)
- **Exemplo**: `GET /conversations?sortBy=created_at&sortOrder=desc`

---

## Exemplos Práticos de URLs

### Filtros Básicos
```bash
# Conversas não lidas
GET /conversations?unread=true

# Conversas de um contato específico
GET /conversations?contact_id=123

# Conversas não atribuídas
GET /conversations?unassignment=true

# Conversas com bots
GET /conversations?assigned_bot=true
```

### Paginação e Ordenação
```bash
# Segunda página com 50 itens
GET /conversations?page=2&limit=50

# Ordenar por data de criação (mais antigas primeiro)
GET /conversations?sortBy=created_at&sortOrder=asc

# Ordenar por última atividade (mais recentes primeiro)
GET /conversations?sortBy=last_activity_at&sortOrder=desc
```

### Busca e Filtros por Tags
```bash
# Buscar por nome/telefone
GET /conversations?search=maria

# Filtrar por múltiplas tags
GET /conversations?tag_ids[]=1&tag_ids[]=5&tag_ids[]=10

# Busca + filtro de tags
GET /conversations?search=vip&tag_ids[]=2
```

### Combinações Complexas
```bash
# Conversas não lidas + busca + paginação
GET /conversations?unread=true&search=whatsapp&page=1&limit=100

# Conversas não atribuídas + ordenação + paginação
GET /conversations?unassignment=true&sortBy=created_at&sortOrder=desc&limit=200

# Contato específico + não lidas + ordenação
GET /conversations?contact_id=456&unread=true&sortBy=last_activity_at&sortOrder=desc

# Filtro completo: tags + busca + não lidas + paginação
GET /conversations?tag_ids[]=3&search=cliente&unread=true&page=2&limit=25
```

---

## Regras de Comportamento

### Prioridade dos Filtros de Atribuição
1. **`unassignment=true`**: Mostra APENAS conversas não atribuídas (ignora outros filtros de atribuição)
2. **`assigned_bot=true`**: Mostra conversas com bots + conversas do usuário atual
3. **Padrão**: Mostra apenas conversas atribuídas ao usuário atual

### Filtros que se Combinam
- `search` + `tag_ids`: Busca textual E contatos com as tags
- `unread` + outros filtros: Status de leitura E outros critérios
- `contact_id` + outros: Sempre limita a um contato específico

### Limitações
- **Máximo 2000 itens por página**: `limit` não pode exceder 2000
- **Tags como OR**: `tag_ids` busca contatos que têm qualquer uma das tags (não todas)
- **Busca parcial**: `search` funciona com correspondência parcial (LIKE)

### Casos Especiais
- Se `contact_id` for especificado, outros filtros de atribuição são ignorados
- `unassignment=true` sobrescreve `assigned_bot` se ambos estiverem presentes
- Parâmetros inválidos são ignorados silenciosamente

---

## Dicas de Uso

### Performance
- Use `limit` menor para melhor performance em listas grandes
- `sortBy=id` é mais rápido que outras ordenações
- Evite `search` muito genérico em bases grandes

### UX Recomendada
- Padrão: `limit=20` para interfaces web
- Mobile: `limit=10` para carregamento mais rápido
- Admin: `limit=100` para visualizações completas

### Filtros Úteis por Contexto
- **Atendente**: `unread=true&limit=50` (conversas pendentes)
- **Supervisor**: `unassignment=true` (conversas não atribuídas)
- **Busca de cliente**: `search=nome_ou_telefone`
- **Relatórios**: `assigned_bot=true&sortBy=created_at`