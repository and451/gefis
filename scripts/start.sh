#!/bin/sh
set -e

echo "==> Aplicando schema do banco de dados (drizzle-kit push)..."
cd /app && pnpm --filter @workspace/db run push-force || echo "Aviso: push do schema falhou, continuando..."

echo "==> Importando contratos do ComprasNet (seed)..."
cd /app && pnpm exec node scripts/seed-comprasnet.mjs || echo "Aviso: seed falhou, continuando..."

echo "==> Iniciando servidor..."
exec node --enable-source-maps /app/artifacts/api-server/dist/index.mjs
