# Exercício 2 - Tipos Primitivos e Estruturados

## Objetivo
Praticar declaração de variáveis com tipos explícitos em TypeScript, cobrindo todos os tipos básicos e estruturados.

---

## Tipos Implementados

| Tipo | Variável | Valor Exemplo | Descrição |
|------|----------|---------------|-----------|
| `string` | `nomeProduto` | `"Notebook Lenovo"` | Texto |
| `number` | `precoProduto` | `4599.99` | Número (inteiro ou decimal) |
| `boolean` | `emEstoque` | `true` | Verdadeiro/Falso |
| `string[]` | `categorias` | `["Eletrônicos", "Informática"]` | Array de strings |
| `[number, number]` | `coordenadas` | `[-23.5505, -46.6333]` | Tupla (lat, long) |
| `enum` | `StatusPedido` | `Pendente, Processando, Entregue, Cancelado` | Enumeração |

---

## Código (src/app.ts)

```typescript
// Tipos primitivos
const nomeProduto: string = "Notebook Lenovo";
const precoProduto: number = 4599.99;
const emEstoque: boolean = true;

// Array de strings
const categorias: string[] = ["Eletrônicos", "Informática", "Notebooks"];

// Tupla - ordem e tipos fixos
const coordenadas: [number, number] = [-23.5505, -46.6333];

// Enum - valores nomeados para status
enum StatusPedido {
  Pendente = "Pendente",
  Processando = "Processando",
  Entregue = "Entregue",
  Cancelado = "Cancelado",
}

const statusAtual: StatusPedido = StatusPedido.Processando;

// Função com parâmetros tipados
function mensagemProduto(nome: string, preco: number): string {
  return `O produto ${nome} custa R$ ${preco.toFixed(2)}`;
}
```

---

## Conceitos Demonstrados

### Tipagem Explícita vs Inferida
```typescript
// Explícita (recomendada para clareza)
const nome: string = "Produto";

// Inferida (TypeScript deduce o tipo)
const preco = 100; // number
```

### Tupla vs Array
```typescript
// Tupla: tamanho e tipos fixos por posição
const coords: [number, number] = [lat, long];

// Array: tamanho variável, mesmo tipo
const categorias: string[] = ["A", "B", "C"];
```

### Enum
```typescript
// Enum com valores string (legível no JSON/debug)
enum Status {
  Ativo = "ATIVO",
  Inativo = "INATIVO"
}
```

---

## Validações

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ Sem erros |
| `npx eslint src` | ✅ Apenas warning de variável não usada (esperado) |
| `npm run dev` | ✅ Executa e mostra saída formatada |

---

## Saída do Programa
```
O produto Notebook Lenovo custa R$ 4599.99
Categorias: Eletrônicos, Informática, Notebooks
Coordenadas: -23.5505,-46.6333
Status do pedido: Processando
```

---

## Aprendizados
- TypeScript exige tipos em parâmetros de função e retorna
- `enum` cria objeto em runtime (diferente de `type`)
- Tupla garante ordem e quantidade de elementos
- `toFixed(2)` formata casas decimais para moeda