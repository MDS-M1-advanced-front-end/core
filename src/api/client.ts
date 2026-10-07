import createClient, { type Middleware } from 'openapi-fetch';
import type { paths } from './schema';
import type { ApiError, Result } from './result';

const baseUrl = process.env.API_BASE_URL ?? 'http://localhost:8080/api';

let accessToken: string | null = null;

/**
 * Définit le token envoyé en `Authorization: Bearer` sur chaque requête.
 * @param token - Le token d'accès, ou `null` pour le supprimer.
 */
export function setAccessToken(token: string | null): void {
  accessToken = token;
}

/** Renvoie le token d'accès courant, ou `null` si aucun. */
export function getAccessToken(): string | null {
  return accessToken;
}

const authMiddleware: Middleware = {
  onRequest({ request }) {
    if (accessToken) {
      request.headers.set('Authorization', `Bearer ${accessToken}`);
    }
    return request;
  },
};

/** Client openapi-fetch typé avec le schéma, avec le token bearer ajouté automatiquement. */
export const apiClient = createClient<paths>({ baseUrl });
apiClient.use(authMiddleware);

interface FetchResponse<T> {
  data?: T;
  error?: unknown;
  response: Response;
}

function toApiError(status: number, body: unknown): ApiError {
  const { code, message } = (body ?? {}) as { code?: string; message?: string };
  return {
    status,
    code: code ?? 'HTTP_ERROR',
    message: message ?? `Erreur HTTP ${status}`,
  };
}

/**
 * Exécute un appel openapi-fetch et convertit la réponse en `Result`.
 * Une réponse hors 2xx donne une `ApiError` avec le statut HTTP ; une erreur réseau donne `status: 0`.
 * @param call - La promesse renvoyée par `apiClient.GET/POST/...`.
 */
export async function request<T>(call: Promise<FetchResponse<T>>): Promise<Result<T>> {
  try {
    const { data, error, response } = await call;
    if (!response.ok) {
      return { ok: false, error: toApiError(response.status, error) };
    }
    return { ok: true, data: data as T };
  } catch (e) {
    return {
      ok: false,
      error: {
        status: 0,
        code: 'NETWORK_ERROR',
        message: e instanceof Error ? e.message : 'Erreur réseau',
      },
    };
  }
}
