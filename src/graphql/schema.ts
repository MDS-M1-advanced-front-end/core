export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** Date de Paris, au format YYYY-MM-DD. */
  Date: { input: string; output: string; }
  /** Instant au format ISO 8601, en UTC (2026-10-20T14:00:00.000Z), comme les date-time du REST. */
  DateTime: { input: string; output: string; }
};

export type ClientPerformance = {
  __typename?: 'ClientPerformance';
  confirmedReservations: Scalars['Int']['output'];
  reservations: Scalars['Int']['output'];
  revenue: Scalars['Float']['output'];
  user: UserSummary;
};

export type Dashboard = {
  __typename?: 'Dashboard';
  /** Nombre de réservations et montant par statut. Tous les statuts sont présents, à 0 au besoin. */
  byStatus: Array<StatusBreakdown>;
  /** Début de la période demandée, ou null. */
  from: Maybe<Scalars['Date']['output']>;
  /** Classement des salles, y compris celles sans réservation sur la période. limit : 1 à 50. */
  rooms: Array<RoomPerformance>;
  /** Compteurs globaux, identiques à GET /admin/statistics. Utilisateurs et salles : sans tenir compte de la période. */
  statistics: Statistics;
  /** Série chronologique. Seuls les intervalles qui ont au moins une réservation sont présents. */
  timeline: Array<TimelinePoint>;
  /** Fin de la période demandée, ou null. */
  to: Maybe<Scalars['Date']['output']>;
  /** Clients classés par chiffre d'affaires (au moins une réservation sur la période). limit : 1 à 50. */
  topClients: Array<ClientPerformance>;
};


export type DashboardRoomsArgs = {
  direction?: SortDirection;
  limit?: Scalars['Int']['input'];
  sort?: RoomSort;
};


export type DashboardTimelineArgs = {
  granularity?: Granularity;
};


export type DashboardTopClientsArgs = {
  limit?: Scalars['Int']['input'];
};

/** Pas de temps d'une série : jour, semaine (commence le lundi) ou mois. */
export type Granularity =
  | 'DAY'
  | 'MONTH'
  | 'WEEK';

/**
 * Actions de l'espace d'administration. Erreurs (extensions.status) : 404 si l'élément n'existe pas,
 * 409 si son état l'interdit.
 */
export type Mutation = {
  __typename?: 'Mutation';
  /**
   * Annule une réservation PENDING ou CONFIRMED (comme DELETE /reservations/{id}). Réservé aux
   * administrateurs.
   */
  cancelReservation: ReservationRequest;
  /**
   * Change le rôle d'un utilisateur. 409 sur son propre compte : un administrateur ne peut pas se
   * retirer ses droits. Réservé aux administrateurs.
   */
  changeUserRole: User;
  /**
   * Confirme une demande PENDING (comme POST /reservations/{id}/confirm). Gestionnaire de la salle ou
   * administrateur.
   */
  confirmReservation: ReservationRequest;
  /**
   * Supprime un utilisateur et ses salles ; renvoie son identifiant. 409 s'il a des réservations
   * (ou ses salles), ou sur son propre compte. Réservé aux administrateurs.
   */
  deleteUser: Scalars['ID']['output'];
  /**
   * Refuse une demande PENDING, avec un motif facultatif de 1000 caractères au plus (comme
   * POST /reservations/{id}/reject). Gestionnaire de la salle ou administrateur.
   */
  rejectReservation: ReservationRequest;
};


/**
 * Actions de l'espace d'administration. Erreurs (extensions.status) : 404 si l'élément n'existe pas,
 * 409 si son état l'interdit.
 */
export type MutationCancelReservationArgs = {
  reservationId: Scalars['ID']['input'];
};


/**
 * Actions de l'espace d'administration. Erreurs (extensions.status) : 404 si l'élément n'existe pas,
 * 409 si son état l'interdit.
 */
export type MutationChangeUserRoleArgs = {
  role: UserRole;
  userId: Scalars['ID']['input'];
};


/**
 * Actions de l'espace d'administration. Erreurs (extensions.status) : 404 si l'élément n'existe pas,
 * 409 si son état l'interdit.
 */
export type MutationConfirmReservationArgs = {
  reservationId: Scalars['ID']['input'];
};


/**
 * Actions de l'espace d'administration. Erreurs (extensions.status) : 404 si l'élément n'existe pas,
 * 409 si son état l'interdit.
 */
export type MutationDeleteUserArgs = {
  userId: Scalars['ID']['input'];
};


/**
 * Actions de l'espace d'administration. Erreurs (extensions.status) : 404 si l'élément n'existe pas,
 * 409 si son état l'interdit.
 */
export type MutationRejectReservationArgs = {
  reason: InputMaybe<Scalars['String']['input']>;
  reservationId: Scalars['ID']['input'];
};

/** Période sur la date de début des réservations, bornes incluses. Une borne absente n'est pas appliquée. */
export type PeriodInput = {
  from?: InputMaybe<Scalars['Date']['input']>;
  to?: InputMaybe<Scalars['Date']['input']>;
};

