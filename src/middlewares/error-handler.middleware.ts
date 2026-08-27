// src/middlewares/error-handler.middleware.ts
// Middleware GLOBAL de tratamento de erros
// O Express identifica middlewares de erro pela assinatura com 4 parâmetros: (error, req, res, next)
// IMPORTANTE: deve ser registrado DEPOIS de todas as rotas (no final do server.ts)

import { ErrorRequestHandler, Response } from "express";
import { AppError } from "../errors/app-error";

// Tipamos como ErrorRequestHandler do Express - isso garante a assinatura correta
// (error, req, res, next) => void
export const errorHandler: ErrorRequestHandler = (
  error: unknown,  // O erro que foi lançado (throw) ou passado para next(error)
  _req: unknown,   // Request - não usamos aqui, mas precisa estar na assinatura
  res: Response,   // Response - usamos para enviar a resposta de erro
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
   _next: unknown,   // NextFunction - não chamamos next() aqui pois é o fim da linha
): void => {
  // Verifica se o erro é uma instância de AppError (erro conhecido/esperado)
  // Ex: produto não encontrado, validação falhou, regra de negócio violada
  if (error instanceof AppError) {
    // Retorna o statusCode e message que o AppError carrega
    // NÃO enviamos error.stack para o cliente - isso expõe detalhes internos
    res.status(error.statusCode).json({
      error: error.name,        // "AppError"
      message: error.message,   // Mensagem amigável pro cliente
    });
    return;
  }

  // Se chegou aqui, é um erro INESPERADO (bug, erro de programação, banco caiu, etc.)
  // Logamos no servidor para debug, mas não expomos detalhes pro cliente
  console.error("Erro inesperado:", error);

  // Resposta genérica para não vazar informações internas
  // 500 = Internal Server Error
  res.status(500).json({
    error: "InternalServerError",
    message: "Erro interno do servidor",
  });
};