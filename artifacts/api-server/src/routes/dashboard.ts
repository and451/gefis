import { Router } from "express";
import { db, contratosTable, fornecedoresTable, alertasTable, medicoesTable } from "@workspace/db";
import { eq, sql, and, lte, gte, lt, count } from "drizzle-orm";

const router = Router();

router.get("/resumo", async (req, res) => {
  const hoje = new Date().toISOString().split("T")[0];
  const em30dias = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const em90dias = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [totalContratos] = await db.select({ count: sql<number>`count(*)::int` }).from(contratosTable);
  const [vigentes] = await db.select({ count: sql<number>`count(*)::int` }).from(contratosTable).where(eq(contratosTable.status, "vigente"));
  const [vencendo30] = await db.select({ count: sql<number>`count(*)::int` }).from(contratosTable)
    .where(and(eq(contratosTable.status, "vigente"), lte(contratosTable.dataVigenciaFim, em30dias), gte(contratosTable.dataVigenciaFim, hoje)));
  const [vencendo90] = await db.select({ count: sql<number>`count(*)::int` }).from(contratosTable)
    .where(and(eq(contratosTable.status, "vigente"), lte(contratosTable.dataVigenciaFim, em90dias), gte(contratosTable.dataVigenciaFim, hoje)));
  const [vencidos] = await db.select({ count: sql<number>`count(*)::int` }).from(contratosTable)
    .where(and(eq(contratosTable.status, "vigente"), lt(contratosTable.dataVigenciaFim, hoje)));
  const [valorTotal] = await db.select({ soma: sql<number>`coalesce(sum(valor_atual::numeric), 0)::float` }).from(contratosTable)
    .where(eq(contratosTable.status, "vigente"));
  const [valorPagoTotal] = await db.select({ soma: sql<number>`coalesce(sum(valor_pago::numeric), 0)::float` }).from(contratosTable)
    .where(eq(contratosTable.status, "vigente"));
  const [totalFornecedores] = await db.select({ count: sql<number>`count(*)::int` }).from(fornecedoresTable);
  const [alertasNaoLidos] = await db.select({ count: sql<number>`count(*)::int` }).from(alertasTable).where(eq(alertasTable.lido, false));
  const [medicoesPendentes] = await db.select({ count: sql<number>`count(*)::int` }).from(medicoesTable)
    .where(eq(medicoesTable.situacao, "pendente"));

  const valorTotalAtivo = valorTotal?.soma ?? 0;
  const valorPago = valorPagoTotal?.soma ?? 0;
  const percentualExecucaoMedio = valorTotalAtivo > 0 ? Math.round((valorPago / valorTotalAtivo) * 100 * 10) / 10 : 0;

  return res.json({
    totalContratos: totalContratos?.count ?? 0,
    contratoVigentes: vigentes?.count ?? 0,
    contratosVencendo30dias: vencendo30?.count ?? 0,
    contratosVencendo90dias: vencendo90?.count ?? 0,
    contratosVencidos: vencidos?.count ?? 0,
    valorTotalAtivo,
    valorPagoTotal: valorPago,
    percentualExecucaoMedio,
    totalFornecedores: totalFornecedores?.count ?? 0,
    alertasNaoLidos: alertasNaoLidos?.count ?? 0,
    medicoesPendentes: medicoesPendentes?.count ?? 0,
  });
});

router.get("/vencimentos", async (req, res) => {
  const hoje = new Date().toISOString().split("T")[0];
  const em90dias = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const contratos = await db
    .select({
      id: contratosTable.id,
      numeroContrato: contratosTable.numeroContrato,
      objeto: contratosTable.objeto,
      fornecedorNome: fornecedoresTable.nome,
      fiscal: contratosTable.fiscal,
      dataVigenciaFim: contratosTable.dataVigenciaFim,
      valorAtual: contratosTable.valorAtual,
      valorPago: contratosTable.valorPago,
      status: contratosTable.status,
    })
    .from(contratosTable)
    .leftJoin(fornecedoresTable, eq(contratosTable.fornecedorId, fornecedoresTable.id))
    .where(and(eq(contratosTable.status, "vigente"), lte(contratosTable.dataVigenciaFim, em90dias)))
    .orderBy(contratosTable.dataVigenciaFim);

  const hoje_ts = new Date(hoje).getTime();
  const result = contratos.map((c) => {
    const fim_ts = new Date(c.dataVigenciaFim).getTime();
    const diasRestantes = Math.ceil((fim_ts - hoje_ts) / (1000 * 60 * 60 * 24));
    const valorAtual = Number(c.valorAtual);
    const valorPago = Number(c.valorPago);
    const percentualExecucao = valorAtual > 0 ? Math.round((valorPago / valorAtual) * 100 * 10) / 10 : 0;
    const nivelAlerta = diasRestantes <= 15 ? "critico" : diasRestantes <= 30 ? "urgente" : "atencao";
    return { ...c, diasRestantes, valorAtual, valorPago, percentualExecucao, nivelAlerta };
  });

  return res.json(result);
});

router.get("/por-status", async (req, res) => {
  const rows = await db
    .select({ status: contratosTable.status, quantidade: sql<number>`count(*)::int` })
    .from(contratosTable)
    .groupBy(contratosTable.status);

  return res.json(rows);
});

router.get("/por-modalidade", async (req, res) => {
  const rows = await db
    .select({
      modalidade: contratosTable.modalidade,
      quantidade: sql<number>`count(*)::int`,
      valorTotal: sql<number>`coalesce(sum(valor_atual::numeric), 0)::float`,
    })
    .from(contratosTable)
    .groupBy(contratosTable.modalidade)
    .orderBy(sql`count(*) desc`);

  return res.json(rows);
});

router.get("/execucao-mensal", async (req, res) => {
  const rows = await db.execute(sql`
    SELECT
      to_char(created_at, 'MM/YYYY') AS mes,
      COALESCE(SUM(valor_pago::numeric), 0)::float AS "valorPago",
      COUNT(*)::int AS "quantidadeMedicoes"
    FROM medicoes
    WHERE situacao = 'paga'
      AND created_at >= NOW() - INTERVAL '12 months'
    GROUP BY to_char(created_at, 'MM/YYYY'), DATE_TRUNC('month', created_at)
    ORDER BY DATE_TRUNC('month', created_at)
  `);

  return res.json(rows.rows);
});

export default router;
