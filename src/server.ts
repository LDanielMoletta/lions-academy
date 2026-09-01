// src/server.ts
// Servidor Express principal - ponto de entrada da aplicação
// Monta as dependências (composition root), registra middlewares e rotas

import express from "express";
import { loggerMiddleware } from "./middlewares/logger.middleware";
import { errorHandler } from "./middlewares/error-handler.middleware";
import { UserRepository, IUserRepository } from "./repositories/user.repository";
import { UserService } from "./services/user.service";
import { ProductService } from "./services/product.service";
import { UserController } from "./controllers/user.controller";
import { ProductController } from "./controllers/product.controller";

const app = express();
const PORT = 3000;

// Middleware para parsear JSON no corpo das requisições
app.use(express.json());

// Logger registra TODA requisição (método, URL, timestamp)
app.use(loggerMiddleware);

// ==========================================
// COMPOSITION ROOT - montagem das dependências
// Repository → Service → Controller (injeção de dependência)
// ==========================================

// Usuários: UserRepository (persistência JSON) → UserService → UserController
const userRepository: IUserRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

// Produtos: ProductService (em memória) → ProductController
const productService = new ProductService();
const productController = new ProductController(productService);

// ==========================================
// ROTAS DE USUÁRIOS - handlers tipados no controller
// ==========================================
app.get("/users", userController.listUsers);
app.get("/users/:id", userController.getUserById);
app.post("/users", userController.createUser);
app.put("/users/:id", userController.updateUser);
app.delete("/users/:id", userController.deleteUser);

// ==========================================
// ROTAS DE PRODUTOS
// ==========================================
app.get("/products", productController.listProducts);
app.get("/products/:id", productController.getProductById);
app.post("/products", productController.createProduct);
app.put("/products/:id", productController.updateProduct);
app.delete("/products/:id", productController.deleteProduct);

// ==========================================
// MIDDLEWARE GLOBAL DE ERROS - ÚLTIMO app.use()
// Recebe falhas assíncronas via next(error) dos controllers
// ==========================================
app.use(errorHandler);

// Inicia servidor na porta 3000
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});