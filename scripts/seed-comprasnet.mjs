import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const COMPRASNET_BASE = "https://contratos.comprasnet.gov.br/api";
const AEB_UNIDADE_CODIGO = "203001";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL nao definida");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

function parseValor(valor) {
  if (!valor) return 0;
  return parseFloat(valor.replace(/\./g, "").replace(",", ".")) || 0;
}

async function seed() {
  console.log("Buscando contratos da AEB no ComprasNet...");

  const response = await fetch(`${COMPRASNET_BASE}/contrato/ug/${AEB_UNIDADE_CODIGO}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    console.error("Erro ao buscar ComprasNet:", response.status, await response.text());
    process.exit(1);
  }

  const contratos = await response.json();
  console.log(`Encontrados ${contratos.length} contratos`);

  let importados = 0;
  let pulados = 0;

  for (const c of contratos) {
    const numero = c.numero || String(c.id);

    const existente = await db
      .select()
      .from(schema.contratosTable)
      .where(eq(schema.contratosTable.numeroContrato, numero))
      .limit(1);

    if (existente.length > 0) {
      pulados++;
      continue;
    }

    let fornecedorId = null;
    if (c.fornecedor?.nome) {
      const cnpj = c.fornecedor.cnpj_cpf_idgener?.replace(/\D/g, "") ?? "";
      if (cnpj) {
        const [f] = await db
          .select()
          .from(schema.fornecedoresTable)
          .where(eq(schema.fornecedoresTable.cnpjCpf, cnpj))
          .limit(1);
        if (f) fornecedorId = f.id;
      }

      if (!fornecedorId) {
        const tipo = c.fornecedor.tipo === "FISICA" ? "PF" : "PJ";
        const [novo] = await db
          .insert(schema.fornecedoresTable)
          .values({
            nome: c.fornecedor.nome,
            cnpjCpf: cnpj || null,
            tipoPessoa: tipo,
          })
          .returning();
        fornecedorId = novo.id;
      }
    }

    if (!fornecedorId) {
      const [padrao] = await db
        .insert(schema.fornecedoresTable)
        .values({ nome: c.fornecedor?.nome || "Fornecedor nao identificado", tipoPessoa: "PJ" })
        .returning();
      fornecedorId = padrao.id;
    }

    const valorInicial = parseValor(c.valor_inicial ?? c.valor_global);
    const valorAtual = parseValor(c.valor_global ?? c.valor_inicial);
    const dataAssinatura = c.data_assinatura ?? new Date().toISOString().split("T")[0];
    const dataVigenciaInicio = c.vigencia_inicio ?? dataAssinatura;
    const dataVigenciaFim = c.vigencia_fim ?? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const modalidadeMap = {
      "Pregão": "pregao_eletronico",
      "Concorrência": "concorrencia",
      "Dispensa": "dispensa",
      "Inexigibilidade": "inexigibilidade",
      "Adesão": "outros",
      "Tomada de Preços": "tomada_precos",
      "Convite": "convite",
    };

    await db.insert(schema.contratosTable).values({
      numeroContrato: numero,
      objeto: c.objeto,
      fornecedorId,
      valorInicial: String(valorInicial),
      valorAtual: String(valorAtual),
      dataAssinatura,
      dataVigenciaInicio,
      dataVigenciaFim,
      status: "vigente",
      modalidade: modalidadeMap[c.modalidade] || "outros",
      categoriaProcesso: c.categoria || null,
      processo: c.processo || null,
      numeroParcelas: c.num_parcelas ?? null,
      observacoes: `Importado do ComprasNet. ID: ${c.id}`,
    });

    importados++;
  }

  console.log(`Seed concluido: ${importados} importados, ${pulados} pulados.`);
  await pool.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
