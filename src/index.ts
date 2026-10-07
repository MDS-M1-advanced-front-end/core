// Package core : rempli ensemble en séance 2
// (types générés depuis openapi.yml, client HTTP typé, règles métier, schémas Zod).
export { createApiClient, toApiError } from './api/client';
export type { ApiClient, ApiClientOptions } from './api/client';
export type { ApiError, Result } from './api/result';
export type * from './api/types';
