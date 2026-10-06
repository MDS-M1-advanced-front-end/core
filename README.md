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
