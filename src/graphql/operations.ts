import { graphqlRequest } from './client';
import type { Result } from '../api/result';
import type {
  AdminDashboardQuery,
  AdminDashboardQueryVariables,
  ReservationRequestsQuery,
  ReservationRequestsQueryVariables,
} from './operations.generated';

// Requêtes prêtes à l'emploi. Le marqueur /* GraphQL */ permet à graphql-codegen de les lire et
// d'en générer les types (pnpm generate:graphql). Pour un écran qui a besoin d'autres champs,
// écrire sa propre requête et l'exécuter avec graphqlRequest.

const ADMIN_DASHBOARD = /* GraphQL */ `
  query AdminDashboard($period: PeriodInput, $granularity: Granularity!, $limit: Int!) {
    dashboard(period: $period) {
      from
      to
      statistics {
        totalUsers
        totalRooms
        totalReservations
        confirmedReservations
        cancelledReservations
        totalRevenue
      }
      byStatus {
        status
        count
        amount
      }
      timeline(granularity: $granularity) {
        date
        reservations
        confirmedReservations
        revenue
      }
      rooms(sort: REVENUE, limit: $limit) {
        room {
          id
          name
          location
        }
        reservations
        revenue
        bookedHours
      }
      topClients(limit: $limit) {
        user {
          id
          firstName
          lastName
        }
        reservations
        revenue
      }
    }
  }
`;

/**
 * Tableau de bord d'administration complet. Réservé aux administrateurs.
 * @param variables - Période facultative (`from`, `to` : YYYY-MM-DD, incluses), pas de la série
 *   (`DAY`, `WEEK`, `MONTH`) et nombre de salles et de clients à classer (1 à 50).
 * @returns Le tableau de bord. Erreur 401 sans jeton, 403 si l'utilisateur n'est pas administrateur.
 */
export function getAdminDashboard(
  variables: AdminDashboardQueryVariables,
): Promise<Result<AdminDashboardQuery>> {
  return graphqlRequest(ADMIN_DASHBOARD, variables);
}

const RESERVATION_REQUESTS = /* GraphQL */ `
  query ReservationRequests($handledLimit: Int!) {
    reservationRequests {
      pending {
        ...ReservationRequestFields
      }
      handled(limit: $handledLimit) {
        ...ReservationRequestFields
      }
    }
  }

  fragment ReservationRequestFields on ReservationRequest {
    id
    room {
      id
      name
    }
    requester {
      id
      firstName
      lastName
    }
    startAt
    endAt
    status
    numberOfParticipants
    comment
    totalAmount
    currency
  }
`;

/**
 * Demandes de réservation de l'écran « Demandes » : en attente et traitées récemment, avec le nom
 * de la salle et du demandeur, en une seule requête. Réservé aux gestionnaires (leurs salles) et
 * aux administrateurs (toutes les salles).
 * @param variables - Nombre de demandes traitées (1 à 100).
 * @returns Les deux listes. Erreur 401 sans jeton, 403 pour un client.
 */
export function getReservationRequests(
  variables: ReservationRequestsQueryVariables,
): Promise<Result<ReservationRequestsQuery>> {
  return graphqlRequest(RESERVATION_REQUESTS, variables);
}
