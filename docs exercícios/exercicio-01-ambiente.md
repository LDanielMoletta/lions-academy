# Exercício 1 - Configuração do Ambiente TypeScript

## Objetivo
Configurar um projeto Node.js com TypeScript, ferramentas de desenvolvimento e qualidade de código.

---

## Tecnologias Utilizadas

| Ferramenta | Versão | Finalidade |
|------------|--------|------------|
| TypeScript | 5.9.x | Superset tipado do JavaScript |
| ts-node | 10.9.x | Execução direta de arquivos `.ts` |
| nodemon | 3.1.x | Reinício automático em desenvolvimento |
| ESLint | 10.8.x | Linter para TypeScript (flat config) |
| typescript-eslint | 8.67.x | Regras TypeScript para ESLint |

---

## Estrutura de Arquivos Criados

```
lions-academy/
├── package.json          # Configuração do projeto e scripts
├── tsconfig.json         # Configuração do compilador TypeScript
├── nodemon.json          # Configuração do nodemon para TS
├── eslint.config.js      # Configuração ESLint (flat config v10)
├── .gitignore            # Arquivos ignorados pelo Git
├── .vscode/
│   ├── settings.json     # Configurações do VS Code (IntelliSense, formatação)
│   └── extensions.json   # Extensões recomendadas
└── src/
    └── index.ts          # Arquivo de teste inicial
```

---

## Configurações Principais

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "types": ["node"]
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

**Decisões importantes:**
- `strict: true` - Ativa todas as verificações estritas de tipo
- `types: ["node"]` - Garante tipos do Node.js (`console`, `process`, etc.)
- `outDir: "./dist"` - Separa código compilado do fonte

### Scripts no package.json
```json
{
  "scripts": {
    "dev": "nodemon",           // Desenvolvimento com hot-reload
    "build": "tsc",             // Compilação para JavaScript
    "start": "node dist/index.js", // Execução em produção
    "lint": "eslint src",       // Verificação de código
    "lint:fix": "eslint src --fix" // Correção automática
  }
}
```

---

## Validações Realizadas

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | ✅ Sem erros de tipo |
| `npx eslint src` | ✅ Sem warnings |
| `npm run dev` | ✅ Servidor inicia e recarrega em mudanças |
| `npm run build` | ✅ Gera arquivos em `dist/` |

---

## Conclusão
Ambiente totalmente configurado e funcional para desenvolvimento TypeScript com:
- Tipagem estática rigorosa
- Hot-reload em desenvolvimento
- Linting automatizado
- Configuração de IDE otimizada