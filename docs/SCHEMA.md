# Schema do Banco de Dados — SysCont

Banco de dados relacional PostgreSQL, modelado com **Drizzle ORM** (`drizzle-orm/pg-core`).

---

## Diagrama ER (simplificado)

```
+----------------+         +------------------+
|  fornecedores  |<--+     |     alertas      |
+----------------+   |     +------------------+
| id (PK)        |   |     | id (PK)          |
| nome           |   |     | contratoId (FK)  |
| cnpjCpf        |   |     | tipo             |
| tipoPessoa     |   |     | mensagem         |
| email          |   |     | lido             |
| telefone       |   |     | createdAt        |
| endereco       |   |     | updatedAt        |
| cidade         |   |     +------------------+
| uf             |   |
| ativo          |   |
| createdAt      |   |
| updatedAt      |   |
+----------------+   |
        |1          |*
        |            +------------------+
        |            |     aditivos     |
        |            +------------------+
        |            | id (PK)          |
        |            | contratoId (FK)  |
        |            | tipo             |
        |            | numero           |
        |            | dataAssinatura   |
        |            | dataNovaVigencia |
        |            | valorAcrescimo   |
        |            | objeto             |
        |            | observacoes        |
        |            | createdAt          |
        |            | updatedAt          |
        |            +------------------+
        |
        |            +------------------+
        |            |    medicoes      |
        |            +------------------+
        |            | id (PK)          |
        |            | contratoId (FK)  |
        |            | numero           |
        |            | mesReferencia    |
        |            | periodoInicio    |
        |            | periodoFim       |
        |            | valorMedido      |
        |            | valorGlosa       |
        |            | valorPago        |
        |            | situacao         |
        |            | numeroNotaFiscal |
        |            | dataNotaFiscal   |
        |            | observacoes      |
        |            | createdAt          |
        |            | updatedAt          |
        |            +------------------+
        |
        v*
+------------------+
|    contratos     |
+------------------+
| id (PK)          |
| numeroContrato   |
| numeroControlePncp |
| processo         |
| objeto             |
| fornecedorId (FK)|
| valorInicial       |
| valorAtual         |
| valorPago          |
| fiscal             |
| gestor             |
| dataAssinatura     |
| dataVigenciaInicio |
| dataVigenciaFim    |
| status             |
| modalidade         |
| categoriaProcesso  |
| unidadeGestora     |
| observacoes        |
| numeroParcelas     |
| createdAt          |
| updatedAt          |
+------------------+
```

---

## Tabelas

### `fornecedores`

Empresas, instituicoes ou pessoas fisicas contratadas pela administracao publica.

| Coluna | Tipo | Obrigatorio | Padrao | Descricao |
|--------|------|-------------|--------|-----------|
| `id` | `serial` | Sim | auto-incremento | Chave primaria |
| `nome` | `text` | Sim | — | Razao social ou nome |
| `cnpjCpf` | `text` | Sim | — | CNPJ ou CPF |
| `tipoPessoa` | `text` | Sim | `PJ` | `PJ` ou `PF` |
| `email` | `text` | Nao | — | E-mail de contato |
| `telefone` | `text` | Nao | — | Telefone |
| `endereco` | `text` | Nao | — | Endereco |
| `cidade` | `text` | Nao | — | Cidade |
| `uf` | `text` | Nao | — | Unidade federativa |
| `ativo` | `boolean` | Sim | `true` | Flag de ativo/inativo |
| `createdAt` | `timestamp` | Sim | `now()` | Data de criacao |
| `updatedAt` | `timestamp` | Sim | `now()` | Data de atualizacao |

---

### `contratos`

Contratos administrativos publicos, com acompanhamento de vigencia, valores e execucao.

| Coluna | Tipo | Obrigatorio | Padrao | Descricao |
|--------|------|-------------|--------|-----------|
| `id` | `serial` | Sim | auto-incremento | Chave primaria |
| `numeroContrato` | `text` | Sim | — | Numero oficial do contrato |
| `numeroControlePncp` | `text` | Nao | — | Numero de controle no PNCP |
| `processo` | `text` | Nao | — | Numero do processo de contratacao |
| `objeto` | `text` | Sim | — | Descricao do objeto contratado |
| `fornecedorId` | `integer` | Sim | — | FK → `fornecedores.id` |
| `valorInicial` | `numeric(15,4)` | Sim | — | Valor original do contrato |
| `valorAtual` | `numeric(15,4)` | Sim | — | Valor atualizado (aditivos) |
| `valorPago` | `numeric(15,4)` | Sim | `0` | Total pago ate o momento |
| `fiscal` | `text` | Nao | — | Nome do fiscal do contrato |
| `gestor` | `text` | Nao | — | Nome do gestor do contrato |
| `dataAssinatura` | `date` | Sim | — | Data de assinatura |
| `dataVigenciaInicio` | `date` | Sim | — | Inicio da vigencia |
| `dataVigenciaFim` | `date` | Sim | — | Termino da vigencia |
| `status` | `text` | Sim | `vigente` | `vigente`, `encerrado`, `rescindido`, `suspenso`, etc. |
| `modalidade` | `text` | Sim | — | Modalidade de licitacao (pregao, concorrencia etc.) |
| `categoriaProcesso` | `text` | Nao | — | Categoria do processo |
| `unidadeGestora` | `text` | Nao | — | Unidade gestora responsavel |
| `observacoes` | `text` | Nao | — | Observacoes gerais |
| `numeroParcelas` | `integer` | Nao | — | Quantidade de parcelas |
| `createdAt` | `timestamp` | Sim | `now()` | Data de criacao |
| `updatedAt` | `timestamp` | Sim | `now()` | Data de atualizacao |

