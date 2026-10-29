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
};


export type QueryDashboardArgs = {
  period: InputMaybe<PeriodInput>;
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

export type UserSummary = {
  __typename?: 'UserSummary';
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastName: Scalars['String']['output'];
};
