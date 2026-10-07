import type { components, paths } from './schema';

type Schemas = components['schemas'];

export type User = Schemas['User'];
export type UserRole = Schemas['UserRole'];
export type Room = Schemas['Room'];
export type AvailabilitySlot = Schemas['AvailabilitySlot'];
export type Reservation = Schemas['Reservation'];
export type ReservationStatus = Schemas['ReservationStatus'];
export type Payment = Schemas['Payment'];
export type Statistics = Schemas['Statistics'];
export type AuthResponse = Schemas['AuthResponse'];
export type PaginatedUsers = Schemas['PaginatedUsers'];
export type PaginatedRooms = Schemas['PaginatedRooms'];
export type PaginatedReservations = Schemas['PaginatedReservations'];

export type RegisterRequest = Schemas['RegisterRequest'];
export type LoginRequest = Schemas['LoginRequest'];
export type ChangePasswordRequest = Schemas['ChangePasswordRequest'];
export type UserUpdateRequest = Schemas['UserUpdateRequest'];
export type RoomCreateRequest = Schemas['RoomCreateRequest'];
export type RoomUpdateRequest = Schemas['RoomUpdateRequest'];
export type AvailabilityUpdateRequest = Schemas['AvailabilityUpdateRequest'];
export type ReservationCreateRequest = Schemas['ReservationCreateRequest'];
export type ReservationUpdateRequest = Schemas['ReservationUpdateRequest'];
export type ReservationRejectRequest = Schemas['ReservationRejectRequest'];
export type PaymentCreateRequest = Schemas['PaymentCreateRequest'];

type Query<P extends keyof paths, M extends 'get'> = NonNullable<
  paths[P][M] extends { parameters: { query?: infer Q } } ? Q : never
>;

export type ListUsersQuery = Query<'/users', 'get'>;
export type SearchRoomsQuery = Query<'/rooms', 'get'>;
export type RoomAvailabilityQuery = Query<'/rooms/{roomId}/availability', 'get'>;
export type ListReservationsQuery = Query<'/reservations', 'get'>;
export type AdminReservationsQuery = Query<'/admin/reservations', 'get'>;
export type StatisticsQuery = Query<'/admin/statistics', 'get'>;