export type Query = {
  __typename?: 'Query';
  /**
   * Tableau de bord sur une période (toutes les réservations si elle est absente).
   * Seuls les champs demandés sont calculés.
   */
  dashboard: Dashboard;
  /**
   * Demandes de réservation sur les salles du gestionnaire connecté (administrateur : toutes les
   * salles), avec la salle et le demandeur. Réservé aux gestionnaires et aux administrateurs.
   */
  reservationRequests: ReservationRequests;
  /**
   * Toutes les réservations, la plus récente (date de début) d'abord, avec la salle et le demandeur.
   * pageSize : 1 à 100. Réservé aux administrateurs.
   */
  reservations: ReservationPage;
  /**
   * Utilisateurs, les derniers inscrits d'abord, filtrables par rôle. pageSize : 1 à 100.
   * Réservé aux administrateurs.
   */
  users: UserPage;
};


export type QueryDashboardArgs = {
  period: InputMaybe<PeriodInput>;
};


export type QueryReservationsArgs = {
  filter: InputMaybe<ReservationFilter>;
  page?: Scalars['Int']['input'];
  pageSize?: Scalars['Int']['input'];
};


export type QueryUsersArgs = {
  page?: Scalars['Int']['input'];
  pageSize?: Scalars['Int']['input'];
  role: InputMaybe<UserRole>;
};

/** Filtres de la liste des réservations ; un filtre absent n'est pas appliqué. */
export type ReservationFilter = {
  roomId?: InputMaybe<Scalars['ID']['input']>;
  status?: InputMaybe<ReservationStatus>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};

export type ReservationPage = {
  __typename?: 'ReservationPage';
  items: Array<ReservationRequest>;
  page: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

/**
 * Réservation avec sa salle et son demandeur : champs du schéma Reservation du REST, avec room et
 * requester à la place de roomId et userId.
 */
export type ReservationRequest = {
  __typename?: 'ReservationRequest';
  comment: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  endAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  numberOfParticipants: Maybe<Scalars['Int']['output']>;
  /** Motif du refus (REJECTED), s'il a été donné. */
  rejectionReason: Maybe<Scalars['String']['output']>;
  requester: UserSummary;
  room: RoomSummary;
  startAt: Scalars['DateTime']['output'];
  status: ReservationStatus;
  totalAmount: Scalars['Float']['output'];
};

export type ReservationRequests = {
  __typename?: 'ReservationRequests';
  /**
   * Demandes traitées (CONFIRMED, REJECTED, COMPLETED), la plus récente d'abord (date de début :
   * la date de traitement n'est pas enregistrée). limit : 1 à 100.
   */
  handled: Array<ReservationRequest>;
  /** Demandes en attente (PENDING), la plus proche d'abord. limit : 1 à 100. */
  pending: Array<ReservationRequest>;
};


export type ReservationRequestsHandledArgs = {
  limit?: Scalars['Int']['input'];
};


export type ReservationRequestsPendingArgs = {
  limit?: Scalars['Int']['input'];
};

export type ReservationStatus =
  | 'CANCELLED'
  | 'COMPLETED'
  | 'CONFIRMED'
  | 'PENDING'
  | 'REJECTED';

export type RoomPerformance = {
  __typename?: 'RoomPerformance';
  /** Heures réservées (réservations confirmées). */
  bookedHours: Scalars['Float']['output'];
  confirmedReservations: Scalars['Int']['output'];
  reservations: Scalars['Int']['output'];
  revenue: Scalars['Float']['output'];
  room: RoomSummary;
};

/** Critère de classement des salles. */
export type RoomSort =
  | 'BOOKED_HOURS'
  | 'RESERVATIONS'
  | 'REVENUE';

export type RoomStatus =
  | 'ACTIVE'
  | 'INACTIVE';

export type RoomSummary = {
  __typename?: 'RoomSummary';
  capacity: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  location: Scalars['String']['output'];
  name: Scalars['String']['output'];
  pricePerHour: Scalars['Float']['output'];
  status: RoomStatus;
};

export type SortDirection =
  | 'ASC'
  | 'DESC';

export type Statistics = {
  __typename?: 'Statistics';
  cancelledReservations: Scalars['Int']['output'];
  confirmedReservations: Scalars['Int']['output'];
  totalReservations: Scalars['Int']['output'];
  totalRevenue: Scalars['Float']['output'];
  totalRooms: Scalars['Int']['output'];
  totalUsers: Scalars['Int']['output'];
};

export type StatusBreakdown = {
  __typename?: 'StatusBreakdown';
  amount: Scalars['Float']['output'];
  count: Scalars['Int']['output'];
  status: ReservationStatus;
};

export type TimelinePoint = {
  __typename?: 'TimelinePoint';
  confirmedReservations: Scalars['Int']['output'];
  /** Premier jour de l'intervalle. */
  date: Scalars['Date']['output'];
  reservations: Scalars['Int']['output'];
  revenue: Scalars['Float']['output'];
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastName: Scalars['String']['output'];
  role: UserRole;
};

export type UserPage = {
  __typename?: 'UserPage';
  items: Array<User>;
  page: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type UserRole =
  | 'ADMINISTRATEUR'
  | 'CLIENT'
  | 'GESTIONNAIRE';

export type UserSummary = {
  __typename?: 'UserSummary';
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastName: Scalars['String']['output'];
};
