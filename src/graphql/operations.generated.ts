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

export type ReservationStatus =
  | 'CANCELLED'
  | 'COMPLETED'
  | 'CONFIRMED'
  | 'PENDING'
  | 'REJECTED';

export type AdminDashboardQueryVariables = Exact<{
  period?: PeriodInput | null | undefined;
  granularity: Granularity;
  limit: number;
}>;


export type AdminDashboardQuery = { dashboard: { from: string | null, to: string | null, statistics: { totalUsers: number, totalRooms: number, totalReservations: number, confirmedReservations: number, cancelledReservations: number, totalRevenue: number }, byStatus: Array<{ status: ReservationStatus, count: number, amount: number }>, timeline: Array<{ date: string, reservations: number, confirmedReservations: number, revenue: number }>, rooms: Array<{ reservations: number, revenue: number, bookedHours: number, room: { id: string, name: string, location: string } }>, topClients: Array<{ reservations: number, revenue: number, user: { id: string, firstName: string, lastName: string } }> } };
