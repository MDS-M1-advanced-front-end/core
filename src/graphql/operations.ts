import { graphqlRequest } from './client';
import type { Result } from '../api/result';
import type {
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
  AdminReservationsQuery,
  AdminReservationsQueryVariables,
  AdminUsersQuery,
  AdminUsersQueryVariables,
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

// Champs d'un utilisateur dans l'administration, repris par la liste et par le changement de rôle
const ADMIN_USER_FIELDS = /* GraphQL */ `
  fragment AdminUserFields on User {
    id
    firstName
    lastName
    email
    role
    createdAt
  }
`;

const ADMIN_USERS = /* GraphQL */ `
  query AdminUsers($role: UserRole, $page: Int!, $pageSize: Int!) {
    users(role: $role, page: $page, pageSize: $pageSize) {
      items {
        ...AdminUserFields
      }
      page
      pageSize
      total
    }
  }
`;

/**
 * Utilisateurs de l'espace d'administration, les derniers inscrits d'abord. Réservé aux
 * administrateurs.
 * @param variables - Rôle facultatif, page (à partir de 1) et taille de page (1 à 100).
 * @returns Une page d'utilisateurs. Erreur 401 sans jeton, 403 si l'utilisateur n'est pas
 *   administrateur.
 */
export function getAdminUsers(
  variables: AdminUsersQueryVariables,
): Promise<Result<AdminUsersQuery>> {
  return graphqlRequest(ADMIN_USERS + ADMIN_USER_FIELDS, variables);
}

const ADMIN_CHANGE_USER_ROLE = /* GraphQL */ `
  mutation AdminChangeUserRole($userId: ID!, $role: UserRole!) {
    changeUserRole(userId: $userId, role: $role) {
      ...AdminUserFields
    }
  }
`;

/**
 * Change le rôle d'un utilisateur. Réservé aux administrateurs.
 * @param variables - Utilisateur et nouveau rôle.
 * @returns L'utilisateur modifié. Erreur 404 s'il n'existe pas, 409 sur son propre compte.
 */
export function adminChangeUserRole(
  variables: AdminChangeUserRoleMutationVariables,
): Promise<Result<AdminChangeUserRoleMutation>> {
  return graphqlRequest(ADMIN_CHANGE_USER_ROLE + ADMIN_USER_FIELDS, variables);
}

const ADMIN_DELETE_USER = /* GraphQL */ `
  mutation AdminDeleteUser($userId: ID!) {
    deleteUser(userId: $userId)
  }
`;

/**
 * Supprime un utilisateur et ses salles. Réservé aux administrateurs.
 * @param variables - Utilisateur à supprimer.
 * @returns Son identifiant. Erreur 404 s'il n'existe pas, 409 s'il a des réservations (ou ses
 *   salles) ou sur son propre compte.
 */
export function adminDeleteUser(
  variables: AdminDeleteUserMutationVariables,
): Promise<Result<AdminDeleteUserMutation>> {
  return graphqlRequest(ADMIN_DELETE_USER, variables);
}

// Champs d'une réservation dans l'administration, repris par la liste et par les actions
const ADMIN_RESERVATION_FIELDS = /* GraphQL */ `
  fragment AdminReservationFields on ReservationRequest {
    id
    room {
      id
      name
    }
    requester {
      id
      firstName
      lastName
      email
    }
    startAt
    endAt
    status
    numberOfParticipants
    comment
    rejectionReason
    totalAmount
    currency
    createdAt
  }
`;

const ADMIN_RESERVATIONS = /* GraphQL */ `
  query AdminReservations($filter: ReservationFilter, $page: Int!, $pageSize: Int!) {
    reservations(filter: $filter, page: $page, pageSize: $pageSize) {
      items {
        ...AdminReservationFields
      }
      page
      pageSize
      total
    }
  }
`;

/**
 * Toutes les réservations, la plus récente d'abord, avec la salle et le demandeur. Réservé aux
 * administrateurs.
 * @param variables - Filtres facultatifs (statut, salle, client), page et taille de page (1 à 100).
 * @returns Une page de réservations. Erreur 401 sans jeton, 403 si l'utilisateur n'est pas
 *   administrateur.
 */
export function getAdminReservations(
  variables: AdminReservationsQueryVariables,
): Promise<Result<AdminReservationsQuery>> {
  return graphqlRequest(ADMIN_RESERVATIONS + ADMIN_RESERVATION_FIELDS, variables);
}

const ADMIN_CONFIRM_RESERVATION = /* GraphQL */ `
  mutation AdminConfirmReservation($reservationId: ID!) {
    confirmReservation(reservationId: $reservationId) {
      ...AdminReservationFields
    }
  }
`;

/**
 * Confirme une demande PENDING. Gestionnaire de la salle ou administrateur.
 * @param variables - Réservation à confirmer.
 * @returns La réservation à jour. Erreur 404 si elle n'existe pas, 409 si elle n'est plus PENDING.
 */
export function adminConfirmReservation(
  variables: AdminConfirmReservationMutationVariables,
): Promise<Result<AdminConfirmReservationMutation>> {
  return graphqlRequest(ADMIN_CONFIRM_RESERVATION + ADMIN_RESERVATION_FIELDS, variables);
}

const ADMIN_REJECT_RESERVATION = /* GraphQL */ `
  mutation AdminRejectReservation($reservationId: ID!, $reason: String) {
    rejectReservation(reservationId: $reservationId, reason: $reason) {
      ...AdminReservationFields
    }
  }
`;

/**
 * Refuse une demande PENDING. Gestionnaire de la salle ou administrateur.
 * @param variables - Réservation à refuser et motif facultatif (1000 caractères au plus).
 * @returns La réservation à jour. Erreur 404 si elle n'existe pas, 409 si elle n'est plus PENDING.
 */
export function adminRejectReservation(
  variables: AdminRejectReservationMutationVariables,
): Promise<Result<AdminRejectReservationMutation>> {
  return graphqlRequest(ADMIN_REJECT_RESERVATION + ADMIN_RESERVATION_FIELDS, variables);
}

const ADMIN_CANCEL_RESERVATION = /* GraphQL */ `
  mutation AdminCancelReservation($reservationId: ID!) {
    cancelReservation(reservationId: $reservationId) {
      ...AdminReservationFields
    }
  }
`;

/**
 * Annule une réservation PENDING ou CONFIRMED. Réservé aux administrateurs.
 * @param variables - Réservation à annuler.
 * @returns La réservation à jour. Erreur 404 si elle n'existe pas, 409 si elle n'est plus active.
 */
export function adminCancelReservation(
  variables: AdminCancelReservationMutationVariables,
): Promise<Result<AdminCancelReservationMutation>> {
  return graphqlRequest(ADMIN_CANCEL_RESERVATION + ADMIN_RESERVATION_FIELDS, variables);
}
