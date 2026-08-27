// src/server.ts
// Servidor Express principal - configura rotas, middleware e inicia a API
// Responsabilidade APENAS com HTTP: receber requisições, chamar serviço, enviar respostas

import express, { Request, Response } from "express";
import { loggerMiddleware } from "./middlewares/logger.middleware";
import { errorHandler } from "./middlewares/error-handler.middleware";
import { UserService } from "./services/user.service";
import { ProductService } from "./services/product.service";
import { IUser } from "./models/user";
import { IProduct } from "./models/product";

const app = express();
const PORT = 3000;

// Middleware para parsear JSON no corpo das requisições
// Necessário para req.body funcionar em POST/PUT
app.use(express.json());

// REGISTRA O MIDDLEWARE DE LOG PARA TODAS AS ROTAS
// app.use() antes das rotas = executa para TODA requisição
// O middleware loggerMiddleware apenas observa e libera com next()
app.use(loggerMiddleware);

// Instâncias dos serviços (Singleton pattern simples)
// Cada serviço mantém seu próprio estado (array) em memória
const userService = new UserService();
const productService = new ProductService();

// ==========================================
// ROTAS DE USUÁRIOS - valida HTTP -> chama userService -> responde HTTP
// ==========================================

// GET /users - Lista todos os usuários
app.get("/users", (_req: Request, res: Response) => {
  const users = userService.getAll();
  res.json(users);
});

// GET /users/:id - Busca usuário por ID
app.get("/users/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = userService.getById(id);

  if (!user) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }

  res.json(user);
});

// POST /users - Cria novo usuário
app.post("/users", (req: Request, res: Response) => {
  const { id, name, email, isActive } = req.body;

  // Validação simples em tempo de execução
  if (
    id === undefined ||
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof isActive !== "boolean"
  ) {
    return res
      .status(400)
      .json({ error: "Campos id, name, email e isActive são obrigatórios e devem ter tipos corretos" });
  }

  try {
    const newUser: IUser = { id, name, email, isActive };
    const created = userService.create(newUser);
    res.status(201).json(created);
  } catch (error) {
    if (error instanceof Error && error.message === "ID já existe") {
      return res.status(409).json({ error: "Já existe um usuário com esse id" });
    }
    throw error;
  }
});

// PUT /users/:id - Atualiza usuário (atualização parcial)
app.put("/users/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { name, email, isActive } = req.body;

  if (
    (name !== undefined && typeof name !== "string") ||
    (email !== undefined && typeof email !== "string") ||
    (isActive !== undefined && typeof isActive !== "boolean")
  ) {
    return res
      .status(400)
      .json({ error: "Campos inválidos: name (string), email (string), isActive (boolean)" });
  }

  const updates: Partial<IUser> = {};
  if (name !== undefined) updates.name = name;
  if (email !== undefined) updates.email = email;
  if (isActive !== undefined) updates.isActive = isActive;

  const updated = userService.update(id, updates);

  if (!updated) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }

  res.json(updated);
});

// DELETE /users/:id - Remove usuário
app.delete("/users/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const deleted = userService.delete(id);

  if (!deleted) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }

  res.json(deleted);
});

// ==========================================
// ROTAS DE PRODUTOS - valida HTTP -> chama productService -> responde HTTP
// O service agora LANÇA AppError para erros de negócio
// O middleware errorHandler (registrado no final) captura e formata a resposta
// ==========================================

// GET /products - Lista todos os produtos
app.get("/products", (_req: Request, res: Response) => {
  const products = productService.getAll();
  res.json(products);
});

// GET /products/:id - Busca produto por ID
app.get("/products/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const product = productService.getById(id);

  if (!product) {
    return res.status(404).json({ error: "Produto não encontrado" });
  }

  res.json(product);
});

// POST /products - Cria novo produto
// Validação básica de presença/tipos + service valida regras de negócio
app.post("/products", (req: Request, res: Response) => {
  const { id, name, price, inStock, categories } = req.body;

  // Validação HTTP: campos obrigatórios presentes e com tipos básicos
  if (
    id === undefined ||
    typeof name !== "string" ||
    typeof price !== "number" ||
    typeof inStock !== "boolean" ||
    !Array.isArray(categories)
  ) {
    return res.status(400).json({
      error: "Campos obrigatórios: id (number), name (string), price (number), inStock (boolean), categories (string[])",
    });
  }

  try {
    const newProduct: IProduct = { id, name, price, inStock, categories };
    const created = productService.create(newProduct);
    res.status(201).json(created);
  } catch (error) {
    // Se for AppError, o middleware errorHandler vai capturar e responder
    // Se for outro erro, também será capturado pelo middleware como 500
    throw error;
  }
});

// PUT /products/:id - Atualiza produto (parcial com Partial<IProduct>)
app.put("/products/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { name, price, inStock, categories } = req.body;

  // Validação HTTP: se campo veio, deve ter tipo correto
  if (
    (name !== undefined && typeof name !== "string") ||
    (price !== undefined && typeof price !== "number") ||
    (inStock !== undefined && typeof inStock !== "boolean") ||
    (categories !== undefined && !Array.isArray(categories))
  ) {
    return res.status(400).json({
      error: "Campos inválidos: name (string), price (number), inStock (boolean), categories (string[])",
    });
  }

  // Monta objeto apenas com campos enviados
  const updates: Partial<IProduct> = {};
  if (name !== undefined) updates.name = name;
  if (price !== undefined) updates.price = price;
  if (inStock !== undefined) updates.inStock = inStock;
  if (categories !== undefined) updates.categories = categories;

  try {
    const updated = productService.update(id, updates);
    // Se productService.update não encontrou, ele lança AppError(404)
    // que será capturado pelo errorHandler
    res.json(updated);
  } catch (error) {
    throw error;
  }
});

// DELETE /products/:id - Remove produto
app.delete("/products/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);

  try {
    const deleted = productService.delete(id);
    // Se não encontrou, productService.delete lança AppError(404)
    res.json(deleted);
  } catch (error) {
    throw error;
  }
});

// ==========================================
// MIDDLEWARE GLOBAL DE ERROS - DEVE SER O ÚLTIMO app.use()
// Registrado DEPOIS de todas as rotas para capturar erros delas
// ==========================================
app.use(errorHandler);

// Inicia servidor na porta 3000
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});