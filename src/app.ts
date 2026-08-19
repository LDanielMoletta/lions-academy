// Tipos Primitivos e Estruturados

// String
const nomeProduto: string = "Notebook Lenovo";

// Number
const precoProduto: number = 4599.99;

// Boolean
const emEstoque: boolean = true;

// Array de strings
const categorias: string[] = ["Eletrônicos", "Informática", "Notebooks"];

// Tupla
const coordenadas: [number, number] = [-23.5505, -46.6333];

// Enum
enum StatusPedido {
  Pendente = "Pendente",
  Processando = "Processando",
  Entregue = "Entregue",
  Cancelado = "Cancelado",
}

const statusAtual: StatusPedido = StatusPedido.Processando;

// Função formatada
function mensagemProduto(nome: string, preco: number): string {
  return `O produto ${nome} custa R$ ${preco.toFixed(2)}`;
}

console.log(mensagemProduto(nomeProduto, precoProduto));
console.log(`Em estoque: ${emEstoque ? "Sim" : "Não"}`);
console.log(`Categorias: ${categorias.join(", ")}`);
console.log(`Coordenadas: ${coordenadas}`);
console.log(`Status do pedido: ${statusAtual}`);
