// src/repositories/user.repository.ts
// Repository = camada de PERSISTÊNCIA de dados
// Esconde COMO os dados são armazenados (JSON aqui)
// Não conhece HTTP (Request/Response) nem regras de negócio
// Contrato assíncrono (Promise) para permitir trocar JSON por banco depois

import { readFile, writeFile } from "node:fs/promises";
import { IUser } from "../models/user";

// Caminho do arquivo JSON de persistência
const USERS_FILE = __dirname + "/../data/users.json";

// Interface do contrato do Repository
// UserService depende DESTA interface, não da implementação
export interface IUserRepository {
  findAll(): Promise<IUser[]>;
  findById(id: number): Promise<IUser | undefined>;
  create(user: IUser): Promise<IUser>;
  update(id: number, data: Partial<IUser>): Promise<IUser | undefined>;
  delete(id: number): Promise<boolean>;
}

// Implementação concreta com persistência em JSON
export class UserRepository implements IUserRepository {
  // Método privado: lê usuários do arquivo JSON
  // Trata arquivo inexistente ou inválido retornando []
  private async readUsers(): Promise<IUser[]> {
    try {
      const raw = await readFile(USERS_FILE, "utf-8");
      const users = JSON.parse(raw) as IUser[];
      // Proteção: se arquivo estiver vazio, retorna array
      return Array.isArray(users) ? users : [];
    } catch {
      // Arquivo ainda não existe (primeira execução) - começa vazio
      return [];
    }
  }

  // Método privado: grava usuários no arquivo JSON
  // writeFile sobrescreve o arquivo inteiro
  private async writeUsers(users: IUser[]): Promise<void> {
    await writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  }

  // Retorna todos os usuários
  async findAll(): Promise<IUser[]> {
    return this.readUsers();
  }

  // Busca usuário por ID
  async findById(id: number): Promise<IUser | undefined> {
    const users = await this.readUsers();
    return users.find((user) => user.id === id);
  }

  // Cria novo usuário e persiste
  async create(user: IUser): Promise<IUser> {
    const users = await this.readUsers();
    users.push(user);
    await this.writeUsers(users);
    return user;
  }

  // Atualiza usuário (merge parcial) e persiste
  async update(id: number, data: Partial<IUser>): Promise<IUser | undefined> {
    const users = await this.readUsers();
    const index = users.findIndex((u) => u.id === id);

    // Não encontrou: retorna undefined (Service decide o erro)
    if (index === -1) {
      return undefined;
    }

    // Merge: preserva campos não enviados
    users[index] = { ...users[index], ...data };
    await this.writeUsers(users);
    return users[index];
  }

  // Remove usuário e persiste
  // Retorna true se removeu, false se não encontrou
  async delete(id: number): Promise<boolean> {
    const users = await this.readUsers();
    const index = users.findIndex((u) => u.id === id);

    if (index === -1) {
      return false;
    }

    users.splice(index, 1);
    await this.writeUsers(users);
    return true;
  }
}