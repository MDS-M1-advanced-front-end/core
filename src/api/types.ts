import type { components, paths } from './schema';

type Schemas = components['schemas'];

export type UserRole = Schemas['UserRole'];
export type User = Schemas['User'];
export type RegisterRequest = Schemas['RegisterRequest'];
export type LoginRequest = Schemas['LoginRequest'];
export type AuthResponse = Schemas['AuthResponse'];
export type ChangePasswordRequest = Schemas['ChangePasswordRequest'];
export type UserUpdateRequest = Schemas['UserUpdateRequest'];

export type Room = Schemas['Room'];
export type RoomCreateRequest = Schemas['RoomCreateRequest'];
export type RoomUpdateRequest = Schemas['RoomUpdateRequest'];

export type AvailabilitySlot = Schemas['AvailabilitySlot'];
export type AvailabilityUpdateRequest = Schemas['AvailabilityUpdateRequest'];

export type ReservationStatus = Schemas['ReservationStatus'];
export type Reservation = Schemas['Reservation'];
export type ReservationCreateRequest = Schemas['ReservationCreateRequest'];
export type ReservationUpdateRequest = Schemas['ReservationUpdateRequest'];

export type Payment = Schemas['Payment'];
export type PaymentCreateRequest = Schemas['PaymentCreateRequest'];

export type Statistics = Schemas['Statistics'];

export type UserListFilters = NonNullable<paths['/users']['get']['parameters']['query']>;
export type RoomSearchFilters = NonNullable<paths['/rooms']['get']['parameters']['query']>;
export type AvailabilityQuery = paths['/rooms/{roomId}/availability']['get']['parameters']['query'];
export type ReservationListFilters = NonNullable<
  paths['/reservations']['get']['parameters']['query']
>;
export type AdminReservationFilters = NonNullable<
  paths['/admin/reservations']['get']['parameters']['query']
>;
export type StatisticsPeriod = NonNullable<
  paths['/admin/statistics']['get']['parameters']['query']
>;

/**
 * Normalized page of results. The contract declares every field of PaginatedRooms and
 * PaginatedUsers as optional (anomaly #2); the client fills the gaps so callers get one shape.
 */
export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}
