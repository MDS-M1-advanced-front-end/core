import { apiClient, request, setAccessToken } from './client';
import type { Result } from './result';
import type {
  User,
  Room,
  AvailabilitySlot,
  Reservation,
  Payment,
  Statistics,
  AuthResponse,
  PaginatedUsers,
  PaginatedRooms,
  PaginatedReservations,
  RegisterRequest,
  LoginRequest,
  ChangePasswordRequest,
  UserUpdateRequest,
  RoomCreateRequest,
  RoomUpdateRequest,
  AvailabilityUpdateRequest,
  ReservationCreateRequest,
  ReservationUpdateRequest,
  ReservationRejectRequest,
  PaymentCreateRequest,
  ListUsersQuery,
  SearchRoomsQuery,
  RoomAvailabilityQuery,
  ListReservationsQuery,
  AdminReservationsQuery,
  StatisticsQuery,
} from './types';

// ---------- Authentification ----------

/**
 * Crée un compte utilisateur. Route publique.
 * @param body - Prénom, nom, e-mail et mot de passe (8 caractères min.).
 * @returns L'utilisateur créé. Erreur 409 si l'e-mail est déjà utilisé.
 */
export function register(body: RegisterRequest): Promise<Result<User>> {
  return request(apiClient.POST('/auth/register', { body }));
}

/**
 * Connecte l'utilisateur et enregistre l'access token pour les appels suivants. Route publique.
 * @param body - E-mail et mot de passe.
 * @returns Le token d'accès et l'utilisateur connecté. Erreur 401 si identifiants invalides.
 */
export async function login(body: LoginRequest): Promise<Result<AuthResponse>> {
  const result = await request(apiClient.POST('/auth/login', { body }));
  if (result.ok) setAccessToken(result.data.accessToken);
  return result;
}

/**
 * Déconnecte l'utilisateur côté client en supprimant l'access token stocké.
 */
export function logout(): void {
  setAccessToken(null);
}

/**
 * Récupère le profil de l'utilisateur connecté.
 * @returns L'utilisateur courant. Erreur 401 si non authentifié.
 */
export function getMe(): Promise<Result<User>> {
  return request(apiClient.GET('/auth/me'));
}

/**
 * Modifie le mot de passe de l'utilisateur connecté.
 * @param body - Mot de passe actuel et nouveau mot de passe (8 caractères min.).
 * @returns Rien en cas de succès (204).
 */
export function changePassword(body: ChangePasswordRequest): Promise<Result<void>> {
  return request(apiClient.PATCH('/auth/password', { body }));
}

// ---------- Utilisateurs ----------

/**
 * Liste les utilisateurs, avec pagination. Réservé aux administrateurs.
 * @param query - Filtres optionnels : `role`, `page`, `pageSize`.
 * @returns Une page d'utilisateurs.
 */
export function listUsers(query: ListUsersQuery = {}): Promise<Result<PaginatedUsers>> {
  return request(apiClient.GET('/users', { params: { query } }));
}

/**
 * Consulte un utilisateur.
 * @param userId - UUID de l'utilisateur.
 * @returns L'utilisateur. Erreur 404 s'il n'existe pas.
 */
export function getUser(userId: string): Promise<Result<User>> {
  return request(apiClient.GET('/users/{userId}', { params: { path: { userId } } }));
}

/**
 * Modifie un utilisateur (modification partielle).
 * @param userId - UUID de l'utilisateur.
 * @param body - Champs à modifier : `firstName`, `lastName`, `email`, `role`.
 * @returns L'utilisateur modifié.
 */
export function updateUser(userId: string, body: UserUpdateRequest): Promise<Result<User>> {
  return request(apiClient.PATCH('/users/{userId}', { params: { path: { userId } }, body }));
}

/**
 * Supprime un utilisateur.
 * @param userId - UUID de l'utilisateur.
 * @returns Rien en cas de succès (204).
 */
export function deleteUser(userId: string): Promise<Result<void>> {
  return request(apiClient.DELETE('/users/{userId}', { params: { path: { userId } } }));
}

// ---------- Salles ----------

