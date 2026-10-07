import createClient from 'openapi-fetch';
import type { ApiError, Result } from './result';
import type { paths } from './schema';
import type {
  AdminReservationFilters,
  AuthResponse,
  AvailabilityQuery,
  AvailabilitySlot,
  AvailabilityUpdateRequest,
  ChangePasswordRequest,
  LoginRequest,
  Paginated,
  Payment,
  PaymentCreateRequest,
  RegisterRequest,
  Reservation,
  ReservationCreateRequest,
  ReservationListFilters,
  ReservationUpdateRequest,
  Room,
  RoomCreateRequest,
  RoomSearchFilters,
  RoomUpdateRequest,
  Statistics,
  StatisticsPeriod,
  User,
  UserListFilters,
  UserUpdateRequest,
} from './types';

export interface ApiClientOptions {
  baseUrl: string;
  /** Called before every request; the app owns the token (storage, refresh, logout). */
  getAccessToken?: () => string | undefined | Promise<string | undefined>;
  /** Custom fetch, mainly for tests. Defaults to globalThis.fetch. */
  fetch?: (input: Request) => Promise<Response>;
}

/** Shape of what openapi-fetch resolves to, whatever the endpoint. */
interface RawResponse<T> {
  data?: T;
  error?: unknown;
  response: Response;
}

