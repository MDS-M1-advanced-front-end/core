// API GraphQL du back-office (demandes de réservation, administration) : import depuis
// '@room-booking/core/graphql'.
// Séparée de l'index principal car ses types (Statistics, ReservationStatus…) portent les mêmes
// noms que ceux du contrat REST.
export { graphqlRequest } from './client';
export {
  adminCancelReservation,
  adminChangeUserRole,
  adminConfirmReservation,
  adminDeleteUser,
  adminRejectReservation,
  getAdminDashboard,
  getAdminReservations,
  getAdminUsers,
  getReservationRequests,
} from './operations';
export type * from './schema';
export type {
  AdminCancelReservationMutation,
  AdminCancelReservationMutationVariables,
  AdminChangeUserRoleMutation,
  AdminChangeUserRoleMutationVariables,
  AdminConfirmReservationMutation,
  AdminConfirmReservationMutationVariables,
  AdminDeleteUserMutation,
  AdminDeleteUserMutationVariables,
  AdminRejectReservationMutation,
  AdminRejectReservationMutationVariables,
  AdminReservationFieldsFragment,
  AdminReservationsQuery,
  AdminReservationsQueryVariables,
  AdminUserFieldsFragment,
  AdminUsersQuery,
  AdminUsersQueryVariables,
  AdminDashboardQuery,
  AdminDashboardQueryVariables,
  ReservationRequestFieldsFragment,
  ReservationRequestsQuery,
  ReservationRequestsQueryVariables,
} from './operations.generated';
