import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // src/api/schema.ts : généré par openapi-typescript (séance 2)
  // src/graphql/schema.ts et operations.generated.ts : générés par graphql-codegen
  {
    ignores: [
      'node_modules',
      'src/api/schema.ts',
      'src/graphql/schema.ts',
      'src/graphql/operations.generated.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      // Autorise `${nombre}` dans les template strings (cas très courant, sans risque)
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
    },
  },
  {
    files: ['**/*.js'],
    ...tseslint.configs.disableTypeChecked,
  },
);