/**
 * Recherche et liste les salles, avec pagination. Route publique.
 * @param query - Filtres optionnels : `search`, `location`, `capacityMin`, `capacityMax`,
 *   `date` (YYYY-MM-DD), `startTime`, `endTime`, `available`, `page`, `pageSize`.
 * @returns Une page de salles.
 */
export function searchRooms(query: SearchRoomsQuery = {}): Promise<Result<PaginatedRooms>> {
  return request(apiClient.GET('/rooms', { params: { query } }));
}

/**
 * Consulte les détails d'une salle. Route publique.
 * @param roomId - UUID de la salle.
 * @returns La salle. Erreur 404 si elle n'existe pas.
 */
export function getRoom(roomId: string): Promise<Result<Room>> {
  return request(apiClient.GET('/rooms/{roomId}', { params: { path: { roomId } } }));
}

/**
 * Ajoute une salle. Réservé aux gestionnaires et administrateurs.
 * @param body - Nom, capacité, localisation et prix horaire (+ champs optionnels).
 * @returns La salle créée.
 */
export function createRoom(body: RoomCreateRequest): Promise<Result<Room>> {
  return request(apiClient.POST('/rooms', { body }));
}

/**
 * Modifie une salle (modification partielle).
 * Réservé au gestionnaire propriétaire de la salle et aux administrateurs.
 * @param roomId - UUID de la salle.
 * @param body - Champs à modifier (au moins un).
 * @returns La salle modifiée.
 */
export function updateRoom(roomId: string, body: RoomUpdateRequest): Promise<Result<Room>> {
  return request(apiClient.PATCH('/rooms/{roomId}', { params: { path: { roomId } }, body }));
}

/**
 * Supprime une salle.
 * Réservé au gestionnaire propriétaire de la salle et aux administrateurs.
 * @param roomId - UUID de la salle.
 * @returns Rien en cas de succès (204). Erreur 409 si la salle ne peut pas être supprimée.
 */
export function deleteRoom(roomId: string): Promise<Result<void>> {
  return request(apiClient.DELETE('/rooms/{roomId}', { params: { path: { roomId } } }));
}

// ---------- Disponibilités ----------

/**
 * Consulte les créneaux d'une salle pour une date donnée. Route publique.
 * @param roomId - UUID de la salle.
 * @param query - `date` (YYYY-MM-DD, obligatoire), `startTime` et `endTime` optionnels.
 * @returns La liste des créneaux avec leur disponibilité.
 */
export function getRoomAvailability(
  roomId: string,
  query: RoomAvailabilityQuery,
): Promise<Result<AvailabilitySlot[]>> {
  return request(
    apiClient.GET('/rooms/{roomId}/availability', { params: { path: { roomId }, query } }),
  );
}

/**
 * Définit les créneaux d'une salle pour une date. Remplace tous les créneaux existants de cette date.
 * Réservé au gestionnaire propriétaire de la salle et aux administrateurs.
 * @param roomId - UUID de la salle.
 * @param body - La date et la liste complète des créneaux.
 * @returns Les créneaux enregistrés.
 */
export function setRoomAvailability(
  roomId: string,
  body: AvailabilityUpdateRequest,
): Promise<Result<AvailabilitySlot[]>> {
  return request(
    apiClient.PUT('/rooms/{roomId}/availability', { params: { path: { roomId } }, body }),
  );
}

// ---------- Réservations ----------

/**
 * Liste les réservations de l'utilisateur connecté, y compris les annulées.
 * @param query - Filtres optionnels : `status`, `from` et `to` (dates incluses, portent sur `startAt`),
 *   `page`, `pageSize`.
 * @returns Une page de réservations.
 */
export function listMyReservations(
  query: ListReservationsQuery = {},
): Promise<Result<PaginatedReservations>> {
  return request(apiClient.GET('/reservations', { params: { query } }));
}

/**
 * Réserve une salle. La réservation est créée au statut PENDING.
 * `startAt` doit être avant `endAt` et `numberOfParticipants` ne doit pas dépasser la capacité (sinon 400).
 * @param body - Salle, début, fin, et optionnellement participants et commentaire.
 * @returns La réservation créée. Erreur 409 si le créneau est indisponible.
 */
