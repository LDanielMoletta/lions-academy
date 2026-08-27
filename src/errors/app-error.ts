// src/errors/app-error.ts
// AppError representa um erro CONHECIDO pela aplicação
// Diferente do Error nativo do JavaScript, ele carrega também o código HTTP
// que deve ser usado na resposta ao cliente

export class AppError extends Error {
  // Propriedade pública e somente leitura - não pode ser alterada após criação
  // readonly garante que o statusCode não muda acidentalmente
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    // super(message) é OBRIGATÓRIO quando uma classe estende Error
    // Isso inicializa a mensagem do erro pai (Error) corretamente
    // Sem isso, error.message seria undefined ou vazio
    super(message);

    // Define o código HTTP que será usado na resposta
    this.statusCode = statusCode;

    // Define o nome do erro para facilitar identificação em logs/debug
    // Por padrão seria "Error", mas queremos "AppError" para distinguir
    this.name = "AppError";

    // Captura a stack trace correta (aponta para onde o erro foi lançado, não para o construtor)
    // Isso só funciona em ambientes V8 (Node.js, Chrome, etc.)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}