// Contract defaults for the Page / PageSize parameters
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Builds an ApiError from any error body. The contract's Error schema has only optional
 * fields, and some responses have no body at all (e.g. 409 on /auth/register, anomaly #5).
 */
export function toApiError(status: number, body: unknown): ApiError {
  const error: ApiError = {
    status,
    code: `HTTP_${status}`,
    message: `La requête a échoué (HTTP ${status}).`,
  };
  if (isRecord(body)) {
    if (typeof body.code === 'string') error.code = body.code;
    if (typeof body.message === 'string') error.message = body.message;
    if (isRecord(body.details)) error.details = body.details;
  } else if (typeof body === 'string' && body.trim() !== '') {
    error.message = body;
  }
  return error;
}

/** Runs an openapi-fetch call and turns every outcome into a Result: this never throws. */
async function run<T>(send: () => Promise<RawResponse<T>>): Promise<Result<T>> {
  try {
    const { data, error, response } = await send();
    if (!response.ok) return { ok: false, error: toApiError(response.status, error) };
    return { ok: true, data: data as T };
  } catch (cause) {
    if (cause instanceof SyntaxError) {
      return {
        ok: false,
        error: { status: 0, code: 'INVALID_RESPONSE', message: 'Réponse illisible du serveur.' },
      };
    }
    return {
      ok: false,
      error: {
        status: 0,
        code: 'NETWORK_ERROR',
        message: cause instanceof Error ? cause.message : 'Impossible de joindre le serveur.',
      },
    };
  }
}

/** For endpoints answering 204 No Content. */
async function runVoid(send: () => Promise<RawResponse<unknown>>): Promise<Result<void>> {
  const result = await run(send);
  return result.ok ? { ok: true, data: undefined } : result;
}

interface RawPage<T> {
  items?: T[];
  page?: number;
  pageSize?: number;
  total?: number;
}

// Contract anomaly #2: PaginatedRooms / PaginatedUsers declare no required field.
function toPage<T>(result: Result<RawPage<T>>): Result<Paginated<T>> {
  if (!result.ok) return result;
  const items = result.data.items ?? [];
  return {
    ok: true,
    data: {
      items,
      page: result.data.page ?? DEFAULT_PAGE,
      pageSize: result.data.pageSize ?? DEFAULT_PAGE_SIZE,
      total: result.data.total ?? items.length,
    },
  };
}

export function createApiClient(options: ApiClientOptions) {
  const http = createClient<paths>({
    baseUrl: options.baseUrl,
    ...(options.fetch && { fetch: options.fetch }),
  });

  const { getAccessToken } = options;
  if (getAccessToken) {
    http.use({
      async onRequest({ request }) {
        const token = await getAccessToken();
        if (token) request.headers.set('Authorization', `Bearer ${token}`);
        return request;
      },
    });
  }

  return {
    auth: {
      register: (body: RegisterRequest): Promise<Result<User>> =>
        run(() => http.POST('/auth/register', { body })),
      // Contract anomaly #1: a refreshToken is returned but no refresh endpoint exists.
      login: (body: LoginRequest): Promise<Result<AuthResponse>> =>
        run(() => http.POST('/auth/login', { body })),
      me: (): Promise<Result<User>> => run(() => http.GET('/auth/me')),
      changePassword: (body: ChangePasswordRequest): Promise<Result<void>> =>
        runVoid(() => http.PATCH('/auth/password', { body })),
    },

    users: {
      list: async (filters: UserListFilters = {}): Promise<Result<Paginated<User>>> =>
        toPage(await run(() => http.GET('/users', { params: { query: filters } }))),
      get: (userId: string): Promise<Result<User>> =>
        run(() => http.GET('/users/{userId}', { params: { path: { userId } } })),
      update: (userId: string, body: UserUpdateRequest): Promise<Result<User>> =>
        run(() => http.PATCH('/users/{userId}', { params: { path: { userId } }, body })),
      delete: (userId: string): Promise<Result<void>> =>
        runVoid(() => http.DELETE('/users/{userId}', { params: { path: { userId } } })),
    },

    rooms: {
      search: async (filters: RoomSearchFilters = {}): Promise<Result<Paginated<Room>>> =>
        toPage(await run(() => http.GET('/rooms', { params: { query: filters } }))),
      create: (body: RoomCreateRequest): Promise<Result<Room>> =>
        run(() => http.POST('/rooms', { body })),
      get: (roomId: string): Promise<Result<Room>> =>
        run(() => http.GET('/rooms/{roomId}', { params: { path: { roomId } } })),
      update: (roomId: string, body: RoomUpdateRequest): Promise<Result<Room>> =>
        run(() => http.PATCH('/rooms/{roomId}', { params: { path: { roomId } }, body })),
      delete: (roomId: string): Promise<Result<void>> =>
        runVoid(() => http.DELETE('/rooms/{roomId}', { params: { path: { roomId } } })),
    },

    availability: {
      get: (roomId: string, query: AvailabilityQuery): Promise<Result<AvailabilitySlot[]>> =>
        run(() =>
          http.GET('/rooms/{roomId}/availability', { params: { path: { roomId }, query } }),
        ),
      /** Replaces every slot of the given date. */
      setForDate: (
        roomId: string,
        body: AvailabilityUpdateRequest,
      ): Promise<Result<AvailabilitySlot[]>> =>
        run(() => http.PUT('/rooms/{roomId}/availability', { params: { path: { roomId } }, body })),
    },

    reservations: {
      /** Only the reservations of the logged-in user, CANCELLED ones included. */
      listMine: (filters: ReservationListFilters = {}): Promise<Result<Paginated<Reservation>>> =>
        run(() => http.GET('/reservations', { params: { query: filters } })),
      create: (body: ReservationCreateRequest): Promise<Result<Reservation>> =>
        run(() => http.POST('/reservations', { body })),
      get: (reservationId: string): Promise<Result<Reservation>> =>
        run(() =>
          http.GET('/reservations/{reservationId}', { params: { path: { reservationId } } }),
        ),
      /** Changing the time slot of a CONFIRMED reservation puts it back to PENDING. */
      update: (
        reservationId: string,
        body: ReservationUpdateRequest,
      ): Promise<Result<Reservation>> =>
        run(() =>
          http.PATCH('/reservations/{reservationId}', {
            params: { path: { reservationId } },
            body,
          }),
        ),
      // Contract anomaly #6: DELETE is a logical cancellation (status CANCELLED), not a deletion.
      cancel: (reservationId: string): Promise<Result<void>> =>
        runVoid(() =>
          http.DELETE('/reservations/{reservationId}', { params: { path: { reservationId } } }),
        ),
      confirm: (reservationId: string): Promise<Result<Reservation>> =>
        run(() =>
          http.POST('/reservations/{reservationId}/confirm', {
            params: { path: { reservationId } },
          }),
        ),
      reject: (reservationId: string, reason?: string): Promise<Result<Reservation>> =>
        run(() =>
          http.POST('/reservations/{reservationId}/reject', {
            params: { path: { reservationId } },
            ...(reason !== undefined && { body: { reason } }),
          }),
        ),
    },

    payments: {
      initiate: (body: PaymentCreateRequest): Promise<Result<Payment>> =>
        run(() => http.POST('/payments', { body })),
      get: (paymentId: string): Promise<Result<Payment>> =>
        run(() => http.GET('/payments/{paymentId}', { params: { path: { paymentId } } })),
    },

    admin: {
      reservations: (
        filters: AdminReservationFilters = {},
      ): Promise<Result<Paginated<Reservation>>> =>
        run(() => http.GET('/admin/reservations', { params: { query: filters } })),
      // Contract anomaly #3: every Statistics field is optional; left as-is, since defaulting
      // a missing figure to 0 would show wrong numbers.
      statistics: (period: StatisticsPeriod = {}): Promise<Result<Statistics>> =>
        run(() => http.GET('/admin/statistics', { params: { query: period } })),
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
