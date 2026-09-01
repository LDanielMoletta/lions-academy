// src/controllers/product.controller.ts
// Controller de produtos - camada HTTP
// Traduz requisição → chama ProductService → monta resposta HTTP
// Tipa params, body, query e resposta com RequestHandler

import { RequestHandler } from "express";
import { IProduct } from "../models/product";
import { ProductService } from "../services/product.service";
import {
  IdParams,
  EmptyParams,
  EmptyBody,
  CreateProductBody,
  UpdateProductBody,
  ProductQuery,
  ProductsResponse,
  ProductResponse,
  CreateProductResponse,
  DeleteProductResponse,
} from "../types/http.types";

export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // ==========================================
  // GET /products - Lista todos
  // Contrato: EmptyParams, ProductsResponse, EmptyBody, ProductQuery
  // ==========================================
  listProducts: RequestHandler<EmptyParams, ProductsResponse, EmptyBody, ProductQuery> =
    async (req, res, next) => {
      try {
        // Filtros de query tipados: req.query.name, req.query.maxPrice
        const name = req.query.name;
        const maxPrice = req.query.maxPrice;

        let products = this.productService.getAll();

        // Filtro opcional por nome (?name=teclado)
        if (name !== undefined) {
          products = products.filter((p) =>
            p.name.toLowerCase().includes(name.toLowerCase())
          );
        }

        // Filtro opcional por preço máximo (?maxPrice=500)
        if (maxPrice !== undefined) {
          const max = Number(maxPrice);
          if (!Number.isNaN(max)) {
            products = products.filter((p) => p.price <= max);
          }
        }

        res.json({ products });
      } catch (error) {
        next(error);
      }
    };

  // ==========================================
  // GET /products/:id - Busca por ID
  // Contrato: IdParams, ProductResponse, EmptyBody, EmptyParams
  // ==========================================
  getProductById: RequestHandler<IdParams, ProductResponse, EmptyBody, EmptyParams> =
    (req, res, next) => {
      try {
        const id = Number(req.params.id);
        const product = this.productService.getById(id);

        if (!product) {
          return res.status(404).json({
            error: "ProductNotFound",
            message: "Produto não encontrado",
          });
        }

        res.json({ product });
      } catch (error) {
        next(error);
      }
    };

  // ==========================================
  // POST /products - Cria novo
  // Contrato: EmptyParams, CreateProductResponse, CreateProductBody, EmptyParams
  // ==========================================
  createProduct: RequestHandler<EmptyParams, CreateProductResponse, CreateProductBody, EmptyParams> =
    (req, res, next) => {
      try {
        const productBody = req.body as IProduct;

        // Validação runtime básica
        if (
          productBody.id === undefined ||
          typeof productBody.id !== "number" ||
          typeof productBody.name !== "string" ||
          typeof productBody.price !== "number" ||
          typeof productBody.inStock !== "boolean" ||
          !Array.isArray(productBody.categories)
        ) {
          return res.status(400).json({
            error: "ValidationError",
            message: "Campos id (number), name (string), price (number), inStock (boolean), categories (string[]) são obrigatórios",
          });
        }

        const created = this.productService.create(productBody);
        res.status(201).json({ product: created });
      } catch (error) {
        next(error);
      }
    };

  // ==========================================
  // PUT /products/:id - Atualiza parcial
  // Contrato: IdParams, ProductResponse, UpdateProductBody, EmptyParams
  // ==========================================
  updateProduct: RequestHandler<IdParams, ProductResponse, UpdateProductBody, EmptyParams> =
    (req, res, next) => {
      try {
        const id = Number(req.params.id);
        const body = req.body;

        // Validação: campos enviados devem ter tipos corretos
        if (
          (body.name !== undefined && typeof body.name !== "string") ||
          (body.price !== undefined && typeof body.price !== "number") ||
          (body.inStock !== undefined && typeof body.inStock !== "boolean") ||
          (body.categories !== undefined && !Array.isArray(body.categories))
        ) {
          return res.status(400).json({
            error: "ValidationError",
            message: "Campos inválidos: name (string), price (number), inStock (boolean), categories (string[])",
          });
        }

        const updates: Partial<IProduct> = {};
        if (body.name !== undefined) updates.name = body.name;
        if (body.price !== undefined) updates.price = body.price;
        if (body.inStock !== undefined) updates.inStock = body.inStock;
        if (body.categories !== undefined) updates.categories = body.categories;

        const updated = this.productService.update(id, updates);
        res.json({ product: updated });
      } catch (error) {
        // AppError (Produto não encontrado / validação) vai pro errorHandler global
        next(error);
      }
    };

  // ==========================================
  // DELETE /products/:id - Remove
  // Contrato: IdParams, DeleteProductResponse, EmptyBody, EmptyParams
  // ==========================================
  deleteProduct: RequestHandler<IdParams, DeleteProductResponse, EmptyBody, EmptyParams> =
    (req, res, next) => {
      try {
        const id = Number(req.params.id);
        const product = this.productService.getById(id);

        if (!product) {
          return res.status(404).json({
            error: "ProductNotFound",
            message: "Produto não encontrado",
          });
        }

        const removed = this.productService.delete(id);
        res.json({ product: removed });
      } catch (error) {
        next(error);
      }
    };
}