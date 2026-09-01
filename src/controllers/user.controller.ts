// src/controllers/user.controller.ts
// Controller de usuários - camada HTTP
// Traduz requisição → chama UserService → monta resposta HTTP
// Tipa params, body, query e resposta com RequestHandler

import { RequestHandler } from "express";
import { IUser } from "../models/user";
import { UserService } from "../services/user.service";
import {
  IdParams,
  EmptyParams,
  EmptyBody,
  CreateUserBody,
  UpdateUserBody,
  UsersQuery,
  UsersResponse,
  UserResponse,
  CreateUserResponse,
  DeleteUserResponse,
} from "../types/http.types";

// Recebe o service por injeção de dependência (montado no server.ts)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ==========================================
  // GET /users - Lista todos
  // Contrato: EmptyParams, UsersResponse, EmptyBody, UsersQuery
  // ==========================================
  listUsers: RequestHandler<EmptyParams, UsersResponse, EmptyBody, UsersQuery> =
    async (req, res, next) => {
      try {
        // req.query.active está tipado: string | undefined
        const active = req.query.active;

        // Busca todos os usuários (await para Promise do service)
        const users = await this.userService.getAll();

        // Filtro opcional por status (?active=true)
        const filtered = active !== undefined
          ? users.filter((u) => u.isActive === (active === "true"))
          : users;

        // Envia exatamente UsersResponse
        res.json({ users: filtered });
      } catch (error) {
        next(error);
      }
    };

  // ==========================================
  // GET /users/:id - Busca por ID
  // Contrato: IdParams, UserResponse, EmptyBody, EmptyParams
  // ==========================================
  getUserById: RequestHandler<IdParams, UserResponse, EmptyBody, EmptyParams> =
    async (req, res, next) => {
      try {
        // req.params.id é string → converte para number
        const id = Number(req.params.id);

        const user = await this.userService.getById(id);

        if (!user) {
          return res.status(404).json({
            error: "UserNotFound",
            message: "Usuário não encontrado",
          });
        }

        res.json({ user });
      } catch (error) {
        next(error);
      }
    };

  // ==========================================
  // POST /users - Cria novo
  // Contrato: EmptyParams, CreateUserResponse, CreateUserBody, EmptyParams
  // ==========================================
  createUser: RequestHandler<EmptyParams, CreateUserResponse, CreateUserBody, EmptyParams> =
    async (req, res, next) => {
      try {
        // req.body já é tipado como IUser pelo contrato
        const userBody = req.body as IUser;

        // Validação runtime: TS não valida JSON recebido
        if (
          userBody.id === undefined ||
          typeof userBody.id !== "number" ||
          typeof userBody.name !== "string" ||
          typeof userBody.email !== "string" ||
          typeof userBody.isActive !== "boolean"
        ) {
          return res.status(400).json({
            error: "ValidationError",
            message: "Campos id (number), name (string), email (string), isActive (boolean) são obrigatórios",
          });
        }

        const created = await this.userService.create(userBody);
        res.status(201).json({ user: created });
      } catch (error) {
        // Regra de negócio "ID já existe" → 409 Conflict
        if (error instanceof Error && error.message === "ID já existe") {
          return res.status(409).json({
            error: "Conflict",
            message: "Já existe um usuário com esse id",
          });
        }
        next(error);
      }
    };

  // ==========================================
  // PUT /users/:id - Atualiza parcial
  // Contrato: IdParams, UserResponse, UpdateUserBody, EmptyParams
  // ==========================================
  updateUser: RequestHandler<IdParams, UserResponse, UpdateUserBody, EmptyParams> =
    async (req, res, next) => {
      try {
        const id = Number(req.params.id);
        const body = req.body;

        // Validação: campos enviados devem ter tipos corretos
        if (
          (body.name !== undefined && typeof body.name !== "string") ||
          (body.email !== undefined && typeof body.email !== "string") ||
          (body.isActive !== undefined && typeof body.isActive !== "boolean")
        ) {
          return res.status(400).json({
            error: "ValidationError",
            message: "Campos inválidos: name (string), email (string), isActive (boolean)",
          });
        }

        // Monta Partial<IUser> apenas com campos enviados
        const updates: Partial<IUser> = {};
        if (body.name !== undefined) updates.name = body.name;
        if (body.email !== undefined) updates.email = body.email;
        if (body.isActive !== undefined) updates.isActive = body.isActive;

        const updated = await this.userService.update(id, updates);

        if (!updated) {
          return res.status(404).json({
            error: "UserNotFound",
            message: "Usuário não encontrado",
          });
        }

        res.json({ user: updated });
      } catch (error) {
        next(error);
      }
    };

  // ==========================================
  // DELETE /users/:id - Remove
  // Contrato: IdParams, DeleteUserResponse, EmptyBody, EmptyParams
  // ==========================================
  deleteUser: RequestHandler<IdParams, DeleteUserResponse, EmptyBody, EmptyParams> =
    async (req, res, next) => {
      try {
        const id = Number(req.params.id);

        // Service precisa retornar o usuário removido para responder 200
        // Aqui reutilizamos getById antes do delete (mantém contrato)
        const user = await this.userService.getById(id);

        if (!user) {
          return res.status(404).json({
            error: "UserNotFound",
            message: "Usuário não encontrado",
          });
        }

        const removed = await this.userService.delete(id);

        if (!removed) {
          return res.status(404).json({
            error: "UserNotFound",
            message: "Usuário não encontrado",
          });
        }

        res.json({ user });
      } catch (error) {
        next(error);
      }
    };
}