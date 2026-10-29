import type { CodegenConfig } from '@graphql-codegen/cli';

// Types seulement, aucun code à l'exécution : unions de chaînes plutôt qu'enum TypeScript
const config = {
  enumsAsTypes: true,
  useTypeImports: true,
  scalars: { Date: 'string', ID: 'string' },
};

// pnpm generate:graphql : types du schéma admin.graphql, et ceux des requêtes de operations.ts
// (dans un fichier à part : typescript-operations redéclare les enums qu'il utilise)
const codegen: CodegenConfig = {
  schema: 'admin.graphql',
  documents: 'src/graphql/operations.ts',
  generates: {
    'src/graphql/schema.ts': {
      plugins: ['typescript'],
      config: { ...config, avoidOptionals: { field: true, object: true } },
    },
    'src/graphql/operations.generated.ts': { plugins: ['typescript-operations'], config },
  },
};

export default codegen;
