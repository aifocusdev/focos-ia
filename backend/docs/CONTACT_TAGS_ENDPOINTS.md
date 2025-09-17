# Endpoints de Tags de Contatos

Esta documentação cobre os endpoints para gerenciar tags de contatos no frontend.

---

## 1. Adicionar Tags a um Contato

### POST /contacts/:id/tags

Adiciona uma ou mais tags a um contato específico.

**Autenticação:** Obrigatória (JWT Token)

**URL:**
```
POST /contacts/{contact_id}/tags
```

**Request Body:**
```json
{
  "tag_ids": [1, 3, 5]
}
```

**Validações:**
- `tag_ids`: Array obrigatório, não pode estar vazio
- Cada item deve ser um número inteiro (ID da tag)
- As tags devem existir no sistema

**Response Success (200):**
```json
{
  "id": 123,
  "name": "João Silva",
  "phone_number": "+5511999887766",
  "notes": "Cliente VIP",
  "created_at": "2024-01-01T10:00:00.000Z",
  "updated_at": "2024-01-01T15:30:00.000Z",
  "tags": [
    {
      "id": 1,
      "name": "VIP",
      "color": "#FF5733"
    },
    {
      "id": 3,
      "name": "Suporte",
      "color": "#33FF57"
    },
    {
      "id": 5,
      "name": "Premium",
      "color": "#3357FF"
    }
  ]
}
```

## 2. Remover Tags de um Contato

### DELETE /contacts/:id/tags

Remove uma ou mais tags de um contato específico.

**Autenticação:** Obrigatória (JWT Token)

**URL:**
```
DELETE /contacts/{contact_id}/tags
```

**Request Body:**
```json
{
  "tag_ids": [3, 5]
}
```

**Validações:**
- `tag_ids`: Array obrigatório, não pode estar vazio
- Cada item deve ser um número inteiro (ID da tag)
- As tags devem estar associadas ao contato

**Response Success (200):**
```json
{
  "id": 123,
  "name": "João Silva",
  "phone_number": "+5511999887766",
  "notes": "Cliente VIP",
  "created_at": "2024-01-01T10:00:00.000Z",
  "updated_at": "2024-01-01T15:35:00.000Z",
  "tags": [
    {
      "id": 1,
      "name": "VIP",
      "color": "#FF5733"
    }
  ]
}
```

## 3. Listar Tags de um Contato

### GET /contacts/:id/tags

Retorna todas as tags associadas a um contato específico.

**Autenticação:** Obrigatória (JWT Token)

**URL:**
```
GET /contacts/{contact_id}/tags
```

**Response Success (200):**
```json
[
  {
    "id": 1,
    "name": "VIP",
    "color": "#FF5733",
    "created_at": "2024-01-01T08:00:00.000Z",
    "updated_at": "2024-01-01T08:00:00.000Z"
  },
  {
    "id": 2,
    "name": "Cliente Antigo",
    "color": "#6B7280",
    "created_at": "2024-01-01T09:00:00.000Z",
    "updated_at": "2024-01-01T09:00:00.000Z"
  }
]
```

**Exemplo para Frontend (JavaScript):**
```javascript
// Listar tags de um contato
async function getContactTags(contactId) {
  const response = await fetch(`/contacts/${contactId}/tags`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Erro ao buscar tags do contato');
  }
  
  return await response.json();
}

// Uso
getContactTags(123)
  .then(tags => console.log('Tags do contato:', tags))
  .catch(error => console.error('Erro:', error));
```

---

## Códigos de Erro Comuns

### 400 - Bad Request
```json
{
  "statusCode": 400,
  "message": ["tag_ids deve ser um array", "tag_ids não pode estar vazio"],
  "error": "Bad Request"
}
```

### 404 - Not Found
```json
{
  "statusCode": 404,
  "message": "Contato não encontrado"
}
```

### 409 - Conflict
```json
{
  "statusCode": 409,
  "message": "Tag já está associada ao contato"
}
```

---

## Exemplos Completos para React

### Hook personalizado para gerenciar tags
```javascript
import { useState, useEffect } from 'react';

export function useContactTags(contactId) {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carregar tags do contato
  const loadTags = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/contacts/${contactId}/tags`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setTags(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Adicionar tags
  const addTags = async (tagIds) => {
    try {
      const response = await fetch(`/contacts/${contactId}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tag_ids: tagIds })
      });
      
      if (response.ok) {
        await loadTags(); // Recarregar tags
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Remover tags
  const removeTags = async (tagIds) => {
    try {
      const response = await fetch(`/contacts/${contactId}/tags`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tag_ids: tagIds })
      });
      
      if (response.ok) {
        await loadTags(); // Recarregar tags
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (contactId) {
      loadTags();
    }
  }, [contactId]);

  return { tags, loading, error, addTags, removeTags, reload: loadTags };
}
```

### Componente de exemplo
```jsx
function ContactTagsManager({ contactId }) {
  const { tags, loading, error, addTags, removeTags } = useContactTags(contactId);
  const [selectedTagIds, setSelectedTagIds] = useState([]);

  const handleAddTags = () => {
    if (selectedTagIds.length > 0) {
      addTags(selectedTagIds);
      setSelectedTagIds([]);
    }
  };

  const handleRemoveTag = (tagId) => {
    removeTags([tagId]);
  };

  if (loading) return <div>Carregando tags...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      <h3>Tags do Contato</h3>
      
      {/* Lista de tags atuais */}
      <div className="current-tags">
        {tags.map(tag => (
          <span 
            key={tag.id} 
            className="tag"
            style={{ backgroundColor: tag.color }}
          >
            {tag.name}
            <button onClick={() => handleRemoveTag(tag.id)}>×</button>
          </span>
        ))}
      </div>

      {/* Interface para adicionar novas tags */}
      <div className="add-tags">
        <select 
          multiple 
          value={selectedTagIds} 
          onChange={(e) => setSelectedTagIds([...e.target.selectedOptions].map(o => parseInt(o.value)))}
        >
          {/* Opções de tags disponíveis */}
        </select>
        <button onClick={handleAddTags}>Adicionar Tags</button>
      </div>
    </div>
  );
}
```

---

## Observações Importantes

1. **Autenticação**: Todos os endpoints requerem token JWT válido
2. **IDs das Tags**: Devem ser números inteiros válidos
3. **Arrays**: Os arrays `tag_ids` não podem estar vazios
4. **Duplicatas**: Tentar adicionar uma tag já existente pode gerar erro 409
5. **Performance**: Para muitos contatos, considere implementar cache no frontend