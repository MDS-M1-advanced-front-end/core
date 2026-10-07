// Package core : rempli ensemble en séance 2
// (types générés depuis openapi.yml, client HTTP typé, règles métier, schémas Zod).
export { createApiClient, toResult } from './api/client';
export type { ApiClient, ApiClientOptions } from './api/client';
export { createApi } from './api/endpoints';
export type { Api } from './api/endpoints';
export type { ApiError, Result } from './api/result';
export type { components, paths } from './api/schema';
