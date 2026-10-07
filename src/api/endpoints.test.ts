import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { createApiClient } from './client';
import { createApi, type Api } from './endpoints';
import type { Result } from './result';
import type { components } from './schema';

const baseUrl = 'http://api.test';
const id = '00000000-0000-4000-8000-000000000001';

function setup() {
  const fetch = vi.fn<(request: Request) => Promise<Response>>(() =>
    Promise.resolve(Response.json({})),
  );
  return { fetch, api: createApi(createApiClient({ baseUrl, fetch })) };
}

interface Case {
  call: (api: Api) => Promise<unknown>;
  method: string;
  url: string;
  body?: unknown;
}

const room = { name: 'Salle', capacity: 10, location: 'Paris', pricePerHour: 30 };
const availability = {
  date: '2026-10-12',
  slots: [{ startTime: '08:00:00', endTime: '09:00:00', available: true }],
};
const reservation = { roomId: id, startAt: '2026-10-12T09:00:00Z', endAt: '2026-10-12T10:00:00Z' };

// Un cas par endpoint du contrat : méthode, URL et corps envoyés
const cases: Record<string, Case> = {
  'auth.register': {
    call: (api) =>
      api.auth.register({ firstName: 'Léa', lastName: 'Martin', email: 'a@b.fr', password: 'x' }),
    method: 'POST',
    url: '/auth/register',
    body: { firstName: 'Léa', lastName: 'Martin', email: 'a@b.fr', password: 'x' },
  },
  'auth.login': {
    call: (api) => api.auth.login({ email: 'a@b.fr', password: 'x' }),
    method: 'POST',
    url: '/auth/login',
    body: { email: 'a@b.fr', password: 'x' },
  },
  'auth.me': { call: (api) => api.auth.me(), method: 'GET', url: '/auth/me' },
  'auth.changePassword': {
    call: (api) => api.auth.changePassword({ currentPassword: 'a', newPassword: 'b' }),
    method: 'PATCH',
    url: '/auth/password',
    body: { currentPassword: 'a', newPassword: 'b' },
  },

  'users.list': {
    call: (api) => api.users.list({ role: 'CLIENT', page: 2 }),
    method: 'GET',
    url: '/users?role=CLIENT&page=2',
  },
  'users.get': { call: (api) => api.users.get(id), method: 'GET', url: `/users/${id}` },
  'users.update': {
    call: (api) => api.users.update(id, { firstName: 'Hugo' }),
    method: 'PATCH',
    url: `/users/${id}`,
    body: { firstName: 'Hugo' },
  },
  'users.remove': { call: (api) => api.users.remove(id), method: 'DELETE', url: `/users/${id}` },

  'rooms.list': {
    call: (api) => api.rooms.list({ location: 'Paris' }),
    method: 'GET',
    url: '/rooms?location=Paris',
  },
  'rooms.create': {
    call: (api) => api.rooms.create(room),
    method: 'POST',
    url: '/rooms',
    body: room,
  },
  'rooms.get': { call: (api) => api.rooms.get(id), method: 'GET', url: `/rooms/${id}` },
  'rooms.update': {
    call: (api) => api.rooms.update(id, { status: 'INACTIVE' }),
    method: 'PATCH',
    url: `/rooms/${id}`,
    body: { status: 'INACTIVE' },
  },
  'rooms.remove': { call: (api) => api.rooms.remove(id), method: 'DELETE', url: `/rooms/${id}` },
  'rooms.getAvailability': {
    call: (api) => api.rooms.getAvailability(id, { date: '2026-10-12' }),
    method: 'GET',
    url: `/rooms/${id}/availability?date=2026-10-12`,
  },
  'rooms.setAvailability': {
    call: (api) => api.rooms.setAvailability(id, availability),
    method: 'PUT',
    url: `/rooms/${id}/availability`,
    body: availability,
  },

  'reservations.list': {
    call: (api) => api.reservations.list({ status: 'PENDING' }),
    method: 'GET',
    url: '/reservations?status=PENDING',
  },
  'reservations.create': {
    call: (api) => api.reservations.create(reservation),
    method: 'POST',
    url: '/reservations',
    body: reservation,
  },
  'reservations.get': {
    call: (api) => api.reservations.get(id),
    method: 'GET',
    url: `/reservations/${id}`,
  },
  'reservations.update': {
    call: (api) => api.reservations.update(id, { comment: 'Atelier' }),
    method: 'PATCH',
    url: `/reservations/${id}`,
    body: { comment: 'Atelier' },
  },
  'reservations.cancel': {
    call: (api) => api.reservations.cancel(id),
    method: 'DELETE',
    url: `/reservations/${id}`,
  },
  'reservations.confirm': {
    call: (api) => api.reservations.confirm(id),
    method: 'POST',
    url: `/reservations/${id}/confirm`,
  },
  'reservations.reject': {
    call: (api) => api.reservations.reject(id, { reason: 'Complet' }),
    method: 'POST',
    url: `/reservations/${id}/reject`,
    body: { reason: 'Complet' },
  },

  'payments.create': {
    call: (api) => api.payments.create({ reservationId: id, paymentMethod: 'CARD' }),
    method: 'POST',
    url: '/payments',
    body: { reservationId: id, paymentMethod: 'CARD' },
  },
  'payments.get': { call: (api) => api.payments.get(id), method: 'GET', url: `/payments/${id}` },

  'admin.listReservations': {
    call: (api) => api.admin.listReservations({ roomId: id }),
    method: 'GET',
    url: `/admin/reservations?roomId=${id}`,
  },
  'admin.statistics': {
    call: (api) => api.admin.statistics({ from: '2026-01-01' }),
    method: 'GET',
    url: '/admin/statistics?from=2026-01-01',
  },
};

describe('createApi', () => {
  it.each(Object.entries(cases))('%s', async (_name, { call, method, url, body }) => {
    const { fetch, api } = setup();

    await call(api);

    const request = fetch.mock.calls[0]?.[0];
    expect(request?.method).toBe(method);
    expect(request?.url).toBe(baseUrl + url);
    if (body === undefined) expect(request?.body).toBeNull();
    else expect(await request?.json()).toEqual(body);
  });

  it('couvre les 26 endpoints du contrat', () => {
    expect(Object.keys(cases)).toHaveLength(26);
  });

  it('renvoie un Result', async () => {
    const { api } = setup();

    await expect(api.rooms.get(id)).resolves.toEqual({ ok: true, data: {} });
  });
});

describe('types renvoyés', () => {
  it('reprend les schémas du contrat', () => {
    const { api } = setup();
    type Schemas = components['schemas'];

    expectTypeOf(api.rooms.get).returns.resolves.toEqualTypeOf<Result<Schemas['Room']>>();
    expectTypeOf(api.reservations.confirm).returns.resolves.toEqualTypeOf<
      Result<Schemas['Reservation']>
    >();
    expectTypeOf(api.rooms.setAvailability).returns.resolves.toEqualTypeOf<
      Result<Schemas['AvailabilitySlot'][]>
    >();
    expectTypeOf(api.payments.create).returns.resolves.toEqualTypeOf<Result<Schemas['Payment']>>();
  });
});
