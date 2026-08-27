# Exercícios 7 e 8 - Middleware Logger e UserService

## Objetivo
Refatorar a API aplicando separação de responsabilidades: middleware para cross-cutting concerns (log) e service class para lógica de negócio.

---

## Exercício 7 - Middleware Logger

### Arquivo: `src/middlewares/logger.middleware.ts`

```typescript
import { Request, Response, NextFunction } from "express";

export function loggerMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const metodo = req.method;
  const url = req.originalUrl;
  const timestamp = new Date().toISOString();

  console.log(`[${timestamp}] ${metodo} ${url}`);

  next(); // Libera fluxo para próxima camada
}
```

### Registro no Express (server.ts)
```typescript
app.use(loggerMiddleware); // ANTES das rotas = executa para TODAS
```

### Por que 3 parâmetros?
| Parâmetro | Uso no Logger |
|-----------|---------------|
| `Request` | Lê `method`, `originalUrl` |
| `Response` | Não usado, mas obrigatório na assinatura |
| `NextFunction` | `next()` continua o pipeline |

### Saída no Terminal
```
[2026-08-25T19:45:30.123Z] GET /users
[2026-08-25T19:45:32.456Z] POST /users
[2026-08-25T19:45:35.789Z] GET /users/1
[2026-08-25T19:45:38.012Z] PUT /users/1
[2026-08-25T19:45:40.333Z] DELETE /users/2
```

---

## Exercício 8 - UserService

### Arquivo: `src/services/user.service.ts`

```typescript
import { IUser } from "../models/user";

export class UserService {
  private users: IUser[] = [
    { id: 1, name: "Maria Silva", email: "maria@email.com", isActive: true },
    { id: 2, name: "João Souza", email: "joao@email.com", isActive: true },
  ];

  getAll(): IUser[] {
    return [...this.users]; // Cópia defensiva
  }

  getById(id: number): IUser | undefined {
    return this.users.find((u) => u.id === id);
  }

  create(user: IUser): IUser {
    if (this.users.find((u) => u.id === user.id)) {
      throw new Error("ID já existe");
    }
    this.users.push(user);
    return user;
  }

  update(id: number, data: Partial<IUser>): IUser | undefined {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return undefined;

    this.users[index] = { ...this.users[index], ...data };
    return this.users[index];
  }

  delete(id: number): IUser | undefined {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return undefined;
    return this.users.splice(index, 1)[0];
  }
}
```

### Por que `Partial<IUser>` no update?
```typescript
// Permite enviar SÓ os campos que mudam
const updates: Partial<IUser> = { name: "Novo Nome" };
// email e isActive mantêm valores atuais
```

### Uso nas Rotas (server.ts)
```typescript
const userService = new UserService();

app.get("/users", (_req, res) => res.json(userService.getAll()));

app.get("/users/:id", (req, res) => {
  const user = userService.getById(Number(req.params.id));
  if (!user) return res.status(404).json({ error: "Não encontrado" });
  res.json(user);
});

app.post("/users", (req, res) => {
  // Valida HTTP → try/catch → userService.create()
});

app.put("/users/:id", (req, res) => {
  const updates: Partial<IUser> = {};
  if (name !== undefined) updates.name = name;
  // ...
  const updated = userService.update(Number(req.params.id), updates);
  // ...
});

app.delete("/users/:id", (req, res) => {
  const deleted = userService.delete(Number(req.params.id));
  // ...
});
```

---

## Separação de Responsabilidades

| Camada | Responsabilidade | Exemplo |
|--------|------------------|---------|
| **Rota (Controller)** | HTTP: params, body, status, response | `Number(req.params.id)`, `res.status(404)` |
| **Service** | Dados/Regra: array, find, push, splice, validações de negócio | `userService.getById(id)` |
| **Model** | Contrato: interface `IUser` | `{ id, name, email, isActive }` |

---

## Benefícios da Refatoração

1. **Testabilidade** - Service testável sem subir HTTP
2. **Manutenibilidade** - Mudança de storage (array → DB) só no service
3. **Reutilização** - Service pode ser usado por CLI, jobs, etc.
4. **Clareza** - Rota lê como "recebe → valida → delega → responde"

---

## Validações

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ |
| `npx eslint src` | ✅ |
| Testes manuais | ✅ API idêntica ao Exercício 5 |

---

## Git
Branch: `exercicios-7-e-8`
Commit: `992d227 - Exercícios 7 e 8 - Middleware e UserService - 25/08/2026`