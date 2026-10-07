import { describe, expect, it, vi } from 'vitest';
import { createApiClient, toResult } from './client';

const baseUrl = 'http://api.test';
const roomId = '00000000-0000-4000-8000-100000000001';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Faux fetch qui mémorise les requêtes reçues
function fakeFetch(response: () => Response | Promise<Response>) {
  return vi.fn<(request: Request) => Promise<Response>>(() => Promise.resolve(response()));
}

function sentRequest(fetch: ReturnType<typeof fakeFetch>): Request {
  const request = fetch.mock.calls[0]?.[0];
  if (!request) throw new Error('Aucune requête envoyée');
  return request;
}

describe('createApiClient', () => {
  it('appelle la bonne URL avec les paramètres de chemin', async () => {
    const fetch = fakeFetch(() => json([]));
    const api = createApiClient({ baseUrl, fetch });

    await api.GET('/rooms/{roomId}/availability', {
      params: { path: { roomId }, query: { date: '2026-10-12' } },
    });

    expect(sentRequest(fetch).url).toBe(`${baseUrl}/rooms/${roomId}/availability?date=2026-10-12`);
  });

  it('ajoute le jeton Bearer quand il y en a un', async () => {
    const fetch = fakeFetch(() => json({}));
    const api = createApiClient({ baseUrl, fetch, getAccessToken: () => 'abc' });

    await api.GET('/auth/me');

    expect(sentRequest(fetch).headers.get('Authorization')).toBe('Bearer abc');
  });

  it("n'ajoute pas d'en-tête Authorization sans jeton", async () => {
    const fetch = fakeFetch(() => json({}));
    const api = createApiClient({ baseUrl, fetch, getAccessToken: () => null });

    await api.GET('/auth/me');

    expect(sentRequest(fetch).headers.has('Authorization')).toBe(false);
  });

  it('lit le jeton à chaque requête (connexion après création du client)', async () => {
    let token: string | null = null;
    const fetch = fakeFetch(() => json({}));
    const api = createApiClient({ baseUrl, fetch, getAccessToken: () => Promise.resolve(token) });

    token = 'nouveau';
    await api.GET('/auth/me');

    expect(sentRequest(fetch).headers.get('Authorization')).toBe('Bearer nouveau');
  });
});

describe('toResult', () => {
  it('renvoie ok avec les données en cas de succès', async () => {
    const reservation = { id: '1', status: 'CONFIRMED' };
    const api = createApiClient({ baseUrl, fetch: fakeFetch(() => json(reservation)) });

    const result = await toResult(
      api.POST('/reservations/{reservationId}/confirm', {
        params: { path: { reservationId: '1' } },
      }),
    );

    expect(result).toEqual({ ok: true, data: reservation });
  });

  it('renvoie ok sans données pour une réponse 204', async () => {
    const api = createApiClient({
      baseUrl,
      fetch: fakeFetch(() => new Response(null, { status: 204 })),
    });

    const result = await toResult(api.DELETE('/rooms/{roomId}', { params: { path: { roomId } } }));

    expect(result).toEqual({ ok: true, data: undefined });
  });

  it("reprend le code et le message de l'erreur API", async () => {
    const api = createApiClient({
      baseUrl,
      fetch: fakeFetch(() => json({ code: 'ROOM_NOT_FOUND', message: 'Salle introuvable' }, 404)),
    });

    const result = await toResult(api.GET('/rooms/{roomId}', { params: { path: { roomId } } }));

    expect(result).toEqual({
      ok: false,
      error: { status: 404, code: 'ROOM_NOT_FOUND', message: 'Salle introuvable' },
    });
  });

  it("complète une erreur dont le corps n'est pas au format Error", async () => {
    const api = createApiClient({
      baseUrl,
      fetch: fakeFetch(() => new Response(null, { status: 401 })),
    });

    const result = await toResult(api.GET('/auth/me'));

    expect(result).toEqual({
      ok: false,
      error: { status: 401, code: 'HTTP_401', message: 'Erreur HTTP 401' },
    });
  });

  it('transforme une erreur réseau en ApiError de statut 0', async () => {
    const api = createApiClient({
      baseUrl,
      fetch: vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))),
    });

    const result = await toResult(api.GET('/auth/me'));

    expect(result).toEqual({
      ok: false,
      error: { status: 0, code: 'NETWORK_ERROR', message: 'Failed to fetch' },
    });
  });
});
