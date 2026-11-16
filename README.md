# core

Package partagé `@room-booking/core`, indépendant de tout framework : types générés depuis le contrat d'API, client HTTP typé, règles métier et schémas Zod. Il est écrit ensemble en séance 2.

Chaque apprenant le copie dans son propre dépôt avec `pnpm core:sync`. Toute correction se fait ici, puis chacun relance la synchronisation.

## Installer

Deux possibilités, au choix. Gardez la même pour tout le module : les dépendances installées par Docker ne fonctionnent pas avec le Node de votre machine, et inversement. Pour changer de mode, supprimez d'abord `node_modules/`.

### Option A : avec Docker (rien d'autre à installer)

Prérequis : Docker Desktop (Windows, macOS) ou Docker Engine avec le plugin Compose (Linux). Toute commande `pnpm` se lance dans le conteneur :

```sh
docker compose run --rm node              # toutes les vérifications (pnpm check)
docker compose run --rm node pnpm test    # une commande au choix
```

Les dépendances sont installées automatiquement à chaque lancement, dans le dossier du projet : votre éditeur voit donc les types.

### Option B : avec Node installé

Prérequis : Node 24 ou plus.

```sh
corepack enable
pnpm install
```

## Commandes

Avec Docker, préfixez chaque commande par `docker compose run --rm node`.

```sh
pnpm check         # tout ce que vérifie la CI : typecheck, lint, format:check, test
pnpm typecheck     # tsc strict
pnpm lint          # ESLint + typescript-eslint (strictTypeChecked)
pnpm test          # Vitest
pnpm format        # Prettier
pnpm generate:api      # src/api/schema.ts depuis openapi.yml
pnpm generate:graphql  # src/graphql/schema.ts et operations.generated.ts depuis admin.graphql
```

## Contrat d'API

`openapi.yml` est le contrat OpenAPI de l'API de réservation de salles. Il contient des anomalies connues, relevées en séance 1 : ne pas les corriger en silence dans le code, mais documenter le contournement choisi.

## Contrat GraphQL du back-office

`admin.graphql` décrit l'API GraphQL du back-office (`POST /api/graphql`) : écran « Demandes » des gestionnaires et espace d'administration. Elle complète l'API REST sans la remplacer : les écrans publics, clients et gestionnaires restent en REST.

Requêtes :

- `dashboard(period)`, **réservée aux administrateurs** : tableaux de bord. Chaque champ (`statistics`, `byStatus`, `timeline`, `rooms`, `topClients`) n'est calculé que s'il est demandé, et prend ses propres arguments (pas de la série, critère de classement, nombre de lignes) ;
- `reservationRequests`, **pour les gestionnaires et les administrateurs** : demandes de réservation de l'écran « Demandes », en attente (`pending`) et traitées (`handled`), avec la salle et le demandeur. Un gestionnaire ne voit que ses salles, un administrateur toutes. Elle remplace `GET /reservations`, la lecture de toutes les salles et un appel par salle et par demandeur (anomalies 4, 5 et 8) ;
- `users(role, page, pageSize)` et `reservations(filter, page, pageSize)`, **réservées aux administrateurs** : listes paginées de l'administration ; chaque réservation arrive avec sa salle et son demandeur.

Mutations (administration) : `changeUserRole`, `deleteUser` (administrateurs ; jamais sur son propre compte), `confirmReservation`, `rejectReservation` (gestionnaire de la salle ou administrateur) et `cancelReservation` (administrateurs). Mêmes règles qu'en REST ; elles renvoient l'élément à jour.

Import depuis `@room-booking/core/graphql`, séparé de l'index principal parce que certains types portent les mêmes noms qu'en REST (`Statistics`, `ReservationStatus`…) :

```ts
import {
  adminChangeUserRole,
  getAdminDashboard,
  getAdminUsers,
  getReservationRequests,
  graphqlRequest,
} from '@room-booking/core/graphql';

// Requêtes prêtes à l'emploi (src/graphql/operations.ts)
const requests = await getReservationRequests({ handledLimit: 10 });
const result = await getAdminDashboard({
  granularity: 'WEEK',
  limit: 5,
  period: { from: '2026-10-01' },
});
const managers = await getAdminUsers({ role: 'GESTIONNAIRE', page: 1, pageSize: 20 });
const promoted = await adminChangeUserRole({ userId, role: 'GESTIONNAIRE' });

// Requête sur mesure : seuls les champs demandés sont calculés
const custom = await graphqlRequest<{
  dashboard: { rooms: { room: { name: string }; bookedHours: number }[] };
}>(
  `{ dashboard { rooms(sort: BOOKED_HOURS, direction: ASC, limit: 3) { room { name } bookedHours } } }`,
);
```

Comme le client REST, les deux renvoient un `Result` et utilisent le jeton de `setAccessToken`. Les erreurs reprennent les codes du REST (`UNAUTHORIZED`, `FORBIDDEN`, `VALIDATION_ERROR`…), avec le statut HTTP correspondant dans `error.status`, même si la réponse GraphQL est en HTTP 200. Une réponse partielle (données et erreurs) est traitée comme une erreur.

Après une modification de `admin.graphql` ou d'une requête de `operations.ts`, relancer `pnpm generate:graphql`. Le back doit charger ce fichier, pas une copie (par exemple à travers un lien symbolique), pour ne pas dériver du contrat.
