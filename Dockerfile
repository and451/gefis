# syntax=docker/dockerfile:1
FROM node:24-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Instala git (necessario para alguns pacotes) e habilita pnpm
RUN apt-get update && apt-get install -y --no-install-recommends git \
  && corepack enable && corepack prepare pnpm@latest --activate \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia os manifestos primeiro para cache de dependencias
COPY pnpm-workspace.yaml package.json ./
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/syscont-web/package.json ./artifacts/syscont-web/
COPY lib/db/package.json ./lib/db/
COPY lib/api-spec/package.json ./lib/api-spec/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY scripts/package.json ./scripts/

# Permite scripts de build (esbuild precisa compilar binarios nativos)
RUN pnpm config set ignore-build-scripts false
RUN pnpm install

# Copia o restante do codigo e faz o build
COPY . .
RUN pnpm run build

ENV NODE_ENV=production
ENV PORT=8080
ENV BASE_PATH=/

EXPOSE 8080

CMD ["node", "--enable-source-maps", "./artifacts/api-server/dist/index.mjs"]
