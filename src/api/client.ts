import createClient, { type Middleware } from 'openapi-fetch';
import type { ApiError, Result } from './result';
import type { paths } from './schema';

export interface ApiClientOptions {
  /** URL de base de l'API, par exemple http://localhost:4010 pour le mock Prism */
  baseUrl: string;
  /** Renvoie le jeton d'accès courant, ou null si l'utilisateur n'est pas connecté */
  getAccessToken?: () => string | null | Promise<string | null>;
  /** Implémentation de fetch à utiliser (tests, SSR) ; fetch global par défaut */
  fetch?: (request: Request) => Promise<Response>;
}

export type ApiClient = ReturnType<typeof createApiClient>;

/** Client HTTP typé à partir du contrat openapi.yml */
export function createApiClient({ baseUrl, getAccessToken, fetch }: ApiClientOptions) {
  const client = createClient<paths>({ baseUrl, ...(fetch && { fetch }) });

  if (getAccessToken) {
    // Le jeton est lu à chaque requête : il peut changer après la création du client
    const auth: Middleware = {
      async onRequest({ request }) {
        const token = await getAccessToken();
        if (token) request.headers.set('Authorization', `Bearer ${token}`);
        return request;
      },
    };
    client.use(auth);
  }

  return client;
}

/**
 * Convertit la réponse d'openapi-fetch en Result.
 * Les erreurs réseau (fetch rejeté) deviennent une ApiError de statut 0.
 */
export async function toResult<T>(
  request: Promise<{ data?: T; error?: unknown; response: Response }>,
): Promise<Result<T>> {
  try {
    const { data, error, response } = await request;
    // Le statut HTTP fait foi : une réponse 204 réussie n'a pas de données
    if (response.ok) return { ok: true, data: data as T };
    return { ok: false, error: toApiError(response.status, error) };
  } catch (cause) {
    return {
      ok: false,
      error: {
        status: 0,
        code: 'NETWORK_ERROR',
        message: cause instanceof Error ? cause.message : 'Erreur réseau',
      },
    };
  }
}

// Le schéma Error du contrat n'a aucun champ obligatoire : on complète ce qui manque
function toApiError(status: number, body: unknown): ApiError {
  const fields = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
  return {
    status,
    code: typeof fields.code === 'string' ? fields.code : `HTTP_${status}`,
    message: typeof fields.message === 'string' ? fields.message : `Erreur HTTP ${status}`,
  };
}
