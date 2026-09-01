// src/types/http.types.ts
// Tipos de apoio para os contratos HTTP (RequestHandler)
// RequestHandler<Params, ResBody, ReqBody, Query> - ordem IMPORTANTE

import { IUser } from "../models/user";
import { IProduct } from "../models/product";

// ==========================================
// PARAMS (parâmetros de URL)
// ==========================================

// Para rotas /:id → o id chega como string (vem da URL)
export type IdParams = { id: string };

// Rotas sem parâmetro de URL
// Record<string, never> proíbe qualquer propriedade
export type EmptyParams = Record<string, never>;

// ==========================================
// REQBODY (corpo da requisição)
// ==========================================

// Rota sem corpo (GET, DELETE)
export type EmptyBody = Record<string, never>;

// Corpo de criação de usuário → IUser completa
export type CreateUserBody = IUser;

// Corpo de atualização de usuário → campos opcionais
export type UpdateUserBody = Partial<IUser>;

// Corpo de criação de produto → IProduct completa
export type CreateProductBody = IProduct;

// Corpo de atualização de produto → campos opcionais
export type UpdateProductBody = Partial<IProduct>;

// ==========================================
// QUERY (parâmetros após '?')
// ==========================================

// Filtros na listagem de usuários: ?active=true
export type UsersQuery = {
  active?: string; // chega como string ('true'/'false')
};

// Filtros na listagem de produtos: ?name=X&maxPrice=Y
export type ProductQuery = {
  name?: string;
  maxPrice?: string; // chega como string, conversão é feita no handler
};

// ==========================================
// RESBODY (formato da resposta)
// ==========================================

// Erro padronizado (usado nas respostas de erro)
export type MessageResponse = { error: string; message: string };

// Sucesso: lista de usuários
export type UsersResponse = { users: IUser[] };

// Sucesso: um usuário | erro de 404
export type UserResponse = { user: IUser } | MessageResponse;

// Sucesso: usuário criado (201) | erro de validação/conflito
export type CreateUserResponse =
  | { user: IUser }
  | MessageResponse;

// Sucesso: lista de produtos
export type ProductsResponse = { products: IProduct[] };

// Sucesso: um produto | erro de 404
export type ProductResponse = { product: IProduct } | MessageResponse;

// Sucesso: produto criado (201) | erro
export type CreateProductResponse =
  | { product: IProduct }
  | MessageResponse;

// DELETE: 200 com o item removido (mantém contrato do Exercício 5)
export type DeleteUserResponse = { user: IUser } | MessageResponse;

// DELETE produto: item removido
export type DeleteProductResponse = { product: IProduct } | MessageResponse;