export function createReservation(body: ReservationCreateRequest): Promise<Result<Reservation>> {
  return request(apiClient.POST('/reservations', { body }));
}

/**
 * Consulte une réservation.
 * @param reservationId - UUID de la réservation.
 * @returns La réservation.
 */
export function getReservation(reservationId: string): Promise<Result<Reservation>> {
  return request(
    apiClient.GET('/reservations/{reservationId}', { params: { path: { reservationId } } }),
  );
}

/**
 * Modifie une réservation PENDING ou CONFIRMED (sinon 409).
 * Changer le créneau d'une réservation CONFIRMED la repasse en PENDING.
 * @param reservationId - UUID de la réservation.
 * @param body - Champs à modifier (au moins un).
 * @returns La réservation modifiée. Erreur 409 si le nouveau créneau est indisponible.
 */
export function updateReservation(
  reservationId: string,
  body: ReservationUpdateRequest,
): Promise<Result<Reservation>> {
  return request(
    apiClient.PATCH('/reservations/{reservationId}', {
      params: { path: { reservationId } },
      body,
    }),
  );
}

/**
 * Annule une réservation PENDING ou CONFIRMED (sinon 409).
 * Annulation logique : la réservation passe au statut CANCELLED et reste consultable.
 * @param reservationId - UUID de la réservation.
 * @returns Rien en cas de succès (204).
 */
export function cancelReservation(reservationId: string): Promise<Result<void>> {
  return request(
    apiClient.DELETE('/reservations/{reservationId}', { params: { path: { reservationId } } }),
  );
}

/**
 * Confirme une réservation PENDING (sinon 409). Réservé au gestionnaire de la salle et aux administrateurs.
 * @param reservationId - UUID de la réservation.
 * @returns La réservation au statut CONFIRMED.
 */
export function confirmReservation(reservationId: string): Promise<Result<Reservation>> {
  return request(
    apiClient.POST('/reservations/{reservationId}/confirm', {
      params: { path: { reservationId } },
    }),
  );
}

/**
 * Refuse une réservation PENDING (sinon 409). Réservé au gestionnaire de la salle et aux administrateurs.
 * @param reservationId - UUID de la réservation.
 * @param body - Motif du refus, optionnel.
 * @returns La réservation au statut REJECTED.
 */
export function rejectReservation(
  reservationId: string,
  body?: ReservationRejectRequest,
): Promise<Result<Reservation>> {
  return request(
    apiClient.POST('/reservations/{reservationId}/reject', {
      params: { path: { reservationId } },
      body,
    }),
  );
}

// ---------- Paiement ----------

/**
 * Lance le paiement d'une réservation. Réservé au client qui a fait la réservation.
 * @param body - UUID de la réservation et moyen de paiement (`CARD` ou `PAYPAL`).
 * @returns Le paiement créé, avec son `paymentUrl` éventuel.
 */
export function createPayment(body: PaymentCreateRequest): Promise<Result<Payment>> {
  return request(apiClient.POST('/payments', { body }));
}

/**
 * Consulte le statut d'un paiement.
 * @param paymentId - UUID du paiement.
 * @returns Le paiement.
 */
export function getPayment(paymentId: string): Promise<Result<Payment>> {
  return request(apiClient.GET('/payments/{paymentId}', { params: { path: { paymentId } } }));
}

// ---------- Administration ----------

/**
 * Liste toutes les réservations de la plateforme, avec pagination. Réservé aux administrateurs.
 * @param query - Filtres optionnels : `status`, `roomId`, `userId`, `page`, `pageSize`.
 * @returns Une page de réservations.
 */
export function listAllReservations(
  query: AdminReservationsQuery = {},
): Promise<Result<PaginatedReservations>> {
  return request(apiClient.GET('/admin/reservations', { params: { query } }));
}

/**
 * Consulte les statistiques de la plateforme. Réservé aux administrateurs.
 * @param query - Période optionnelle : `from` et `to` (YYYY-MM-DD).
 * @returns Les statistiques (utilisateurs, salles, réservations, revenu total).
 */
export function getStatistics(query: StatisticsQuery = {}): Promise<Result<Statistics>> {
  return request(apiClient.GET('/admin/statistics', { params: { query } }));
}
