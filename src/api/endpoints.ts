import { toResult, type ApiClient } from './client';
import type { components, paths } from './schema';

type Schemas = components['schemas'];
type QueryOf<T extends { parameters: { query?: unknown } }> = T['parameters']['query'];

/**
 * Une fonction par endpoint du contrat, regroupées par ressource.
 * Chaque fonction renvoie un Result : elle ne lève jamais d'exception.
 */
export function createApi(client: ApiClient) {
  return {
    auth: {
      register: (body: Schemas['RegisterRequest']) =>
        toResult(client.POST('/auth/register', { body })),
      login: (body: Schemas['LoginRequest']) => toResult(client.POST('/auth/login', { body })),
      me: () => toResult(client.GET('/auth/me')),
      changePassword: (body: Schemas['ChangePasswordRequest']) =>
        toResult(client.PATCH('/auth/password', { body })),
    },

    users: {
      list: (query?: QueryOf<paths['/users']['get']>) =>
        toResult(client.GET('/users', { params: { query } })),
      get: (userId: string) =>
        toResult(client.GET('/users/{userId}', { params: { path: { userId } } })),
      update: (userId: string, body: Schemas['UserUpdateRequest']) =>
        toResult(client.PATCH('/users/{userId}', { params: { path: { userId } }, body })),
      remove: (userId: string) =>
        toResult(client.DELETE('/users/{userId}', { params: { path: { userId } } })),
    },

    rooms: {
      list: (query?: QueryOf<paths['/rooms']['get']>) =>
        toResult(client.GET('/rooms', { params: { query } })),
      create: (body: Schemas['RoomCreateRequest']) => toResult(client.POST('/rooms', { body })),
      get: (roomId: string) =>
        toResult(client.GET('/rooms/{roomId}', { params: { path: { roomId } } })),
      update: (roomId: string, body: Schemas['RoomUpdateRequest']) =>
        toResult(client.PATCH('/rooms/{roomId}', { params: { path: { roomId } }, body })),
      remove: (roomId: string) =>
        toResult(client.DELETE('/rooms/{roomId}', { params: { path: { roomId } } })),
      getAvailability: (
        roomId: string,
        query: QueryOf<paths['/rooms/{roomId}/availability']['get']>,
      ) =>
        toResult(
          client.GET('/rooms/{roomId}/availability', { params: { path: { roomId }, query } }),
        ),
      setAvailability: (roomId: string, body: Schemas['AvailabilityUpdateRequest']) =>
        toResult(
          client.PUT('/rooms/{roomId}/availability', { params: { path: { roomId } }, body }),
        ),
    },

    reservations: {
      list: (query?: QueryOf<paths['/reservations']['get']>) =>
        toResult(client.GET('/reservations', { params: { query } })),
      create: (body: Schemas['ReservationCreateRequest']) =>
        toResult(client.POST('/reservations', { body })),
      get: (reservationId: string) =>
        toResult(
          client.GET('/reservations/{reservationId}', { params: { path: { reservationId } } }),
        ),
      update: (reservationId: string, body: Schemas['ReservationUpdateRequest']) =>
        toResult(
          client.PATCH('/reservations/{reservationId}', {
            params: { path: { reservationId } },
            body,
          }),
        ),
      cancel: (reservationId: string) =>
        toResult(
          client.DELETE('/reservations/{reservationId}', { params: { path: { reservationId } } }),
        ),
      confirm: (reservationId: string) =>
        toResult(
          client.POST('/reservations/{reservationId}/confirm', {
            params: { path: { reservationId } },
          }),
        ),
      reject: (reservationId: string, body?: Schemas['ReservationRejectRequest']) =>
        toResult(
          client.POST('/reservations/{reservationId}/reject', {
            params: { path: { reservationId } },
            body,
          }),
        ),
    },

    payments: {
      create: (body: Schemas['PaymentCreateRequest']) =>
        toResult(client.POST('/payments', { body })),
      get: (paymentId: string) =>
        toResult(client.GET('/payments/{paymentId}', { params: { path: { paymentId } } })),
    },

    admin: {
      listReservations: (query?: QueryOf<paths['/admin/reservations']['get']>) =>
        toResult(client.GET('/admin/reservations', { params: { query } })),
      statistics: (query?: QueryOf<paths['/admin/statistics']['get']>) =>
        toResult(client.GET('/admin/statistics', { params: { query } })),
    },
  };
}

export type Api = ReturnType<typeof createApi>;
