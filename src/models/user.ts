// src/models/user.ts
// Modelo de dados do usuário - define a estrutura que um usuário deve ter
// Exportamos a interface para que outros arquivos possam usá-la

export interface IUser {
  id: number;          // Identificador único do usuário
  name: string;        // Nome completo do usuário
  email: string;       // Email do usuário
  isActive: boolean;   // Se o usuário está ativo (true) ou inativo (false)
}