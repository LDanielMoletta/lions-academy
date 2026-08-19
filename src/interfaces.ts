// Exercício 3: Interfaces e Tipos Personalizados

// Interface IUser
interface IUser {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

// Interface IProduct
interface IProduct {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
  categories: string[];
}

// Type Alias UserRole
type UserRole = "admin" | "user";

// Interface IAdminUser (estende IUser)
interface IAdminUser extends IUser {
  role: UserRole;
}

// Instâncias
const usuario: IUser = {
  id: 1,
  name: "Maria Silva",
  email: "maria@email.com",
  isActive: true,
};

const produto: IProduct = {
  id: 101,
  name: "Mouse Gamer",
  price: 189.9,
  inStock: true,
  categories: ["Periféricos", "Games"],
};

const admin: IAdminUser = {
  id: 2,
  name: "João Souza",
  email: "joao@email.com",
  isActive: true,
  role: "admin",
};

// Função para imprimir usuário
function exibirUsuario(usuario: IUser): void {
  console.log(`ID: ${usuario.id}`);
  console.log(`Nome: ${usuario.name}`);
  console.log(`Email: ${usuario.email}`);
  console.log(`Ativo: ${usuario.isActive ? "Sim" : "Não"}`);
}

// Função para imprimir produto
function exibirProduto(produto: IProduct): void {
  console.log(`ID: ${produto.id}`);
  console.log(`Nome: ${produto.name}`);
  console.log(`Preço: R$ ${produto.price.toFixed(2)}`);
  console.log(`Em estoque: ${produto.inStock ? "Sim" : "Não"}`);
  console.log(`Categorias: ${produto.categories.join(", ")}`);
}

// Saída
console.log("=== Usuário ===");
exibirUsuario(usuario);
console.log("\n=== Produto ===");
exibirProduto(produto);
console.log("\n=== Admin ===");
exibirUsuario(admin);
console.log(`Role: ${admin.role}`);
