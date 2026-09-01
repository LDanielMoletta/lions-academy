# Exercícios 11 e 12 - RequestHandler e Repository

## Objetivo
Tornar os contratos HTTP explícitos com `RequestHandler` tipado e separar a persistência dos dados (Repository) das regras de negócio (Service).

---

## Exercício 11 - Contratos HTTP com RequestHandler

### O problema
Nas versões anteriores, as rotas recebiam `req` e `res` sem tipagem precisa. O TypeScript não sabia:
- Quais campos existem em `req.params`, `req.body`, `req.query`
- Que formato a resposta deveria ter

### A solução - `RequestHandler<Params, ResBody, ReqBody, Query>`

```typescript
import { RequestHandler } from "express";

// Contrato completo da rota em UM lugar só
const getUserById: RequestHandler<
  IdParams,                     // /users/:id → { id: string }
  UserResponse,                 // resposta: { user: IUser } | erro
  EmptyBody,                    // sem corpo
  EmptyParams                   // sem query
> = async (req, res, next) => { ... };
```

### A ordem dos genéricos importa
| Posição | Representa | Exemplo |
|---------|-----------|---------|
| 1º Params | Parâmetros da URL | `/users/:id` |
| 2º ResBody | Corpo da resposta | `{ users: IUser[] }` |
| 3º ReqBody | Corpo da requisição | corpo de POST/PUT |
| 4º Query | Parâmetros após `?` | `?active=true` |

### Tipos de apoio (`src/types/http.types.ts`)
```typescript
export type IdParams = { id: string };  // id vem da URL como string
export type EmptyParams = Record<string, never>;  // sem params
export type EmptyBody = Record<string, never>;    // sem body
export type UsersQuery = { active?: string };     // ?active=true
export type ProductQuery = { name?: string; maxPrice?: string };

// Respostas tipadas (união de sucesso + erro)
export type UserResponse = { user: IUser } | MessageResponse;
export type UsersResponse = { users: IUser[] };
export type MessageResponse = { error: string; message: string };
```

### Benefícios comprovados
```typescript
// req.query.active → tipado como string | undefined
const active = req.query.active;

// req.params.id → tipado como string, conversão explícita
const id = Number(req.params.id);

// req.body já tem os campos de IUser no POST
const created = await this.userService.create(req.body as IUser);
```

### Inferência e checagem em tempo de compilação
O editor agora:
- Autocompleta `req.params`, `req.body`, `req.query`
- Acusa erro se a resposta não bate com `ResBody`
- Alerta se método incompatível for usado no body

### Limite importante
A tipagem **não valida o JSON real** enviado pelo cliente.
Validação runtime continua necessária (`typeof`, `!== undefined`).

---

## Exercício 12 - Repository

### O problema
O `UserService` manipulava o array diretamente. Trocar o armazenamento (array → JSON → banco) exigiria reescrever o Service e as rotas.

### A solução - Repository
O Repository esconde **COMO** os dados são salvos. Para o resto da aplicação importa **O QUE** pode ser feito com usuários, não se estão em array, JSON ou MongoDB.

### Contrato (`src/repositories/user.repository.ts`)
```typescript
export interface IUserRepository {
  findAll(): Promise<IUser[]>;
  findById(id: number): Promise<IUser | undefined>;
  create(user: IUser): Promise<IUser>;
  update(id: number, data: Partial<IUser>): Promise<IUser | undefined>;
  delete(id: number): Promise<boolean>;
}

export class UserRepository implements IUserRepository {
  private async readUsers(): Promise<IUser[]> { ... }
  private async writeUsers(users: IUser[]): Promise<void> { ... }
  // implementações com node:fs/promises
}
```

### Persistência em JSON (`src/data/users.json`)
```json
[
  { "id": 1, "name": "Maria Silva", "email": "maria@email.com", "isActive": true },
  { "id": 2, "name": "João Souza", "email": "joao@email.com", "isActive": true }
]
```

### Injeção de Dependência
```typescript
// Service recebe o Repository (não cria nem escolhe a tecnologia)
export class UserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async create(user: IUser): Promise<IUser> {
    // REGRA DE NEGÓCIO fica no Service
    if (await this.userRepository.findById(user.id)) {
      throw new Error("ID já existe");
    }
    // PERSISTÊNCIA fica no Repository
    return this.userRepository.create(user);
  }
}

// Composition root no server.ts (montagem única)
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);
```