**Relacionamentos:**
- `fornecedorId` → `fornecedores.id` (N:1)
- Cascata implicita via aplicacao para `aditivos`, `medicoes`, `alertas`

---

### `aditivos`

Termos aditivos, apostilas, rescisoes e suspensoes vinculados a um contrato.

| Coluna | Tipo | Obrigatorio | Padrao | Descricao |
|--------|------|-------------|--------|-----------|
| `id` | `serial` | Sim | auto-incremento | Chave primaria |
| `contratoId` | `integer` | Sim | — | FK → `contratos.id` (onDelete: cascade) |
| `tipo` | `text` | Sim | — | `aditivo`, `apostila`, `rescisao`, `suspensao` |
| `numero` | `text` | Sim | — | Numero do termo aditivo |
| `dataAssinatura` | `date` | Sim | — | Data de assinatura do aditivo |
| `dataNovaVigencia` | `date` | Nao | — | Nova data de vigencia, se houver |
| `valorAcrescimo` | `numeric(15,4)` | Nao | — | Valor de acrescimo/reducao |
| `objeto` | `text` | Sim | — | Objeto do aditivo |
| `observacoes` | `text` | Nao | — | Observacoes |
| `createdAt` | `timestamp` | Sim | `now()` | Data de criacao |
| `updatedAt` | `timestamp` | Sim | `now()` | Data de atualizacao |

---

### `medicoes`

Registro mensal de acompanhamento da execucao contratual (mediacao de valores).

| Coluna | Tipo | Obrigatorio | Padrao | Descricao |
|--------|------|-------------|--------|-----------|
| `id` | `serial` | Sim | auto-incremento | Chave primaria |
| `contratoId` | `integer` | Sim | — | FK → `contratos.id` (onDelete: cascade) |
| `numero` | `text` | Sim | — | Numero da medicao |
| `mesReferencia` | `text` | Sim | — | Mes/ano de referencia (ex: `05/2026`) |
| `periodoInicio` | `date` | Sim | — | Inicio do periodo medido |
| `periodoFim` | `date` | Sim | — | Fim do periodo medido |
| `valorMedido` | `numeric(15,4)` | Sim | — | Valor medido no periodo |
| `valorGlosa` | `numeric(15,4)` | Sim | `0` | Valor glosado |
| `valorPago` | `numeric(15,4)` | Sim | `0` | Valor efetivamente pago |
| `situacao` | `text` | Sim | `pendente` | `pendente`, `aprovada`, `paga`, `glosada` |
| `numeroNotaFiscal` | `text` | Nao | — | NF referente |
| `dataNotaFiscal` | `date` | Nao | — | Data da NF |
| `observacoes` | `text` | Nao | — | Observacoes |
| `createdAt` | `timestamp` | Sim | `now()` | Data de criacao |
| `updatedAt` | `timestamp` | Sim | `now()` | Data de atualizacao |

---

### `alertas`

Notificacoes automaticas geradas pelo sistema (ex: contratos proximos do vencimento).

| Coluna | Tipo | Obrigatorio | Padrao | Descricao |
|--------|------|-------------|--------|-----------|
| `id` | `serial` | Sim | auto-incremento | Chave primaria |
| `contratoId` | `integer` | Sim | — | FK → `contratos.id` (onDelete: cascade) |
| `tipo` | `text` | Sim | — | Categoria do alerta (`vencimento`, `medicao_pendente` etc.) |
| `mensagem` | `text` | Sim | — | Texto descritivo do alerta |
| `lido` | `boolean` | Sim | `false` | Flag de leitura |
| `createdAt` | `timestamp` | Sim | `now()` | Data de criacao |
| `updatedAt` | `timestamp` | Sim | `now()` | Data de atualizacao |

---

## Comandos utilitarios (Drizzle Kit)

```bash
cd lib/db

# Gerar migration a partir do schema
pnpm drizzle-kit generate

# Aplicar migrations no banco
pnpm drizzle-kit migrate

# Abrir visualizador do banco (studio)
pnpm drizzle-kit studio
```

## Arquivos-fonte

- `lib/db/src/schema/contratos.ts`
- `lib/db/src/schema/fornecedores.ts`
- `lib/db/src/schema/aditivos.ts`
- `lib/db/src/schema/medicoes.ts`
- `lib/db/src/schema/alertas.ts`
- `lib/db/src/schema/index.ts`
- `lib/db/src/index.ts` — conexao com o pool PostgreSQL
- `lib/db/drizzle.config.ts` — configuracao do Drizzle Kit
