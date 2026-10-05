# core

Package partagé `@room-booking/core`, indépendant de tout framework : types générés depuis le contrat d'API, client HTTP typé, règles métier et schémas Zod. Il est écrit ensemble en séance 2.

Chaque apprenant le copie dans son propre dépôt avec `pnpm core:sync`. Toute correction se fait ici, puis chacun relance la synchronisation.

## Commandes

```sh
pnpm install
pnpm typecheck     # tsc strict
pnpm lint          # ESLint + typescript-eslint (strictTypeChecked)
pnpm test          # Vitest
pnpm format        # Prettier
```

## Contrat d'API

`openapi.yml` est le contrat OpenAPI de l'API de réservation de salles. Il contient des anomalies connues, relevées en séance 1 : ne pas les corriger en silence dans le code, mais documenter le contournement choisi.
