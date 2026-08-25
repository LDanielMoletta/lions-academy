# Lions Academy - Aula TypeScript

Projeto desenvolvido durante a aula de TypeScript com Node.js + Express.

---

## O que foi feito

### Configuração do ambiente
- Inicializei o projeto com `npm init`
- Instalei: `typescript`, `ts-node`, `nodemon`, `eslint`, `typescript-eslint`
- Configurei `tsconfig.json` para Node.js + TypeScript
- Configurei ESLint (flat config v10)
- Configurei VS Code (settings.json + extensions.json)

### Exercício 2 - Tipos Primitivos e Estruturados
Criei variáveis com tipos explícitos:
- `string` (nome do produto)
- `number` (preço)
- `boolean` (em estoque)
- `string[]` (categorias)
- Tupla `[number, number]` (coordenadas)
- `enum` (status do pedido)
- Função que recebe nome e preço e retorna mensagem formatada

### Exercício 3 - Interfaces e Tipos Personalizados
Criei:
- Interface `IUser` (id, name, email, isActive)
- Interface `IProduct` (id, name, price, inStock, categories)
- Type Alias `UserRole` ('admin' | 'user')
- Interface `IAdminUser` que estende `IUser` + role
- Funções para exibir usuário e produto

### Exercício 4 - Generics
Duas funções genéricas:
- `getData<T>(items: T[]): T[]` - retorna o mesmo array (testei com string, number, IUser)
- `getById<T extends {id: number}>(items: T[], id: number): T | undefined` - busca por ID (testei com IUser e IProduct)

### Exercício 5 - API REST com Express
Instalei `express` e `@types/express`. Criei `src/server.ts` com 5 rotas:
| Método | Rota | O que faz |
|--------|------|-----------|
| GET | `/users` | Lista todos |
| GET | `/users/:id` | Busca um por ID |
| POST | `/users` | Cria novo (valida body) |
| PUT | `/users/:id` | Atualiza (valida body) |
| DELETE | `/users/:id` | Remove |

---

## Exercícios 7 e 8 - Middleware + UserService (branch `exercicios-7-e-8`)

### Estrutura nova
```
src/
├── middlewares/
│   └── logger.middleware.ts    # Middleware de log
├── services/
│   └── user.service.ts         # Classe UserService
├── models/
│   └── user.ts                 # Interface IUser
└── server.ts                   # Rotas (só HTTP, delega pro service)
```

### Exercício 7 - Middleware Logger
Criei um middleware que roda **antes de todas as rotas** e mostra no terminal:
```
[2026-08-25T19:45:30.123Z] GET /users
[2026-08-25T19:45:32.456Z] POST /users
```
Ele pega o método (`req.method`), a URL (`req.originalUrl`) e a hora (`new Date().toISOString()`). No final chama `next()` pra continuar o fluxo. Se esquecer o `next()`, a requisição trava.

### Exercício 8 - UserService
Criei uma classe que **guarda o array de usuários privado** e tem os métodos:
- `getAll()` → retorna todos
- `getById(id)` → busca um ou undefined
- `create(user)` → adiciona (erra se ID já existe)
- `update(id, data)` → atualiza só o que mandar (usa `Partial<IUser>`)
- `delete(id)` → remove e retorna o removido

As rotas agora **não mexem no array diretamente** - só validam HTTP (params, body, status) e chamam o service.

---

## Testes feitos

### Validações automáticas
```bash
npx tsc --noEmit   # ✅ sem erros de tipo
npx eslint src     # ✅ sem warnings
```

### Testes manuais da API (Postman/Insomnia/curl)
Todas as rotas respondem igual ao Exercício 5:
- `GET /users` → 200 com lista
- `GET /users/1` → 200 com usuário
- `GET /users/99` → 404 "Usuário não encontrado"
- `POST /users` com body válido → 201 criado
- `POST /users` sem campos obrigatórios → 400 erro
- `PUT /users/1` com `{name: "Novo"}` → 200 atualizado (só muda o name)
- `DELETE /users/2` → 200 retorna o removido
- Middleware log aparece no terminal a cada chamada

---

## Respostas da entrega

**O que o middleware resolve?**
Ele serve pra **saber o que tá acontecendo no servidor** sem precisar colocar `console.log` em cada rota. Toda vez que alguém faz uma requisição, ele anota o método (GET, POST...), a URL e a hora. Ajuda muito pra debugar e ver se a API tá sendo usada. Ele não muda nada da resposta, só observa e passa pra frente.

**Por que o UserService melhora a organização?**
Antes o array de usuários ficava solto no `server.ts` e cada rota mexia nele direto com `find`, `push`, `splice`. Isso mistura código de HTTP (receber request, mandar response) com lógica de dados.

Com o `UserService`:
- O array fica **escondido** (private) dentro da classe - ninguém mexe sem querer
- As rotas ficam **só com responsabilidade de HTTP**: converter parâmetro, validar body, escolher status code
- O service fica **só com responsabilidade dos dados**: buscar, criar, atualizar, deletar
- Se amanhã quiser trocar o array por um banco de dados, **só muda o service**, as rotas não precisam mudar
- Dá pra testar o service isolado sem subir servidor

---

## Como rodar

```bash
# Instalar dependências
npm install

# Desenvolvimento (com nodemon + ts-node)
npm run dev

# Build
npm run build

# Produção
npm start

# Lint
npm run lint
npm run lint:fix
```

Servidor sobe em `http://localhost:3000`

---

## Branch dos exercícios 7 e 8
```bash
git checkout exercicios-7-e-8
```

Lá tem o middleware logger + UserService + refatoração completa mantendo a API igual.