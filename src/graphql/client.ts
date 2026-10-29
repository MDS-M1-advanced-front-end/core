import { baseUrl, getAccessToken } from '../api/client';
import type { ApiError, Result } from '../api/result';

/** Point d'entrée GraphQL de l'administration. */
const graphqlUrl = `${baseUrl}/graphql`;

interface GraphQLErrorBody {
  message: string;
  extensions?: { code?: string; status?: number };
}

interface GraphQLResponse<T> {
  data?: T | null;
  errors?: GraphQLErrorBody[];
}

/**
 * Première erreur GraphQL au format `ApiError` : `code` et `status` viennent des `extensions`
 * posées par le back (mêmes codes qu'en REST). Une requête mal formée ou hors schéma est rejetée
 * avant le back, en HTTP 400, avec un code du serveur GraphQL (`GRAPHQL_VALIDATION_FAILED`…).
 * @param status - Statut HTTP de la réponse.
 * @param error - Première entrée de `errors`, absente si le corps n'est pas du GraphQL.
 */
function toApiError(status: number, error: GraphQLErrorBody | undefined): ApiError {
  return {
    status: error?.extensions?.status ?? status,
    code: error?.extensions?.code ?? 'HTTP_ERROR',
    message: error?.message ?? `Erreur HTTP ${status}`,
  };
}

/**
 * Exécute une requête GraphQL d'administration, avec le token d'accès courant.
 * Une réponse avec des `errors` est une erreur, même si une partie des données est présente :
 * un tableau de bord partiel serait trompeur.
 * @param query - Texte de la requête (voir `operations.ts` pour un exemple).
 * @param variables - Variables de la requête.
 * @returns Les données, ou la première erreur ; une erreur réseau donne `status: 0`.
 */
export async function graphqlRequest<TData>(
  query: string,
  variables?: object,
): Promise<Result<TData>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const response = await fetch(graphqlUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
    });
    const body = (await response.json().catch(() => ({}))) as GraphQLResponse<TData>;
    if (!response.ok || body.errors?.length || !body.data) {
      return { ok: false, error: toApiError(response.status, body.errors?.[0]) };
    }
    return { ok: true, data: body.data };
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
