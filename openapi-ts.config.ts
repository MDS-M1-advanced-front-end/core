import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: './openapi.yml',
  output: 'src/api/generated',
  plugins: [
    '@hey-api/client-fetch',
    '@hey-api/typescript',
    'zod',
    { name: '@hey-api/sdk', validator: true },
  ],
});
