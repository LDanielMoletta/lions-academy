# Documentação dos Exercícios - Lions Academy TypeScript

## Visão Geral

Este documento serve como índice para a documentação detalhada de cada exercício realizado na aula de TypeScript com Node.js + Express.

---

## Estrutura da Pasta

```
docs exercícios/
├── README.md                           # Este arquivo
├── exercicio-01-ambiente.md            # Configuração do ambiente
├── exercicio-02-tipos-primitivos.md    # Tipos primitivos e estruturados
├── exercicio-03-interfaces.md          # Interfaces e tipos personalizados
├── exercicio-04-generics.md            # Generics
├── exercicio-05-api-rest.md            # API REST com Express
├── exercicio-07-08-middleware-service.md # Middleware + UserService
├── exercicio-09-10-erros-produtos.md   # AppError + CRUD Produtos
└── exercicio-11-12-requesthandler-repository.md # RequestHandler + Repository
```

---

## Resumo dos Exercícios

| Ex | Tópico | Arquivos Principais | Branch |
|----|--------|---------------------|--------|
| 1 | Configuração Ambiente | `package.json`, `tsconfig.json`, `eslint.config.js`, `.vscode/` | `main` |
| 2 | Tipos Primitivos | `src/app.ts` | `main` |
| 3 | Interfaces | `src/interfaces.ts` → `src/models/user.ts` | `main` |
| 4 | Generics | `src/generics.ts` | `main` |
| 5 | API REST Users | `src/server.ts`, `src/services/user.service.ts` | `main` |
| 7 | Middleware Logger | `src/middlewares/logger.middleware.ts` | `exercicios-7-e-8` |
| 8 | UserService | `src/services/user.service.ts`, `src/models/user.ts` | `exercicios-7-e-8` |
| 9 | AppError + ErrorHandler | `src/errors/app-error.ts`, `src/middlewares/error-handler.middleware.ts` | `exercicios-9-e-10` |
| 10 | CRUD Produtos | `src/services/product.service.ts`, `src/models/product.ts` | `exercicios-9-e-10` |
| 11 | RequestHandler tipado | `src/controllers/*.ts`, `src/types/http.types.ts` | `exercicios-11-e-12` |
| 12 | Repository JSON | `src/repositories/user.repository.ts`, `src/data/users.json` | `exercicios-11-e-12` |

---

## Evolução da Arquitetura

### Início (Ex 1-5)
```
src/
├── app.ts          # Tipos básicos
├── interfaces.ts   # Interfaces
├── generics.ts     # Generics
└── server.ts       # API Users (tudo junto)
```

### Após Refatoração (Ex 7-8)
```
src/
├── middlewares/
│   └── logger.middleware.ts
├── services/
│   └── user.service.ts
├── models/
│   └── user.ts
└── server.ts       # Rotas delegam para services
```

### Final (Ex 9-10)
```
src/
├── errors/
│   └── app-error.ts
├── middlewares/
│   ├── logger.middleware.ts
│   └── error-handler.middleware.ts
├── models/
│   ├── user.ts
│   └── product.ts
├── services/
│   ├── user.service.ts
│   └── product.service.ts
└── server.ts       # Rotas users + products + errorHandler
```

### Final (Ex 11-12) - Camadas separadas
```
src/
├── controllers/          # HTTP: handlers tipados com RequestHandler
│   ├── user.controller.ts
│   └── product.controller.ts
├── data/                 # Persistência
│   └── users.json
├── errors/
│   └── app-error.ts
├── middlewares/
│   ├── logger.middleware.ts
│   └── error-handler.middleware.ts
├── models/               # Contratos das entidades
│   ├── user.ts
│   └── product.ts
├── repositories/         # Persistência (JSON)
│   └── user.repository.ts
├── services/             # Regras de negócio
│   ├── user.service.ts   # (recebe repository por DI)
│   └── product.service.ts
├── types/                # Contratos HTTP explícitos
│   └── http.types.ts
└── server.ts             # Composition root + registro de rotas
```

---

## Padrões Adotados

| Padrão | Onde Aplicado |
|--------|---------------|
| **Separação de Responsabilidades** | Rota = HTTP, Service = Dados, Model = Contrato |
| **Encapsulamento** | Arrays `private` nos services |
| **Tipagem Estrita** | `strict: true`, `Partial<T>`, `extends` constraints |
| **Error Handling Padronizado** | `AppError` + `ErrorRequestHandler` global |
| **Validação em Camadas** | HTTP (rota) + Negócio (service) |
| **Middleware Pipeline** | Logger (antes) → Rotas → ErrorHandler (depois) |

---

## Como Executar

```bash
# Instalar dependências
npm install

# Desenvolvimento (hot reload)
npm run dev

# Build produção
npm run build
npm start

# Qualidade
npm run lint
npm run lint:fix
```

---

## Validações Contínuas

Todos os exercícios passam em:
- ✅ `npx tsc --noEmit` - Sem erros de tipo
- ✅ `npx eslint src` - Sem warnings
- ✅ Testes manuais das rotas (GET, POST, PUT, DELETE)

---

## Branches do Git

| Branch | Conteúdo |
|--------|----------|
| `main` | Exercícios 1 a 5 (base) |
| `exercicios-7-e-8` | Middleware Logger + UserService |
| `exercicios-9-e-10` | AppError + ErrorHandler + CRUD Produtos |

---

## Para o Professor

Cada arquivo `.md` em `docs exercícios/` contém:
1. **Objetivo** do exercício
2. **Código completo** comentado
3. **Conceitos explicados** com tabelas
4. **Validações** realizadas (comandos + resultados)
5. **Saídas** esperadas
6. **Aprendizados** principais

A documentação foi escrita para ser autoexplicativa - um leigo consegue entender o que foi feito e por quê.