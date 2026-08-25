// src/server.ts
// Servidor Express principal - configura rotas, middleware e inicia a API
// Responsabilidade APENAS com HTTP: receber requisições, chamar serviço, enviar respostas

import express, { Request, Response } from "express";
import { loggerMiddleware } from "./middlewares/logger.middleware";
import { UserService } from "./services/user.service";
import { IUser } from "./models/user";

const app = express();
const PORT = 3000;

// Middleware para parsear JSON no corpo das requisições
// Necessário para req.body funcionar em POST/PUT
app.use(express.json());

// REGISTRA O MIDDLEWARE DE LOG PARA TODAS AS ROTAS
// app.use() antes das rotas = executa para TODA requisição
// O middleware loggerMiddleware apenas observa e libera com next()
app.use(loggerMiddleware);

// Instância única do serviço (Singleton pattern simples)
// O serviço mantém o estado (array de usuários) em memória
const userService = new UserService();

// ==========================================
// ROTAS - Cada rota: valida HTTP -> chama serviço -> responde HTTP
// ==========================================

// GET /users - Lista todos os usuários
// Rota não faz lógica de dados, apenas delega ao serviço
app.get("/users", (_req: Request, res: Response) => {
  const users = userService.getAll();
  // Status 200 (OK) é padrão do res.json()
  res.json(users);
});

// GET /users/:id - Busca usuário por ID
// Rota converte parâmetro string -> number e trata 404
app.get("/users/:id", (req: Request, res: Response) => {
  // req.params.id vem como string, convertemos para number
  const id = Number(req.params.id);

  // Delega busca ao serviço
  const user = userService.getById(id);

  // Se serviço retornou undefined = não encontrado
  if (!user) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }

  // Encontrou: retorna 200 com o usuário
  res.json(user);
});

// POST /users - Cria novo usuário
// Rota valida corpo da requisição e decide status HTTP
app.post("/users", (req: Request, res: Response) => {
  const { id, name, email, isActive } = req.body;

  // Validação simples em tempo de execução (TypeScript não valida JSON recebido)
  // Verificamos se todos os campos obrigatórios estão presentes e com tipos corretos
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
    // Tenta criar via serviço
    const newUser: IUser = { id, name, email, isActive };
    const created = userService.create(newUser);
    // 201 Created = recurso criado com sucesso
    res.status(201).json(created);
  } catch (error) {
    // Serviço lançou erro "ID já existe" -> 409 Conflict
    if (error instanceof Error && error.message === "ID já existe") {
      return res.status(409).json({ error: "Já existe um usuário com esse id" });
    }
    // Outros erros inesperados
    throw error;
  }
});

// PUT /users/:id - Atualiza usuário (atualização parcial com Partial<IUser>)
// Rota converte ID, valida corpo e delega ao serviço
app.put("/users/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { name, email, isActive } = req.body;

  // Validação: pelo menos um campo deve ser enviado para atualização
  // E se enviado, deve ter tipo correto
  if (
    (name !== undefined && typeof name !== "string") ||
    (email !== undefined && typeof email !== "string") ||
    (isActive !== undefined && typeof isActive !== "boolean")
  ) {
    return res
      .status(400)
      .json({ error: "Campos inválidos: name (string), email (string), isActive (boolean)" });
  }

  // Monta objeto apenas com campos enviados (Partial<IUser>)
  const updates: Partial<IUser> = {};
  if (name !== undefined) updates.name = name;
  if (email !== undefined) updates.email = email;
  if (isActive !== undefined) updates.isActive = isActive;

  // Delega atualização ao serviço
  const updated = userService.update(id, updates);

  // Se undefined = não encontrado
  if (!updated) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }

  // Sucesso: retorna usuário atualizado
  res.json(updated);
});

// DELETE /users/:id - Remove usuário
// Rota converte ID e delega remoção ao serviço
app.delete("/users/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);

  // Delega exclusão ao serviço
  const deleted = userService.delete(id);

  // Se undefined = não encontrado
  if (!deleted) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }

  // Sucesso: retorna usuário removido (200 OK)
  // Poderia ser 204 No Content sem body, mas mantemos compatibilidade com Exercício 5
  res.json(deleted);
});

// Inicia servidor na porta 3000
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});