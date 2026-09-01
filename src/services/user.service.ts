// src/services/user.service.ts
// Serviço de usuários - camada de NEGÓCIO / casos de uso
// Aplica regras de negócio e coordena o Repository
// NÃO conhece HTTP (req/res) nem detalhes de persistência (JSON/banco)
// Recebe o Repository por INJEÇÃO DE DEPENDÊNCIA (constructor)

import { IUser } from "../models/user";
import { IUserRepository } from "../repositories/user.repository";

export class UserService {
  // Recebe o repository via construtor
  // private readonly = não pode ser trocado depois de criado
  constructor(private readonly userRepository: IUserRepository) {}

  // Retorna TODOS os usuários
  // Delega leitura ao repository
  async getAll(): Promise<IUser[]> {
    return this.userRepository.findAll();
  }

  // Busca usuário por ID
  async getById(id: number): Promise<IUser | undefined> {
    return this.userRepository.findById(id);
  }

  // Cria novo usuário com REGRA DE NEGÓCIO:
  // impedir ID duplicado (regra fica aqui, não no repository!)
  async create(user: IUser): Promise<IUser> {
    // Busca se já existe usuário com mesmo ID
    const exists = await this.userRepository.findById(user.id);

    if (exists) {
      // Regra de negócio violada → erro conhecido
      throw new Error("ID já existe");
    }

    // Regra ok: delega persistência ao repository
    return this.userRepository.create(user);
  }

  // Atualiza usuário existente (atualização parcial)
  async update(id: number, data: Partial<IUser>): Promise<IUser | undefined> {
    // Regra implícita: repository retorna undefined se não existe
    return this.userRepository.update(id, data);
  }

  // Remove usuário
  // Repository retorna boolean (true = removeu, false = não existia)
  async delete(id: number): Promise<boolean> {
    return this.userRepository.delete(id);
  }
}