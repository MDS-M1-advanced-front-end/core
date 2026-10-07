import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // src/api/generated : généré par @hey-api/openapi-ts (pnpm gen)
  { ignores: ['node_modules', 'src/api/generated'] },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: { allowDefaultProject: ['openapi-ts.config.ts'] },
        tsconfigRootDir: import.meta.dirname,
      },
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
