# Exercício 4 - Generics

## Objetivo
Entender e aplicar generics para criar funções reutilizáveis que funcionam com qualquer tipo mantendo a tipagem.

---

## Função `getData<T>`

### Assinatura
```typescript
function getData<T>(items: T[]): T[]
```

### Explicação
- `<T>` = parâmetro de tipo (placeholder)
- `items: T[]` = recebe array de qualquer tipo
- `: T[]` = retorna array do **mesmo tipo**
- TypeScript infere `T` baseado no argumento passado

### Uso
```typescript
getData(["Ana", "Carlos"]);     // T = string  → string[]
getData([10, 20, 30]);          // T = number  → number[]
getData([{id:1}, {id:2}]);      // T = {id:number} → {id:number}[]
```

---

## Função `getById<T>`

### Assinatura
```typescript
function getById<T extends { id: number }>(items: T[], id: number): T | undefined
```

### Constraint `extends { id: number }`
Garante que `T` **tem** a propriedade `id: number`.
- Permite acessar `item.id` dentro da função
- Rejeita arrays de tipos sem `id` (ex: `string[]`, `number[]`)

### Implementação
```typescript
function getById<T extends { id: number }>(items: T[], id: number): T | undefined {
  return items.find((item) => item.id === id);
}
```

### Uso
```typescript
getById(usuarios, 1);    // T = IUser    → IUser | undefined
getById(produtos, 102);  // T = IProduct → IProduct | undefined
getById(["a", "b"], 1);  // ❌ Erro: string não tem .id
```

---

## Código Completo (src/generics.ts)

```typescript
function getData<T>(items: T[]): T[] {
  return items;
}

function getById<T extends { id: number }>(items: T[], id: number): T | undefined {
  return items.find((item) => item.id === id);
}

// Testes
const nomes = ["Ana", "Carlos", "Beatriz"];
const numeros = [10, 20, 30];
const usuarios = [
  { id: 1, name: "Maria", email: "maria@email.com", isActive: true },
  { id: 2, name: "João", email: "joao@email.com", isActive: false },
];
const produtos = [
  { id: 101, name: "Teclado", price: 120, inStock: true, categories: ["Periféricos"] },
  { id: 102, name: "Monitor", price: 1500, inStock: false, categories: ["Displays"] },
];

console.log(getData(nomes));
console.log(getData(numeros));
console.log(getData(usuarios));

console.log(getById(usuarios, 1));
console.log(getById(produtos, 102));
console.log(getById(usuarios, 99)); // undefined
```

---

## Conceitos-Chave

| Conceito | Descrição |
|----------|-----------|
| **Type Parameter** | `<T>` - placeholder para tipo real |
| **Inferência** | TS deduce `T` pelo argumento |
| **Constraint** | `extends` limita quais tipos são aceitos |
| **Retorno condicional** | `T | undefined` - pode não encontrar |

---

## Validações

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ Sem erros |
| `npx eslint src` | ✅ Sem warnings |
| `npm run dev` | ✅ Executa todos exemplos |

---

## Saída
```
=== getData ===
[ 'Ana', 'Carlos', 'Beatriz' ]
[ 10, 20, 30 ]
[ { id: 1, name: 'Maria', ... }, { id: 2, name: 'João', ... } ]

=== getById (usuário) ===
{ id: 1, name: 'Maria', email: 'maria@email.com', isActive: true }

=== getById (produto) ===
{ id: 102, name: 'Monitor', price: 1500, inStock: false, ... }

=== getById (não encontrado) ===
undefined
```

---

## Quando Usar Generics
- Funções que operam em coleções (map, filter, find, etc.)
- Classes container (Queue, Stack, Repository)
- APIs que precisam preservar tipo de entrada na saída
- Evita `any` mantendo type safety