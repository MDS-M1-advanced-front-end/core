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
```

## Contrat d'API

`openapi.yml` est le contrat OpenAPI de l'API de réservation de salles. Il contient des anomalies connues, relevées en séance 1 : ne pas les corriger en silence dans le code, mais documenter le contournement choisi.

### Anomalies connues et contournements

Les numéros sont repris dans les commentaires `Contract anomaly #n` de `src/api/client.ts`.

1. `AuthResponse` renvoie un `refreshToken`, mais aucun endpoint de rafraîchissement n'existe. Le client le transmet tel quel ; à l'expiration, l'app doit redemander une connexion.
2. `PaginatedRooms` et `PaginatedUsers` ne déclarent aucun champ requis (contrairement à `PaginatedReservations`). Le client renvoie toujours un `Paginated<T>` complet : `items` vaut `[]`, `page` 1, `pageSize` 20 et `total` le nombre d'éléments reçus quand ils manquent.
3. `Statistics` ne déclare aucun champ requis. Laissé optionnel : remplacer une valeur absente par 0 afficherait un chiffre faux.
4. `/admin/*` ne déclare pas de réponse `401`. Sans incidence : toute erreur HTTP devient un `ApiError`.
5. Le `409` de `/auth/register` (et plus généralement le schéma `Error`, dont tous les champs sont optionnels) peut arriver sans corps. Le client produit alors `code: "HTTP_<status>"` et un message générique.
6. `DELETE /reservations/{id}` n'efface rien : c'est une annulation (statut `CANCELLED`). Exposé sous le nom `reservations.cancel`.

## Client API

```ts
import { createApiClient } from '@room-booking/core';

const api = createApiClient({
  baseUrl: 'http://localhost:4010', // mock Prism en dev
  getAccessToken: () => session.accessToken, // le token reste géré par l'app
});

const result = await api.rooms.search({ location: 'Paris' });
if (!result.ok) {
  console.error(result.error.code, result.error.message);
} else {
  console.log(result.data.items);
}
```

Le client ne lève jamais d'exception : erreurs HTTP, panne réseau (`status: 0`, `NETWORK_ERROR`) et réponse illisible (`INVALID_RESPONSE`) arrivent toutes dans `result.error`. Vocabulaire métier : voir `CONTEXT.md`.
