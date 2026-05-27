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
    const contratoIds = [];

    for (const c of contratos) {
      const numero = c.numero || String(c.id);

      const existente = await client.query(
        "SELECT id FROM contratos WHERE numero_contrato = $1 LIMIT 1",
        [numero]
      );

      if (existente.rows.length > 0) {
        contratoIds.push(existente.rows[0].id);
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

      const r = await client.query(
        `INSERT INTO contratos (
          numero_contrato, objeto, fornecedor_id, valor_inicial, valor_atual,
          data_assinatura, data_vigencia_inicio, data_vigencia_fim, status,
          modalidade, categoria_processo, processo, numero_parcelas, observacoes
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id`,
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

      contratoIds.push(r.rows[0].id);
      importados++;
    }

    console.log(`Contratos: ${importados} importados, ${pulados} pulados.`);

    // ============================================================
    // Gerar medicoes de exemplo para ~30% dos contratos
    // ============================================================
    console.log("Gerando medicoes de exemplo...");
    let medicoesCriadas = 0;
    const hoje = new Date();
    const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
                   "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

    for (const contratoId of contratoIds) {
      if (Math.random() > 0.3) continue; // so 30% dos contratos

      const c = await client.query(
        "SELECT valor_atual, data_assinatura, data_vigencia_fim FROM contratos WHERE id = $1",
        [contratoId]
      );
      if (c.rows.length === 0) continue;

      const valorAtual = parseFloat(c.rows[0].valor_atual);
      const dataInicio = new Date(c.rows[0].data_assinatura);
      const numMedicoes = Math.floor(Math.random() * 3) + 2; // 2 a 4 medicoes

      let valorTotalPago = 0;
      for (let i = 0; i < numMedicoes; i++) {
        const mesRef = meses[(dataInicio.getMonth() + i) % 12];
        const anoRef = dataInicio.getFullYear() + Math.floor((dataInicio.getMonth() + i) / 12);
        const periodoInicio = new Date(dataInicio);
        periodoInicio.setMonth(periodoInicio.getMonth() + i);
        const periodoFim = new Date(periodoInicio);
        periodoFim.setMonth(periodoFim.getMonth() + 1);
        periodoFim.setDate(0);

        const valorMedido = Math.round((valorAtual / numMedicoes) * 100) / 100;
        const valorPago = i < numMedicoes - 1 ? valorMedido : 0; // ultima pendente
        valorTotalPago += valorPago;

        await client.query(
          `INSERT INTO medicoes (contrato_id, numero, mes_referencia, periodo_inicio, periodo_fim,
            valor_medido, valor_pago, situacao, observacoes)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [
            contratoId,
            `${i+1}/${numMedicoes}`,
            `${mesRef}/${anoRef}`,
            periodoInicio.toISOString().split("T")[0],
            periodoFim.toISOString().split("T")[0],
            String(valorMedido),
            String(valorPago),
            valorPago > 0 ? "pago" : "pendente",
            `Medicao gerada automaticamente`,
          ]
        );
        medicoesCriadas++;
      }

      // Atualiza valor_pago no contrato
      await client.query(
        "UPDATE contratos SET valor_pago = $1 WHERE id = $2",
        [String(Math.round(valorTotalPago * 100) / 100), contratoId]
      );
    }

    console.log(`Medicoes: ${medicoesCriadas} criadas.`);

    // ============================================================
    // Gerar alertas para contratos vencendo em 90 e 30 dias
    // ============================================================
    console.log("Gerando alertas de vencimento...");
    let alertasCriados = 0;
    const hojeStr = hoje.toISOString().split("T")[0];
    const em30 = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const em90 = new Date(hoje.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const vencendo = await client.query(
      `SELECT id, numero_contrato, data_vigencia_fim, objeto
       FROM contratos
       WHERE status = 'vigente'
         AND data_vigencia_fim <= $1
         AND data_vigencia_fim >= $2`,
      [em90, hojeStr]
    );

    for (const c of vencendo.rows) {
      const fim = new Date(c.data_vigencia_fim);
      const dias = Math.ceil((fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      let tipo = "vencimento_90d";
      let msg = `Contrato ${c.numero_contrato} vence em ${dias} dias.`;

      if (dias <= 30) {
        tipo = "vencimento_30d";
        msg = `Contrato ${c.numero_contrato} vence em ${dias} dias. Atenção urgente!`;
      }
      if (dias <= 15) {
        tipo = "vencimento_critico";
        msg = `Contrato ${c.numero_contrato} vence em ${dias} dias. Ação imediata necessária!`;
      }

      // Evita duplicados
      const dup = await client.query(
        "SELECT 1 FROM alertas WHERE contrato_id = $1 AND tipo = $2 LIMIT 1",
        [c.id, tipo]
      );
      if (dup.rows.length > 0) continue;

      await client.query(
        "INSERT INTO alertas (contrato_id, tipo, mensagem, lido) VALUES ($1,$2,$3,$4)",
        [c.id, tipo, msg, false]
      );
      alertasCriados++;
    }

    console.log(`Alertas: ${alertasCriados} criados.`);

    await client.query("COMMIT");
    console.log("Seed concluido com sucesso!");
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
