/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** Pas de temps d'une série : jour, semaine (commence le lundi) ou mois. */
export type Granularity =
  | 'DAY'
  | 'MONTH'
  | 'WEEK';

/** Période sur la date de début des réservations, bornes incluses. Une borne absente n'est pas appliquée. */
export type PeriodInput = {
  from?: string | null | undefined;
  to?: string | null | undefined;
};

/** Filtres de la liste des réservations ; un filtre absent n'est pas appliqué. */
export type ReservationFilter = {
  roomId?: string | null | undefined;
  status?: ReservationStatus | null | undefined;
  userId?: string | null | undefined;
};

export type ReservationStatus =
  | 'CANCELLED'
  | 'COMPLETED'
  | 'CONFIRMED'
  | 'PENDING'
  | 'REJECTED';

export type UserRole =
  | 'ADMINISTRATEUR'
  | 'CLIENT'
  | 'GESTIONNAIRE';

export type AdminDashboardQueryVariables = Exact<{
  period?: PeriodInput | null | undefined;
  granularity: Granularity;
  limit: number;
}>;


export type AdminDashboardQuery = { dashboard: { from: string | null, to: string | null, statistics: { totalUsers: number, totalRooms: number, totalReservations: number, confirmedReservations: number, cancelledReservations: number, totalRevenue: number }, byStatus: Array<{ status: ReservationStatus, count: number, amount: number }>, timeline: Array<{ date: string, reservations: number, confirmedReservations: number, revenue: number }>, rooms: Array<{ reservations: number, revenue: number, bookedHours: number, room: { id: string, name: string, location: string } }>, topClients: Array<{ reservations: number, revenue: number, user: { id: string, firstName: string, lastName: string } }> } };

export type ReservationRequestsQueryVariables = Exact<{
  handledLimit: number;
}>;


export type ReservationRequestsQuery = { reservationRequests: { pending: Array<{ id: string, startAt: string, endAt: string, status: ReservationStatus, numberOfParticipants: number | null, comment: string | null, totalAmount: number, currency: string, room: { id: string, name: string }, requester: { id: string, firstName: string, lastName: string } }>, handled: Array<{ id: string, startAt: string, endAt: string, status: ReservationStatus, numberOfParticipants: number | null, comment: string | null, totalAmount: number, currency: string, room: { id: string, name: string }, requester: { id: string, firstName: string, lastName: string } }> } };

export type ReservationRequestFieldsFragment = { id: string, startAt: string, endAt: string, status: ReservationStatus, numberOfParticipants: number | null, comment: string | null, totalAmount: number, currency: string, room: { id: string, name: string }, requester: { id: string, firstName: string, lastName: string } };

export type AdminUserFieldsFragment = { id: string, firstName: string, lastName: string, email: string, role: UserRole, createdAt: string };

export type AdminUsersQueryVariables = Exact<{
  role?: UserRole | null | undefined;
  page: number;
  pageSize: number;
}>;


export type AdminUsersQuery = { users: { page: number, pageSize: number, total: number, items: Array<{ id: string, firstName: string, lastName: string, email: string, role: UserRole, createdAt: string }> } };

export type AdminChangeUserRoleMutationVariables = Exact<{
  userId: string;
  role: UserRole;
}>;


export type AdminChangeUserRoleMutation = { changeUserRole: { id: string, firstName: string, lastName: string, email: string, role: UserRole, createdAt: string } };

export type AdminDeleteUserMutationVariables = Exact<{
  userId: string;
}>;


export type AdminDeleteUserMutation = { deleteUser: string };

export type AdminReservationFieldsFragment = { id: string, startAt: string, endAt: string, status: ReservationStatus, numberOfParticipants: number | null, comment: string | null, rejectionReason: string | null, totalAmount: number, currency: string, createdAt: string, room: { id: string, name: string }, requester: { id: string, firstName: string, lastName: string, email: string } };

export type AdminReservationsQueryVariables = Exact<{
  filter?: ReservationFilter | null | undefined;
  page: number;
  pageSize: number;
}>;


export type AdminReservationsQuery = { reservations: { page: number, pageSize: number, total: number, items: Array<{ id: string, startAt: string, endAt: string, status: ReservationStatus, numberOfParticipants: number | null, comment: string | null, rejectionReason: string | null, totalAmount: number, currency: string, createdAt: string, room: { id: string, name: string }, requester: { id: string, firstName: string, lastName: string, email: string } }> } };

export type AdminConfirmReservationMutationVariables = Exact<{
  reservationId: string;
}>;


export type AdminConfirmReservationMutation = { confirmReservation: { id: string, startAt: string, endAt: string, status: ReservationStatus, numberOfParticipants: number | null, comment: string | null, rejectionReason: string | null, totalAmount: number, currency: string, createdAt: string, room: { id: string, name: string }, requester: { id: string, firstName: string, lastName: string, email: string } } };

export type AdminRejectReservationMutationVariables = Exact<{
  reservationId: string;
  reason?: string | null | undefined;
}>;


export type AdminRejectReservationMutation = { rejectReservation: { id: string, startAt: string, endAt: string, status: ReservationStatus, numberOfParticipants: number | null, comment: string | null, rejectionReason: string | null, totalAmount: number, currency: string, createdAt: string, room: { id: string, name: string }, requester: { id: string, firstName: string, lastName: string, email: string } } };

export type AdminCancelReservationMutationVariables = Exact<{
  reservationId: string;
}>;


export type AdminCancelReservationMutation = { cancelReservation: { id: string, startAt: string, endAt: string, status: ReservationStatus, numberOfParticipants: number | null, comment: string | null, rejectionReason: string | null, totalAmount: number, currency: string, createdAt: string, room: { id: string, name: string }, requester: { id: string, firstName: string, lastName: string, email: string } } };
