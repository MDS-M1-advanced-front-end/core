// API GraphQL du back-office (tableaux de bord, demandes de réservation) : import depuis
// '@room-booking/core/graphql'.
// Séparée de l'index principal car ses types (Statistics, ReservationStatus…) portent les mêmes
// noms que ceux du contrat REST.
export { graphqlRequest } from './client';
export { getAdminDashboard, getReservationRequests } from './operations';
export type * from './schema';
export type {
  AdminDashboardQuery,
  AdminDashboardQueryVariables,
  ReservationRequestFieldsFragment,
  ReservationRequestsQuery,
  ReservationRequestsQueryVariables,
} from './operations.generated';
