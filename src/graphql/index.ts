// API GraphQL d'administration (tableaux de bord) : import depuis '@room-booking/core/graphql'.
// Séparée de l'index principal car ses types (Statistics, ReservationStatus…) portent les mêmes
// noms que ceux du contrat REST.
export { graphqlRequest } from './client';
export { getAdminDashboard } from './operations';
export type * from './schema';
export type { AdminDashboardQuery, AdminDashboardQueryVariables } from './operations.generated';
