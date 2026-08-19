import express, { Request, Response } from "express";
import { IUser } from "./interfaces";

const app = express();
const PORT = 3000;

app.use(express.json());

// Array de usuários em memória
const users: IUser[] = [
  { id: 1, name: "Maria Silva", email: "maria@email.com", isActive: true },
  { id: 2, name: "João Souza", email: "joao@email.com", isActive: true },
];

// GET /users - Retorna todos os usuários
app.get("/users", (_req: Request, res: Response) => {
  res.json(users);
});

// GET /users/:id - Retorna um usuário pelo ID
app.get("/users/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }

  res.json(user);
});

// POST /users - Adiciona um novo usuário
app.post("/users", (req: Request, res: Response) => {
  const { id, name, email, isActive } = req.body;

  if (id === undefined || !name || !email || isActive === undefined) {
    return res.status(400).json({ error: "Campos id, name, email e isActive são obrigatórios" });
  }

  const exists = users.find((u) => u.id === id);
  if (exists) {
    return res.status(409).json({ error: "Já existe um usuário com esse id" });
  }

  const newUser: IUser = { id, name, email, isActive };
  users.push(newUser);
  res.status(201).json(newUser);
});

// PUT /users/:id - Atualiza um usuário existente
app.put("/users/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const index = users.findIndex((u) => u.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }

  const { name, email, isActive } = req.body;

  if (!name || !email || isActive === undefined) {
    return res.status(400).json({ error: "Campos name, email e isActive são obrigatórios" });
  }

  users[index] = { id, name, email, isActive };
  res.json(users[index]);
});

// DELETE /users/:id - Remove um usuário
app.delete("/users/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const index = users.findIndex((u) => u.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }

  const deleted = users.splice(index, 1);
  res.json(deleted[0]);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
