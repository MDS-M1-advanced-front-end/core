import { describe, expect, it } from 'vitest';
import { createApiClient } from './client';

const BASE_URL = 'http://api.test';

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Fake fetch that records the requests it receives and answers with `respond`. */
function fakeFetch(respond: (request: Request) => Response | Promise<Response>) {
  const requests: Request[] = [];
  const fetch = (request: Request) => {
    requests.push(request);
    return Promise.resolve(respond(request));
  };
  return { fetch, requests };
}

const room = {
  id: '00000000-0000-4000-8000-100000000001',
  name: 'Salle Paris',
  capacity: 20,
  location: 'Paris',
  pricePerHour: 35,
  status: 'ACTIVE',
};

describe('createApiClient', () => {
  it('returns ok with the response body on 2xx', async () => {
    const { fetch } = fakeFetch(() => json(200, room));
    const api = createApiClient({ baseUrl: BASE_URL, fetch });

    expect(await api.rooms.get(room.id)).toEqual({ ok: true, data: room });
  });

  it('maps a contract Error body to an ApiError', async () => {
    const { fetch } = fakeFetch(() =>
      json(409, { code: 'SLOT_UNAVAILABLE', message: 'Créneau indisponible', details: { a: 1 } }),
    );
    const api = createApiClient({ baseUrl: BASE_URL, fetch });

    expect(await api.reservations.confirm('r1')).toEqual({
      ok: false,
      error: {
        status: 409,
        code: 'SLOT_UNAVAILABLE',
        message: 'Créneau indisponible',
        details: { a: 1 },
      },
    });
  });

  it('falls back to HTTP_<status> when the error has no body', async () => {
    const { fetch } = fakeFetch(() => new Response(null, { status: 409 }));
    const api = createApiClient({ baseUrl: BASE_URL, fetch });

    const result = await api.auth.register({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      password: 'password123',
    });

    expect(result).toMatchObject({ ok: false, error: { status: 409, code: 'HTTP_409' } });
  });

  it('turns a network failure into a NETWORK_ERROR result instead of throwing', async () => {
    const api = createApiClient({
      baseUrl: BASE_URL,
      fetch: () => Promise.reject(new TypeError('fetch failed')),
    });

    expect(await api.rooms.search()).toEqual({
      ok: false,
      error: { status: 0, code: 'NETWORK_ERROR', message: 'fetch failed' },
    });
  });

  it('turns an unreadable success body into an INVALID_RESPONSE result', async () => {
    const { fetch } = fakeFetch(() => new Response('<html>', { status: 200 }));
    const api = createApiClient({ baseUrl: BASE_URL, fetch });

    expect(await api.rooms.get(room.id)).toMatchObject({
      ok: false,
      error: { status: 0, code: 'INVALID_RESPONSE' },
    });
  });

  it('returns ok with undefined data on 204', async () => {
    const { fetch, requests } = fakeFetch(() => new Response(null, { status: 204 }));
    const api = createApiClient({ baseUrl: BASE_URL, fetch });

    expect(await api.reservations.cancel('r1')).toEqual({ ok: true, data: undefined });
    expect(requests[0]?.method).toBe('DELETE');
    expect(requests[0]?.url).toBe(`${BASE_URL}/reservations/r1`);
  });

  it('sends the bearer token when the app provides one', async () => {
    const { fetch, requests } = fakeFetch(() => json(200, room));
    const api = createApiClient({ baseUrl: BASE_URL, fetch, getAccessToken: () => 'abc' });

    await api.rooms.get(room.id);

    expect(requests[0]?.headers.get('Authorization')).toBe('Bearer abc');
  });

  it('sends no Authorization header when there is no token', async () => {
    const { fetch, requests } = fakeFetch(() => json(200, room));
    const api = createApiClient({ baseUrl: BASE_URL, fetch, getAccessToken: () => undefined });

    await api.rooms.get(room.id);

    expect(requests[0]?.headers.has('Authorization')).toBe(false);
  });

  it('serializes search filters as query parameters', async () => {
    const { fetch, requests } = fakeFetch(() => json(200, { items: [] }));
    const api = createApiClient({ baseUrl: BASE_URL, fetch });

    await api.rooms.search({ location: 'Paris', capacityMin: 10 });

    const url = new URL(requests[0]?.url ?? '');
    expect(url.searchParams.get('location')).toBe('Paris');
    expect(url.searchParams.get('capacityMin')).toBe('10');
  });

  it('normalizes a page whose fields are missing (contract anomaly #2)', async () => {
    const { fetch } = fakeFetch(() => json(200, { items: [room] }));
    const api = createApiClient({ baseUrl: BASE_URL, fetch });

    expect(await api.rooms.search()).toEqual({
      ok: true,
      data: { items: [room], page: 1, pageSize: 20, total: 1 },
    });
  });

  it('normalizes an empty body to an empty page', async () => {
    const { fetch } = fakeFetch(() => json(200, {}));
    const api = createApiClient({ baseUrl: BASE_URL, fetch });

    expect(await api.users.list()).toEqual({
      ok: true,
      data: { items: [], page: 1, pageSize: 20, total: 0 },
    });
  });

  it('sends the rejection reason only when given', async () => {
    const { fetch, requests } = fakeFetch(() => json(200, {}));
    const api = createApiClient({ baseUrl: BASE_URL, fetch });

    await api.reservations.reject('r1', 'Salle en travaux');
    await api.reservations.reject('r2');

    expect(await requests[0]?.json()).toEqual({ reason: 'Salle en travaux' });
    expect(await requests[1]?.text()).toBe('');
  });
});
