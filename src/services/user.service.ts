// src/services/user.service.ts
// Serviço de usuários - encapsula TODA a lógica de manipulação do array de usuários
// As rotas (server.ts) NÃO devem manipular o array diretamente
// Isso separa responsabilidades: rotas = HTTP, serviço = regras de negócio/dados

import { IUser } from "../models/user";

export class UserService {
  // Array privado: só esta classe pode acessar/modificar diretamente
  // Inicializamos com os usuários iniciais (mesmos do Exercício 5)
  private users: IUser[] = [
    { id: 1, name: "Maria Silva", email: "maria@email.com", isActive: true },
    { id: 2, name: "João Souza", email: "joao@email.com", isActive: true },
  ];

  // Retorna TODOS os usuários (cópia do array para evitar modificação externa)
  // Tipo de retorno: IUser[] (array de usuários)
  getAll(): IUser[] {
    // Retornamos cópia ([...]) para que código externo não altere o array interno acidentalmente
    return [...this.users];
  }

  // Busca usuário por ID
  // Retorna IUser | undefined (pode não encontrar)
  getById(id: number): IUser | undefined {
    // find retorna o primeiro elemento que satisfaz a condição, ou undefined
    return this.users.find((user) => user.id === id);
  }

  // Cria novo usuário
  // Recebe IUser completo (todos os campos obrigatórios)
  // Retorna o usuário criado
  create(user: IUser): IUser {
    // Verifica se já existe usuário com mesmo ID (evita duplicatas)
    const exists = this.users.find((u) => u.id === user.id);
    if (exists) {
      // Lançamos erro para a rota tratar como conflito (409)
      throw new Error("ID já existe");
    }

    // Adiciona ao array interno
    this.users.push(user);
    return user;
  }

  // Atualiza usuário existente
  // Recebe ID e Partial<IUser> (campos opcionais - atualização parcial)
  // Retorna usuário atualizado | undefined (se não encontrado)
  update(id: number, data: Partial<IUser>): IUser | undefined {
    // Encontra índice do usuário no array
    const index = this.users.findIndex((u) => u.id === id);

    // Se não encontrado, retorna undefined
    if (index === -1) {
      return undefined;
    }

    // Combina dados atuais com novos dados (spread operator ...)
    // Partial<IUser> permite enviar apenas os campos que deseja alterar
    // Ex: { name: "Novo Nome" } - mantém email e isActive atuais
    this.users[index] = { ...this.users[index], ...data };

    // Retorna usuário atualizado
    return this.users[index];
  }

  // Remove usuário por ID
  // Retorna usuário removido | undefined (se não encontrado)
  delete(id: number): IUser | undefined {
    const index = this.users.findIndex((u) => u.id === id);

    if (index === -1) {
      return undefined;
    }

    // splice remove 1 elemento no índice e retorna array com o removido
    // [0] pega o objeto removido (splice retorna array)
    const removed = this.users.splice(index, 1)[0];
    return removed;
  }
}