---

## Separação de Responsabilidades

| Camada | Recebe | Faz | Retorna |
|--------|--------|-----|---------|
| **Controller** | `req`, `res` | Converte HTTP, valida, chama Service | Resposta HTTP |
| **Service** | Dados do caso de uso | Regras de negócio, coordena Repository | Entidade ou resultado |
| **Repository** | Comandos de persistência | Lê, busca, salva, remove | Dados persistidos |
| **Model** | - | Define contrato da entidade | Interface |

### Regras aplicadas no código
- ✅ Handlers tipam Params, ResBody, ReqBody, Query
- ✅ Sem `any` para contornar erros
- ✅ UserRepository não importa `Request`/`Response`
- ✅ UserService não usa `fs.promises` (só o Repository)
- ✅ Repository não contém regra de negócio
- ✅ Todos métodos com I/O retornam `Promise` tipada
- ✅ Middleware global recebe falhas assíncronas via `next(error)`

---

## Configuração Final da Pasta src

```
src/
├── controllers/
│   ├── user.controller.ts       # Handlers /users tipados
│   └── product.controller.ts    # Handlers /products tipados
├── data/
│   └── users.json               # Persistência dos usuários
├── errors/
│   └── app-error.ts             # Erro conhecido + statusCode
├── middlewares/
│   ├── logger.middleware.ts     # Log de requisições
│   └── error-handler.middleware.ts  # Erros globais
├── models/
│   ├── user.ts                  # IUser
│   └── product.ts               # IProduct
├── repositories/
│   └── user.repository.ts       # IUserRepository + JSON
├── services/
│   ├── user.service.ts          # Regras de negócio (DI repository)
│   └── product.service.ts       # Regras + dados em memória
├── types/
│   └── http.types.ts            # Contratos HTTP centralizados
└── server.ts                    # Composition root + rotas
```

---

## Testes Realizados

### Validações automáticas
```bash
npx tsc --noEmit   # ✅ sem erros
npx eslint src     # ✅ sem warnings
```

### Testes manuais da API
| Requisição | Resultado |
|------------|-----------|
| GET /users | ✅ 200 `{users: [...]}` |
| GET /users/1 | ✅ 200 `{user: {...}}` |
| GET /users?active=true | ✅ 200 filtra apenas ativos |
| GET /users/99 | ✅ 404 |
| POST /users | ✅ 201 usuário criado |
| PUT /users/1 | ✅ 200 atualizado |
| DELETE /users/2 | ✅ 200 removido |
| GET /products | ✅ 200 `{products: [...]}` |
| POST /products | ✅ 201 criado |

### Prova da persistência JSON
Após PUT/DELETE/POST, o arquivo `src/data/users.json` foi alterado em disco:
```json
[
  { "id": 1, "name": "Maria Santos", "email": "maria@email.com", "isActive": false },
  { "id": 3, "name": "Ana Santos", "email": "ana@email.com", "isActive": true }
]
```
Ou seja: PUT atualizou (Maria), DELETE removeu (id 2), POST criou (id 3). **Dados sobrevivem ao reinício** - isso não era possível com array em memória.

---

## Diferença Service vs Repository (resposta da entrega)

O **Repository** é a camada que sabe **onde e como** os dados são guardados - no nosso caso, um arquivo JSON. Ele apenas executa operações de persistência: `findAll`, `findById`, `create`, `update`, `delete`. Ele **_não_** decide se a operação é permitida (essa é a regra) e **_não_** conhece HTTP.

O **Service** é a camada que entende o **significado** da operação. Ele aplica as regras de negócio (ex: "não pode criar usuário com ID duplicado") e coordena o Repository, pedindo que ele faça a persistência. Ele **_não_** sabe se os dados estão em JSON, array ou banco de dados - e também **_não_** decide o status HTTP da resposta.

**Consequência prática:** se amanhã trocarmos o JSON por MongoDB, só o Repository muda. O Service, os Controllers e as rotas permanecem intactos.

---

## Git
Branch: `exercicios-11-e-12`
Commit: `a97f280 - Exercícios 11 e 12 - RequestHandler e Repository - 01/09/2026`