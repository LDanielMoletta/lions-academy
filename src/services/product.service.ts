// src/services/product.service.ts
// Serviço de Produtos - encapsula TODA a lógica de negócio e manipulação do array
// Lança AppError quando regras de negócio são violadas (erros esperados)
// NÃO conhece HTTP (Request, Response, status codes) - só tipos de domínio

import { IProduct } from "../models/product";
import { AppError } from "../errors/app-error";

export class ProductService {
  // Array privado - só esta classe acessa diretamente
  // Dados iniciais para teste
  private products: IProduct[] = [
    { id: 1, name: "Notebook Dell", price: 3500, inStock: true, categories: ["Informática", "Notebooks"] },
    { id: 2, name: "Mouse Logitech", price: 150, inStock: true, categories: ["Periféricos", "Acessórios"] },
    { id: 3, name: "Teclado Mecânico", price: 400, inStock: false, categories: ["Periféricos", "Teclados"] },
  ];

  // Retorna todos os produtos (cópia para proteger array interno)
  getAll(): IProduct[] {
    return [...this.products];
  }

  // Busca produto por ID
  // Retorna undefined se não encontrado (não lança erro - deixamos a rota decidir)
  getById(id: number): IProduct | undefined {
    return this.products.find((product) => product.id === id);
  }

  // Cria novo produto com validações de negócio
  create(product: IProduct): IProduct {
    // Validação: ID não pode ser duplicado
    const exists = this.products.find((p) => p.id === product.id);
    if (exists) {
      throw new AppError("Já existe um produto com esse id", 409); // 409 Conflict
    }

    // Validação: nome é obrigatório e não pode ser vazio
    if (!product.name || product.name.trim() === "") {
      throw new AppError("Nome do produto é obrigatório", 400); // 400 Bad Request
    }

    // Validação: preço deve ser número positivo
    if (typeof product.price !== "number" || product.price <= 0) {
      throw new AppError("Preço deve ser um número maior que zero", 400);
    }

    // Validação: categories deve ser array de strings
    if (!Array.isArray(product.categories) || product.categories.some((c) => typeof c !== "string")) {
      throw new AppError("Categorias deve ser um array de strings", 400);
    }

    // Tudo válido - adiciona ao array
    this.products.push(product);
    return product;
  }

  // Atualiza produto (atualização parcial com Partial<IProduct>)
  // Lança AppError se não encontrado
  update(id: number, data: Partial<IProduct>): IProduct {
    const index = this.products.findIndex((p) => p.id === id);

    if (index === -1) {
      throw new AppError("Produto não encontrado", 404); // 404 Not Found
    }

    // Validações apenas dos campos que vieram no data
    if (data.name !== undefined) {
      if (!data.name || data.name.trim() === "") {
        throw new AppError("Nome do produto não pode ser vazio", 400);
      }
    }

    if (data.price !== undefined) {
      if (typeof data.price !== "number" || data.price <= 0) {
        throw new AppError("Preço deve ser um número maior que zero", 400);
      }
    }

    if (data.categories !== undefined) {
      if (!Array.isArray(data.categories) || data.categories.some((c) => typeof c !== "string")) {
        throw new AppError("Categorias deve ser um array de strings", 400);
      }
    }

    // Merge: mantém campos atuais e sobrescreve só o que veio
    this.products[index] = { ...this.products[index], ...data };
    return this.products[index];
  }

  // Remove produto
  // Lança AppError se não encontrado
  delete(id: number): IProduct {
    const index = this.products.findIndex((p) => p.id === id);

    if (index === -1) {
      throw new AppError("Produto não encontrado", 404);
    }

    const removed = this.products.splice(index, 1)[0];
    return removed;
  }
}