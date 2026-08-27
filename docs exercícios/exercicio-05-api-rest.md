# Exercício 5 - API REST com Express + TypeScript

## Objetivo
Construir uma API REST completa com Express tipado, implementando CRUD de usuários em memória.

---

## Dependências Adicionadas
```bash
npm install express @types/express
```

---

## Estrutura da API

### Modelo (src/models/user.ts)
```typescript
export interface IUser {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}
```

### Rotas (src/server.ts)
| Método | Rota | Descrição | Status |
|--------|------|-----------|--------|
| GET | `/users` | Lista todos | 200 |
| GET | `/users/:id` | Busca por ID | 200 / 404 |
| POST | `/users` | Cria novo | 201 / 400 / 409 |
| PUT | `/users/:id` | Atualiza (parcial) | 200 / 400 / 404 |
| DELETE | `/users/:id` | Remove | 200 / 404 |

---

## Implementação das Rotas

### GET /users
```typescript
app.get("/users", (_req: Request, res: Response) => {
  const users = userService.getAll();
  res.json(users); // 200 OK
});
```

### GET /users/:id
```typescript
app.get("/users/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = userService.getById(id);

  if (!user) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }
  res.json(user);
});
```

### POST /users
```typescript
app.post("/users", (req: Request, res: Response) => {
  const { id, name, email, isActive } = req.body;

  // Validação runtime (TS não valida JSON externo)
  if (id === undefined || typeof name !== "string" || ...) {
    return res.status(400).json({ error: "Campos obrigatórios..." });
  }

  try {
    const newUser: IUser = { id, name, email, isActive };
    const created = userService.create(newUser);
    res.status(201).json(created);
  } catch (error) {
    if (error.message === "ID já existe") {
      return res.status(409).json({ error: "Já existe um usuário com esse id" });
    }
    throw error;
  }
});
```

### PUT /users/:id (Atualização Parcial)
```typescript
app.put("/users/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const updates: Partial<IUser> = {};

  if (name !== undefined) updates.name = name;
  if (email !== undefined) updates.email = email;
  if (isActive !== undefined) updates.isActive = isActive;

  const updated = userService.update(id, updates);
  if (!updated) return res.status(404).json({ error: "Usuário não encontrado" });
  res.json(updated);
});
```

### DELETE /users/:id
```typescript
app.delete("/users/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const deleted = userService.delete(id);
  if (!deleted) return res.status(404).json({ error: "Usuário não encontrado" });
  res.json(deleted);
});
```

---

## Middleware Logger (Exercício 7 - Antecipado)
Registra toda requisição no console:
```
[2026-08-25T19:45:30.123Z] GET /users
[2026-08-25T19:45:32.456Z] POST /users
```

---

## Service UserService
Encapsula array e lógica de dados (ver Exercício 7).

---

## Validações

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ |
| `npx eslint src` | ✅ |
| Testes manuais (curl/Postman) | ✅ Todas rotas funcionando |

---

## Testes Realizados

```bash
# Listar
GET /users → 200 [{id:1,...}, {id:2,...}]

# Buscar
GET /users/1 → 200 {id:1, name:"Maria",...}
GET /users/99 → 404 {error:"Usuário não encontrado"}

# Criar
POST /users {id:3, name:"Ana", email:"ana@email.com", isActive:true} → 201
POST /users {name:"Sem ID"} → 400
POST /users {id:1, ...} → 409 "ID já existe"

# Atualizar
PUT /users/1 {name:"Maria Santos", isActive:false} → 200

# Deletar
DELETE /users/2 → 200 {id:2,...}
```

---

## Conceitos Aplicados
- Tipagem de `Request`, `Response`, `Request<Params, ResBody, ReqBody>`
- `Partial<T>` para atualizações parciais
- Separação: Rota = HTTP, Service = Dados
- Validação runtime vs compile-time
- Códigos HTTP semânticos (200, 201, 400, 404, 409)