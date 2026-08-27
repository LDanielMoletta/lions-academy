# Exercícios 9 e 10 - AppError, ErrorHandler Global e CRUD Produtos

## Objetivo
Implementar tratamento de erros tipado e padronizado + CRUD de produtos com regras de negócio no service.

---

## Exercício 9 - AppError e ErrorHandler

### 1. Classe AppError (`src/errors/app-error.ts`)

```typescript
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);        // Inicializa Error.message
    this.statusCode = statusCode;  // Código HTTP
    this.name = "AppError";        // Identificação em logs

    // Stack trace correta (aponta para throw, não para construtor)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}
```

**Por que `super(message)`?**
- `Error` é classe nativa que espera mensagem no construtor
- Sem `super()`, `error.message` seria vazio/undefined
- Garante que `try/catch` e logs mostrem a mensagem correta

**Por que `readonly statusCode`?**
- Imutável após criação - evita bugs acidentais
- Contrato claro: erro = mensagem + status fixo

**Status Codes Escolhidos**
| Situação | Status | Código |
|----------|--------|--------|
| Validação inválida | 400 Bad Request | Dados malformados |
| Recurso não encontrado | 404 Not Found | ID inexistente |
| Conflito (ID duplicado) | 409 Conflict | Criação com ID existente |
| Erro interno | 500 | Bug inesperado |

---

### 2. Middleware Global de Erros (`src/middlewares/error-handler.middleware.ts`)

```typescript
import { ErrorRequestHandler, Response } from "express";
import { AppError } from "../errors/app-error";

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req: unknown,
  res: Response,
  _next: unknown
): void => {
  // Erro CONHECIDO (lançado intencionalmente com throw new AppError)
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.name,    // "AppError"
      message: error.message
    });
  }

  // Erro INESPERADO (bug, exceção não tratada, falha externa)
  console.error("Erro inesperado:", error);
  return res.status(500).json({
    error: "InternalServerError",
    message: "Erro interno do servidor"
  });
}
```

**Por que 4 parâmetros?**
Express identifica error handler pela aridade 4: `(err, req, res, next) => void`

**Registro CRÍTICO - DEPOIS das rotas:**
```typescript
// server.ts
app.get("/products", ...);
app.post("/products", ...);
// ...todas as rotas...

app.use(errorHandler); // ÚLTIMO middleware!
```

---

## Exercício 10 - CRUD Produtos com Regras de Negócio

### Modelo (`src/models/product.ts`)
```typescript
export interface IProduct {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
  categories: string[];
}
```

### Service (`src/services/product.service.ts`)

```typescript
export class ProductService {
  private products: IProduct[] = [/* dados iniciais */];

  getAll(): IProduct[] { return [...this.products]; }

  getById(id: number): IProduct | undefined {
    return this.products.find((p) => p.id === id);
  }

  create(product: IProduct): IProduct {
    // Validações de NEGÓCIO (lançam AppError)
    if (this.products.find((p) => p.id === product.id)) {
      throw new AppError("Já existe um produto com esse id", 409);
    }
    if (!product.name?.trim()) {
      throw new AppError("Nome do produto é obrigatório", 400);
    }
    if (typeof product.price !== "number" || product.price <= 0) {
      throw new AppError("Preço deve ser maior que zero", 400);
    }
    if (!Array.isArray(product.categories)) {
      throw new AppError("Categorias deve ser array de strings", 400);
    }

    this.products.push(product);
    return product;
  }

  update(id: number, data: Partial<IProduct>): IProduct {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new AppError("Produto não encontrado", 404);
    }

    // Valida só campos enviados
    if (data.name !== undefined && !data.name.trim()) {
      throw new AppError("Nome não pode ser vazio", 400);
    }
    if (data.price !== undefined && (typeof data.price !== "number" || data.price <= 0)) {
      throw new AppError("Preço deve ser maior que zero", 400);
    }
    if (data.categories !== undefined && !Array.isArray(data.categories)) {
      throw new AppError("Categorias deve ser array de strings", 400);
    }

    this.products[index] = { ...this.products[index], ...data };
    return this.products[index];
  }

  delete(id: number): IProduct {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new AppError("Produto não encontrado", 404);
    }
    return this.products.splice(index, 1)[0];
  }
}
```

### Rotas (`src/server.ts`)
```typescript
const productService = new ProductService();

app.get("/products", (_req, res) => res.json(productService.getAll()));

app.get("/products/:id", (req, res) => {
  const product = productService.getById(Number(req.params.id));
  if (!product) return res.status(404).json({ error: "Produto não encontrado" });
  res.json(product);
});

app.post("/products", (req, res) => {
  const { id, name, price, inStock, categories } = req.body;
  // Validação HTTP básica (tipos/presença)
  if (id === undefined || typeof name !== "string" || ...) {
    return res.status(400).json({ error: "Campos obrigatórios..." });
  }
  try {
    const created = productService.create({ id, name, price, inStock, categories });
    res.status(201).json(created);
  } catch (error) { throw error; } // ErrorHandler captura
});

app.put("/products/:id", (req, res) => {
  const updates: Partial<IProduct> = {};
  if (name !== undefined) updates.name = name;
  if (price !== undefined) updates.price = price;
  // ...
  try {
    const updated = productService.update(Number(req.params.id), updates);
    res.json(updated);
  } catch (error) { throw error; }
});

app.delete("/products/:id", (req, res) => {
  try {
    const deleted = productService.delete(Number(req.params.id));
    res.json(deleted);
  } catch (error) { throw error; }
});

// ErrorHandler DEPOIS de tudo
app.use(errorHandler);
```

---

## Fluxo de Erro

```
Requisição → Rota → Service.valida() → throw new AppError(...)
                                              ↓
                                    ErrorHandler (app.use)
                                              ↓
                                    Response: {error, message} + statusCode
```

**Exemplo real:**
```
POST /products {price: -10}
    → service.create() valida price <= 0
    → throw new AppError("Preço deve ser maior que zero", 400)
    → errorHandler captura
    → 400 {error: "AppError", message: "Preço deve ser maior que zero"}
```

---

## Testes Validados

| Requisição | Esperado | Resultado |
|------------|----------|-----------|
| GET /products | 200 lista | ✅ |
| GET /products/1 | 200 produto | ✅ |
| GET /products/99 | 404 | ✅ |
| POST /products (válido) | 201 | ✅ |
| POST /products (price: -10) | 400 | ✅ |
| POST /products (id duplicado) | 409 | ✅ |
| PUT /products/2 (parcial) | 200 | ✅ |
| PUT /products/99 | 404 | ✅ |
| DELETE /products/3 | 200 | ✅ |
| DELETE /products/99 | 404 | ✅ |

**Usuários** continuam funcionando: GET/POST/PUT/DELETE /users

---

## Validações Técnicas

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ Sem erros |
| `npx eslint src` | ✅ Sem warnings |
| Middleware logger | ✅ Registra todas chamadas |

---

## Decisões de Design

| Decisão | Justificativa |
|---------|---------------|
| Service lança `AppError` | Centraliza status HTTP no erro, não na rota |
| `Partial<IProduct>` no update | Atualização parcial (PATCH-style via PUT) |
| Validação HTTP + Service | HTTP = tipos/presença; Service = regras de negócio |
| ErrorHandler por último | Captura erros de TODAS as rotas anteriores |
| Não expor `error.stack` | Segurança - não vazar internals |

---

## Git
Branch: `exercicios-9-e-10`
Commit: `4c891b5 - Exercícios 9 e 10 - AppError, ErrorHandler e CRUD Produtos - 27/08/2026`