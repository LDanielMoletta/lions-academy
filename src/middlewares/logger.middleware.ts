// src/middlewares/logger.middleware.ts
// Middleware de log - registra informações de cada requisição que passa pelo servidor
// Um middleware é uma função que executa ANTES das rotas, podendo inspecionar, modificar
// ou apenas observar a requisição antes de passar para a próxima etapa (next)

import { Request, Response, NextFunction } from "express";

// Tipamos os 3 parâmetros padrão do Express:
// - Request: contém dados da requisição (método, URL, headers, body, params, etc.)
// - Response: usado para enviar a resposta ao cliente
// - NextFunction: função que chama o próximo middleware/rota na cadeia
export function loggerMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  // Obtém o método HTTP (GET, POST, PUT, DELETE, etc.)
  const metodo = req.method;

  // Obtém a URL original acessada (inclui parâmetros de rota como /users/1)
  const url = req.originalUrl;

  // Gera timestamp no formato ISO (ex: 2026-08-25T19:45:30.123Z)
  const timestamp = new Date().toISOString();

  // Exibe no terminal do servidor (não na resposta ao cliente)
  // Formato: [timestamp] METODO /url
  console.log(`[${timestamp}] ${metodo} ${url}`);

  // IMPORTANTE: chamamos next() para liberar o fluxo para o próximo middleware/rota
  // Se não chamarmos next(), a requisição ficará "pendurada" indefinidamente
  next();
}