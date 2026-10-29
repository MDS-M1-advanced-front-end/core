import { afterEach, describe, expect, it, vi } from 'vitest';
import { setAccessToken } from '../api/client';
import { graphqlRequest } from './client';

function mockFetch(status: number, body: unknown) {
  const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));
  vi.stubGlobal('fetch', fetch);
  return fetch;
}

afterEach(() => {
  vi.unstubAllGlobals();
  setAccessToken(null);
});

describe('graphqlRequest', () => {
  it('envoie la requête, les variables et le jeton', async () => {
    const fetch = mockFetch(200, { data: { dashboard: { from: null } } });
    setAccessToken('jeton');

    const result = await graphqlRequest('{ dashboard { from } }', { limit: 5 });

    expect(result).toEqual({ ok: true, data: { dashboard: { from: null } } });
    const [url, init] = fetch.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/graphql$/);
    expect(init.headers).toMatchObject({ Authorization: 'Bearer jeton' });
    expect(JSON.parse(init.body as string)).toEqual({
      query: '{ dashboard { from } }',
      variables: { limit: 5 },
    });
  });

  it('reprend le code et le statut des extensions posés par le back', async () => {
    mockFetch(200, {
      data: null,
      errors: [{ message: 'Accès interdit.', extensions: { code: 'FORBIDDEN', status: 403 } }],
    });

    const result = await graphqlRequest('{ dashboard { from } }');

    expect(result).toEqual({
      ok: false,
      error: { status: 403, code: 'FORBIDDEN', message: 'Accès interdit.' },
    });
  });

  it('refuse une réponse partielle', async () => {
    mockFetch(200, {
      data: { dashboard: { from: null } },
      errors: [{ message: 'Erreur interne du serveur.', extensions: { code: 'INTERNAL_ERROR' } }],
    });

    const result = await graphqlRequest('{ dashboard { from } }');

    expect(result.ok).toBe(false);
  });

  it('garde le statut HTTP d’une requête rejetée par le serveur GraphQL', async () => {
    mockFetch(400, {
      errors: [
        { message: 'Cannot query field', extensions: { code: 'GRAPHQL_VALIDATION_FAILED' } },
      ],
    });

    const result = await graphqlRequest('{ inconnu }');

    expect(result).toEqual({
      ok: false,
      error: { status: 400, code: 'GRAPHQL_VALIDATION_FAILED', message: 'Cannot query field' },
    });
  });

  it('donne status 0 sur une erreur réseau', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));

    const result = await graphqlRequest('{ dashboard { from } }');

    expect(result).toEqual({
      ok: false,
      error: { status: 0, code: 'NETWORK_ERROR', message: 'fetch failed' },
    });
  });
});
