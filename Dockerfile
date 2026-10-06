# Image Node du projet, pour travailler sans installer Node (voir compose.yaml).
FROM node:24-alpine

# git : nécessaire à `pnpm core:sync` (clone du dépôt core partagé)
RUN apk add --no-cache git \
  && corepack enable \
  && mkdir -p /home/node/.local/share/pnpm /home/node/.cache /app \
  && chown -R node:node /home/node/.local /home/node/.cache /app

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
# Utilisateur non root : les fichiers créés dans le projet (node_modules…) vous appartiennent
USER node
WORKDIR /app
