import pg from "pg";
const { Pool } = pg;

const COMPRASNET_BASE = "https://contratos.comprasnet.gov.br/api";
const AEB_UNIDADE_CODIGO = "203001";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL nao definida");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function parseValor(valor) {
  if (!valor) return 0;
  return parseFloat(valor.replace(/\./g, "").replace(",", ".")) || 0;
}

async function getFornecedorId(client, nome, cnpj, tipo) {
  if (cnpj) {
    const r = await client.query(
      "SELECT id FROM fornecedores WHERE cnpj_cpf = $1 LIMIT 1",
      [cnpj.replace(/\D/g, "")]
    );
    if (r.rows.length > 0) return r.rows[0].id;
  }

  const r = await client.query(
    "INSERT INTO fornecedores (nome, cnpj_cpf, tipo_pessoa) VALUES ($1, $2, $3) RETURNING id",
    [nome || "Fornecedor nao identificado", cnpj ? cnpj.replace(/\D/g, "") : null, tipo || "PJ"]
  );
  return r.rows[0].id;
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

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    let importados = 0;
    let pulados = 0;

    for (const c of contratos) {
      const numero = c.numero || String(c.id);

      const existente = await client.query(
        "SELECT id FROM contratos WHERE numero_contrato = $1 LIMIT 1",
        [numero]
      );

      if (existente.rows.length > 0) {
        pulados++;
        continue;
      }

      const fornecedorId = await getFornecedorId(
        client,
        c.fornecedor?.nome,
        c.fornecedor?.cnpj_cpf_idgener,
        c.fornecedor?.tipo === "FISICA" ? "PF" : "PJ"
      );

      const valorInicial = parseValor(c.valor_inicial ?? c.valor_global);
      const valorAtual = parseValor(c.valor_global ?? c.valor_inicial);
      const dataAssinatura = c.data_assinatura ?? new Date().toISOString().split("T")[0];
      const dataVigenciaInicio = c.vigencia_inicio ?? dataAssinatura;
      const dataVigenciaFim = c.vigencia_fim
        ?? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      const modalidadeMap = {
        "Pregão": "pregao_eletronico",
        "Concorrência": "concorrencia",
        "Dispensa": "dispensa",
        "Inexigibilidade": "inexigibilidade",
        "Adesão": "outros",
        "Tomada de Preços": "tomada_precos",
        "Convite": "convite",
      };

      await client.query(
        `INSERT INTO contratos (
          numero_contrato, objeto, fornecedor_id, valor_inicial, valor_atual,
          data_assinatura, data_vigencia_inicio, data_vigencia_fim, status,
          modalidade, categoria_processo, processo, numero_parcelas, observacoes
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [
          numero,
          c.objeto,
          fornecedorId,
          String(valorInicial),
          String(valorAtual),
          dataAssinatura,
          dataVigenciaInicio,
          dataVigenciaFim,
          "vigente",
          modalidadeMap[c.modalidade] || "outros",
          c.categoria || null,
          c.processo || null,
          c.num_parcelas ?? null,
          `Importado do ComprasNet. ID: ${c.id}`,
        ]
      );

      importados++;
    }

    await client.query("COMMIT");
    console.log(`Seed concluido: ${importados} importados, ${pulados} pulados.`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
