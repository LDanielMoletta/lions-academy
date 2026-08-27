# Exercício 3 - Interfaces e Tipos Personalizados

## Objetivo
Criar interfaces para modelar entidades do domínio, type aliases para uniões e herança de interfaces.

---

## Definições Criadas

### Interface IUser
```typescript
interface IUser {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}
```

### Interface IProduct
```typescript
interface IProduct {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
  categories: string[];
}
```

### Type Alias - UserRole
```typescript
type UserRole = "admin" | "user";
```
**Diferença de `enum`:** `type` some em tempo de compilação, não gera código JS. Ideal para uniões de literais.

### Interface IAdminUser (Herança)
```typescript
interface IAdminUser extends IUser {
  role: UserRole;
}
```
Herda todos campos de `IUser` e adiciona `role`.

---

## Instâncias Criadas

```typescript
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
```

---

## Funções de Exibição

```typescript
function exibirUsuario(usuario: IUser): void {
  console.log(`ID: ${usuario.id}`);
  console.log(`Nome: ${usuario.name}`);
  console.log(`Email: ${usuario.email}`);
  console.log(`Ativo: ${usuario.isActive ? "Sim" : "Não"}`);
}

function exibirProduto(produto: IProduct): void {
  console.log(`ID: ${produto.id}`);
  console.log(`Nome: ${produto.name}`);
  console.log(`Preço: R$ ${produto.price.toFixed(2)}`);
  console.log(`Em estoque: ${produto.inStock ? "Sim" : "Não"}`);
  console.log(`Categorias: ${produto.categories.join(", ")}`);
}
```

**Nota:** `IAdminUser` funciona onde espera `IUser` (polimorfismo estrutural).

---

## Interface vs Type Alias

| Característica | `interface` | `type` |
|----------------|-------------|--------|
| Herança (`extends`) | ✅ | ✅ (intersection `&`) |
| Declaração múltipla (merge) | ✅ | ❌ |
| Union/Intersection | ❌ | ✅ |
| Primitivos | ❌ | ✅ |
| Tuplas | ❌ | ✅ |

**Regra prática:** Use `interface` para objetos/entidades; `type` para uniões, primitivos, tuplas.

---

## Validações

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ Sem erros |
| `npx eslint src` | ✅ Sem warnings |
| `npm run dev` | ✅ Exibe usuários, produtos e admin |

---

## Saída
```
=== Usuário ===
ID: 1
Nome: Maria Silva
Email: maria@email.com
Ativo: Sim

=== Produto ===
ID: 101
Nome: Mouse Gamer
Preço: R$ 189.90
Em estoque: Sim
Categorias: Periféricos, Games

=== Admin ===
ID: 2
Nome: João Souza
Email: joao@email.com
Ativo: Sim
Role: admin
```

---

## Aprendizados
- Interfaces definem contratos de forma declarativa
- `extends` permite composição e reutilização
- `type` com union (`|`) modela valores discretos
- TypeScript usa tipagem estrutural (duck typing)