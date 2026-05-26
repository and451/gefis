# SysCont — Sistema de Gestao de Contratos Administrativos Publicos

Aplicacao web para gestao do ciclo de vida de contratos administrativos publicos brasileiros. Controle de vigencia, valores, aditivos, medicoes, fornecedores e integracao com sistemas federais (PNCP e ComprasNet).

## Stack

| Camada | Tecnologia |
|--------|------------|
| Monorepo | pnpm workspaces |
| Frontend | React 19 + Vite 7 + Tailwind CSS + shadcn/ui + Radix UI |
| Backend | Express 5 + Pino + Drizzle ORM |
| Banco de dados | PostgreSQL (via `node-postgres`) |
| Tipagem / Validacao | TypeScript 5.9 + Zod |
| Gerenciamento estado | TanStack Query (React Query) |
| Roteamento | wouter |
| Graficos | Recharts |
| Deploy | Docker + Render |

## Estrutura do projeto

```
Syscont/
|-- artifacts/
|   |-- api-server/          # Backend Express (porta 8080)
|   |   |-- src/
|   |   |   |-- app.ts       # Config Express + static files
|   |   |   |-- index.ts     # Entrypoint do servidor
|   |   |   |-- routes/      # Rotas da API
|   |   |   |-- lib/         # Logger (Pino)
|   |-- syscont-web/         # Frontend React (SPA)
|   |   |-- src/
|   |   |   |-- pages/       # Paginas (Dashboard, Contratos, PNCP etc.)
|   |   |   |-- components/  # Componentes shadcn/ui
|   |   |-- dist/public/     # Build de producao (servido pelo Express)
|-- lib/
|   |-- db/                  # Drizzle ORM + schema PostgreSQL
|   |-- api-zod/             # Schemas Zod compartilhados
|   |-- api-spec/            # Especificacao OpenAPI
|   |-- api-client-react/    # Hooks React Query + fetch client
|-- scripts/                 # Scripts utilitarios (seeds)
|-- Dockerfile               # Build unificado (backend + frontend)
|-- render.yaml              # Infra-as-code para Render
|-- .env.example             # Template de variaveis de ambiente
```

## Variaveis de ambiente

| Variavel | Obrigatoria | Descricao |
|----------|-------------|-----------|
| `DATABASE_URL` | Sim | URL de conexao com PostgreSQL |
| `PORT` | Sim | Porta do servidor (padrao: 8080) |
| `BASE_PATH` | Sim | Base path da aplicacao (padrao: `/`) |
| `NODE_ENV` | Nao | `development` ou `production` |

Copie de `.env.example` e ajuste os valores:

```bash
cp .env.example .env
```

## Desenvolvimento local

Requisitos:
- Node.js 24+
- pnpm 11+
- PostgreSQL 14+

```bash
# 1. Instalar dependencias do monorepo
pnpm install

# 2. Buildar bibliotecas e artefatos
pnpm -r run build

# 3. Rodar migrations (Drizzle Kit)
cd lib/db
pnpm drizzle-kit migrate

# 4. Iniciar o servidor de desenvolvimento
cd artifacts/api-server
pnpm run dev

# 5. Em outro terminal, iniciar o frontend
cd artifacts/syscont-web
pnpm run dev
```

O frontend estara em `http://localhost:3000` (ou a porta do Vite) e o backend em `http://localhost:8080`.

## Build de producao

```bash
pnpm -r --filter @workspace/api-server run build
pnpm -r --filter @workspace/syscont-web run build
```

O backend gera `artifacts/api-server/dist/index.mjs` e o frontend gera os arquivos estaticos em `artifacts/syscont-web/dist/public`.

## Deploy no Render

O projeto inclui configuracao para deploy via Docker no Render:

1. Conecte o repositorio GitHub no Render
2. Crie um **Web Service** com runtime **Docker**
3. Configure a variavel `DATABASE_URL` apontando para um **PostgreSQL** provisionado no Render (ou externo)
4. O `render.yaml` ja define `PORT=8080`, `NODE_ENV=production` e `BASE_PATH=/`

O Dockerfile builda frontend e backend em um unico container. O Express serve a API em `/api/*` e os arquivos estaticos do React para todas as outras rotas.

### Health check

```
GET /api/healthz
```

## API — Endpoints principais

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/healthz` | Health check |
| GET | `/api/contratos` | Listar contratos (paginado) |
| POST | `/api/contratos` | Criar contrato |
| GET | `/api/contratos/:id` | Detalhes do contrato (com fornecedor, aditivos, medicoes, alertas) |
| PATCH | `/api/contratos/:id` | Atualizar contrato |
| DELETE | `/api/contratos/:id` | Remover contrato |
| GET | `/api/contratos/:id/aditivos` | Listar aditivos do contrato |
| GET | `/api/contratos/:id/medicoes` | Listar medicoes do contrato |
| GET | `/api/fornecedores` | Listar fornecedores |
| POST | `/api/fornecedores` | Criar fornecedor |
| PATCH | `/api/fornecedores/:id` | Atualizar fornecedor |
| DELETE | `/api/fornecedores/:id` | Remover fornecedor |
| GET | `/api/aditivos` | Listar aditivos |
| POST | `/api/aditivos` | Criar aditivo |
| PATCH | `/api/aditivos/:id` | Atualizar aditivo |
| DELETE | `/api/aditivos/:id` | Remover aditivo |
| GET | `/api/medicoes` | Listar medicoes |
| POST | `/api/medicoes` | Criar medicao |
| PATCH | `/api/medicoes/:id` | Atualizar medicao |
| DELETE | `/api/medicoes/:id` | Remover medicao |
| GET | `/api/alertas` | Listar alertas |
| PATCH | `/api/alertas/:id` | Marcar alerta como lido |
| GET | `/api/dashboard` | Resumo do dashboard (contratos por status, vencimentos, valores) |
| GET | `/api/pncp/buscar` | Buscar contratos no PNCP |
| POST | `/api/pncp/importar` | Importar contrato do PNCP |
| GET | `/api/comprasnet/buscar` | Buscar contratos na ComprasNet |
| POST | `/api/comprasnet/importar` | Importar contrato da ComprasNet |

## Banco de dados

O schema completo esta documentado em `docs/SCHEMA.md`. Resumo das entidades:

- **fornecedores** — empresas/entidades contratadas
- **contratos** — contratos administrativos (com valor inicial, vigencia, status etc.)
- **aditivos** — termos aditivos, apostilas, rescisoes e suspensoes vinculados a contratos
- **medicoes** — acompanhamento mensal de execucao contratual (valores medidos, glosa, pago)
- **alertas** — notificacoes automaticas geradas pelo sistema (ex: vencimento de contrato)

Veja `lib/db/src/schema/` para o codigo-fonte do schema Drizzle ORM.

## Autor

Desenvolvido para gestao de contratos administrativos publicos.
