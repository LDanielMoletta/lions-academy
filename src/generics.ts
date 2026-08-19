// Exercício 4: Generics

// getData - retorna o mesmo array
function getData<T>(items: T[]): T[] {
  return items;
}

// getById - busca por id
function getById<T extends { id: number }>(items: T[], id: number): T | undefined {
  return items.find((item) => item.id === id);
}

// Interfaces (reutilizando do exercício anterior)
interface IUser {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

interface IProduct {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
  categories: string[];
}

// Demonstrações de getData
const nomes: string[] = ["Ana", "Carlos", "Beatriz"];
const numeros: number[] = [10, 20, 30];
const usuarios: IUser[] = [
  { id: 1, name: "Maria", email: "maria@email.com", isActive: true },
  { id: 2, name: "João", email: "joao@email.com", isActive: false },
];

console.log("=== getData ===");
console.log(getData(nomes));
console.log(getData(numeros));
console.log(getData(usuarios));

// Demonstrações de getById
const produtos: IProduct[] = [
  { id: 101, name: "Teclado", price: 120, inStock: true, categories: ["Periféricos"] },
  { id: 102, name: "Monitor", price: 1500, inStock: false, categories: [" Displays"] },
];

console.log("\n=== getById (usuário) ===");
console.log(getById(usuarios, 1));

console.log("\n=== getById (produto) ===");
console.log(getById(produtos, 102));

console.log("\n=== getById (não encontrado) ===");
console.log(getById(usuarios, 99));
