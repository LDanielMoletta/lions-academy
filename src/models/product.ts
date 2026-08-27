// src/models/product.ts
// Interface do Produto - define a estrutura dos dados de um produto
// Baseado no Exercício 3 (IProduct)

export interface IProduct {
  id: number;           // Identificador único
  name: string;         // Nome do produto
  price: number;        // Preço (deve ser > 0)
  inStock: boolean;     // Se tem em estoque
  categories: string[]; // Lista de categorias
}