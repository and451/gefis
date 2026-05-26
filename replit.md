# SysCont Web

Sistema de gestão de contratos administrativos para órgãos públicos, com integração ao PNCP (Portal Nacional de Contratações Públicas) e Contratos.gov.br.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — rodar o servidor API (porta via PORT env)
- `pnpm --filter @workspace/syscont-web run dev` — rodar o frontend (porta via PORT env)
- `pnpm run typecheck` — typecheck completo em todos os pacotes
- `pnpm run build` — typecheck + build de todos os pacotes
- `pnpm --filter @workspace/api-spec run codegen` — regenerar hooks React Query e schemas Zod a partir da spec OpenAPI
- `pnpm --filter @workspace/db run push` — aplicar mudanças no schema do banco (apenas dev)
- Env obrigatória: `DATABASE_URL` — string de conexão Postgres

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 + Pino (logging)
- Frontend: React + Vite + shadcn/ui + Tailwind + Recharts
- DB: PostgreSQL + Drizzle ORM
- Validação: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (a partir da spec OpenAPI)
- Roteamento frontend: wouter
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — fonte da verdade para todos os contratos de API
- `lib/db/src/schema/` — schema do banco (contratos, fornecedores, aditivos, alertas)
- `artifacts/api-server/src/routes/` — rotas Express (contratos, fornecedores, aditivos, alertas, dashboard, pncp)
- `artifacts/syscont-web/src/pages/` — páginas React (Dashboard, Contratos, Fornecedores, PNCP, Alertas)
- `lib/api-client-react/src/generated/` — hooks React Query gerados (NÃO editar manualmente)
- `lib/api-zod/src/generated/` — schemas Zod gerados (NÃO editar manualmente)

## Architecture decisions

- Contract-first: toda mudança de API começa em `openapi.yaml` → codegen → implementação
- PNCP integrado via proxy no backend (rota `/api/pncp/buscar`) para evitar CORS e centralizar tratamento de erros
- Alertas são gerados manualmente ou via seed; não há job automatizado (pode ser adicionado)
- Aditivos do tipo `aditivo` com `valorAcrescimo` atualizam `valor_atual` do contrato automaticamente
- Aditivos com `dataNovaVigencia` atualizam `data_vigencia_fim` do contrato automaticamente

## Product

- **Dashboard** — resumo executivo com totais, valor total ativo em BRL, alertas pendentes, e gráficos de distribuição por status e modalidade
- **Contratos** — CRUD completo com busca, filtros por status, paginação e detalhe com histórico de aditivos
- **Fornecedores** — cadastro e gestão de fornecedores (PJ e PF)
- **Aditivos & Apostilas** — controle de alterações contratuais com atualização automática de valor e vigência
- **Alertas** — central de vencimentos próximos, contratos vencidos e pendências, com marcação de lido
- **Consulta PNCP** — busca e importação direta de contratos publicados no portal federal

## User preferences

- Interface 100% em português (Brasil)
- Foco em simplicidade para o usuário fiscal de contratos
- Integração com PNCP como funcionalidade central

## Gotchas

- Após qualquer mudança em `openapi.yaml`, sempre rodar codegen antes de usar os tipos
- Datas para a API do PNCP devem ser no formato `YYYYMMDD` (sem traços)
- A API do PNCP (`pncp.gov.br`) tem timeout de 15s — falhas são retornadas como 502
- O campo `valor_inicial` e `valor_atual` são `numeric` no banco — converter para `String()` ao inserir/atualizar via Drizzle

## Pointers

- Ver skill `pnpm-workspace` para estrutura do workspace, setup TypeScript e detalhes de pacotes
