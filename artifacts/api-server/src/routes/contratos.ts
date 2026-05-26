import { Router } from "express";
import { db, contratosTable, fornecedoresTable, aditivosTable, alertasTable, medicoesTable } from "@workspace/db";
import { eq, ilike, or, and, sql } from "drizzle-orm";

const router = Router();

function formatContrato(c: typeof contratosTable.$inferSelect) {
  const valorInicial = Number(c.valorInicial);
  const valorAtual = Number(c.valorAtual);
  const valorPago = Number(c.valorPago ?? 0);
  const percentualExecucao = valorAtual > 0 ? Math.round((valorPago / valorAtual) * 100 * 10) / 10 : 0;
  return { ...c, valorInicial, valorAtual, valorPago, percentualExecucao };
}

router.get("/", async (req, res) => {
  const { pagina = "1", tamanhoPagina = "20", status, busca, fornecedorId } = req.query as Record<string, string | undefined>;

  const pageNum = parseInt(pagina) || 1;
  const pageSize = parseInt(tamanhoPagina) || 20;
  const offset = (pageNum - 1) * pageSize;

  const conditions = [];
  if (status && status !== "todos") conditions.push(eq(contratosTable.status, status));
  if (busca) {
    conditions.push(
      or(
        ilike(contratosTable.numeroContrato, `%${busca}%`),
        ilike(contratosTable.objeto, `%${busca}%`),
        ilike(contratosTable.processo, `%${busca}%`)
      )
    );
  }
  if (fornecedorId) conditions.push(eq(contratosTable.fornecedorId, parseInt(fornecedorId)));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(contratosTable)
    .where(where);

  const totalRegistros = countResult?.count ?? 0;
  const totalPaginas = Math.ceil(totalRegistros / pageSize);

  const contratos = await db
    .select({
      id: contratosTable.id,
      numeroContrato: contratosTable.numeroContrato,
      numeroControlePncp: contratosTable.numeroControlePncp,
      processo: contratosTable.processo,
      objeto: contratosTable.objeto,
      fornecedorId: contratosTable.fornecedorId,
      valorInicial: contratosTable.valorInicial,
      valorAtual: contratosTable.valorAtual,
      valorPago: contratosTable.valorPago,
      fiscal: contratosTable.fiscal,
      gestor: contratosTable.gestor,
      dataAssinatura: contratosTable.dataAssinatura,
      dataVigenciaInicio: contratosTable.dataVigenciaInicio,
      dataVigenciaFim: contratosTable.dataVigenciaFim,
      status: contratosTable.status,
      modalidade: contratosTable.modalidade,
      categoriaProcesso: contratosTable.categoriaProcesso,
      unidadeGestora: contratosTable.unidadeGestora,
      observacoes: contratosTable.observacoes,
      numeroParcelas: contratosTable.numeroParcelas,
      createdAt: contratosTable.createdAt,
      updatedAt: contratosTable.updatedAt,
      fornecedor: {
        id: fornecedoresTable.id,
        nome: fornecedoresTable.nome,
        cnpjCpf: fornecedoresTable.cnpjCpf,
        tipoPessoa: fornecedoresTable.tipoPessoa,
        email: fornecedoresTable.email,
        telefone: fornecedoresTable.telefone,
        endereco: fornecedoresTable.endereco,
        cidade: fornecedoresTable.cidade,
        uf: fornecedoresTable.uf,
        ativo: fornecedoresTable.ativo,
        createdAt: fornecedoresTable.createdAt,
      },
    })
    .from(contratosTable)
    .leftJoin(fornecedoresTable, eq(contratosTable.fornecedorId, fornecedoresTable.id))
    .where(where)
    .limit(pageSize)
    .offset(offset)
    .orderBy(contratosTable.createdAt);

  return res.json({
    data: contratos.map(c => {
      const valorAtual = Number(c.valorAtual);
      const valorPago = Number(c.valorPago ?? 0);
      return { ...c, valorInicial: Number(c.valorInicial), valorAtual, valorPago, percentualExecucao: valorAtual > 0 ? Math.round((valorPago / valorAtual) * 100 * 10) / 10 : 0 };
    }),
    totalRegistros,
    totalPaginas,
    numeroPagina: pageNum,
  });
});

router.post("/", async (req, res) => {
  const { fornecedorId, valorInicial, fiscal, gestor, ...rest } = req.body;
  const [created] = await db
    .insert(contratosTable)
    .values({
      ...rest,
      fornecedorId: Number(fornecedorId),
      valorInicial: String(valorInicial),
      valorAtual: String(valorInicial),
      valorPago: "0",
      fiscal: fiscal ?? null,
      gestor: gestor ?? null,
    })
    .returning();

  const [fornecedor] = await db.select().from(fornecedoresTable).where(eq(fornecedoresTable.id, Number(fornecedorId)));

  return res.status(201).json({ ...formatContrato(created), fornecedor: fornecedor ?? null, aditivos: [], medicoes: [], alertas: [] });
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  const [contrato] = await db
    .select({
      id: contratosTable.id,
      numeroContrato: contratosTable.numeroContrato,
      numeroControlePncp: contratosTable.numeroControlePncp,
      processo: contratosTable.processo,
      objeto: contratosTable.objeto,
      fornecedorId: contratosTable.fornecedorId,
      valorInicial: contratosTable.valorInicial,
      valorAtual: contratosTable.valorAtual,
      valorPago: contratosTable.valorPago,
      fiscal: contratosTable.fiscal,
      gestor: contratosTable.gestor,
      dataAssinatura: contratosTable.dataAssinatura,
      dataVigenciaInicio: contratosTable.dataVigenciaInicio,
      dataVigenciaFim: contratosTable.dataVigenciaFim,
      status: contratosTable.status,
      modalidade: contratosTable.modalidade,
      categoriaProcesso: contratosTable.categoriaProcesso,
      unidadeGestora: contratosTable.unidadeGestora,
      observacoes: contratosTable.observacoes,
      numeroParcelas: contratosTable.numeroParcelas,
      createdAt: contratosTable.createdAt,
      updatedAt: contratosTable.updatedAt,
      fornecedor: {
        id: fornecedoresTable.id,
        nome: fornecedoresTable.nome,
        cnpjCpf: fornecedoresTable.cnpjCpf,
        tipoPessoa: fornecedoresTable.tipoPessoa,
        email: fornecedoresTable.email,
        telefone: fornecedoresTable.telefone,
        endereco: fornecedoresTable.endereco,
        cidade: fornecedoresTable.cidade,
        uf: fornecedoresTable.uf,
        ativo: fornecedoresTable.ativo,
        createdAt: fornecedoresTable.createdAt,
      },
    })
    .from(contratosTable)
    .leftJoin(fornecedoresTable, eq(contratosTable.fornecedorId, fornecedoresTable.id))
    .where(eq(contratosTable.id, id));

  if (!contrato) return res.status(404).json({ error: "Contrato não encontrado" });

  const [aditivos, medicoes, alertas] = await Promise.all([
    db.select().from(aditivosTable).where(eq(aditivosTable.contratoId, id)),
    db.select().from(medicoesTable).where(eq(medicoesTable.contratoId, id)).orderBy(medicoesTable.createdAt),
    db.select().from(alertasTable).where(eq(alertasTable.contratoId, id)),
  ]);

  const valorAtual = Number(contrato.valorAtual);
  const valorPago = Number(contrato.valorPago ?? 0);
  const percentualExecucao = valorAtual > 0 ? Math.round((valorPago / valorAtual) * 100 * 10) / 10 : 0;

  return res.json({
    ...contrato,
    valorInicial: Number(contrato.valorInicial),
    valorAtual,
    valorPago,
    percentualExecucao,
    aditivos,
    medicoes: medicoes.map(m => ({ ...m, valorMedido: Number(m.valorMedido), valorGlosa: Number(m.valorGlosa), valorPago: Number(m.valorPago) })),
    alertas,
  });
});

router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  const { valorInicial, ...rest } = req.body;
  const updateData: Record<string, unknown> = { ...rest, updatedAt: new Date() };
  if (valorInicial !== undefined) {
    updateData.valorInicial = String(valorInicial);
  }

  const [updated] = await db
    .update(contratosTable)
    .set(updateData)
    .where(eq(contratosTable.id, id))
    .returning();

  if (!updated) return res.status(404).json({ error: "Contrato não encontrado" });

  const [fornecedor] = await db.select().from(fornecedoresTable).where(eq(fornecedoresTable.id, updated.fornecedorId));
  const [aditivos, medicoes, alertas] = await Promise.all([
    db.select().from(aditivosTable).where(eq(aditivosTable.contratoId, id)),
    db.select().from(medicoesTable).where(eq(medicoesTable.contratoId, id)),
    db.select().from(alertasTable).where(eq(alertasTable.contratoId, id)),
  ]);

  return res.json({ ...formatContrato(updated), fornecedor: fornecedor ?? null, aditivos, medicoes, alertas });
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  await db.delete(contratosTable).where(eq(contratosTable.id, id));
  return res.status(204).send();
});

router.get("/:id/aditivos", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  const aditivos = await db.select().from(aditivosTable).where(eq(aditivosTable.contratoId, id));
  return res.json(aditivos);
});

router.get("/:id/medicoes", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  const medicoes = await db.select().from(medicoesTable).where(eq(medicoesTable.contratoId, id)).orderBy(medicoesTable.createdAt);
  return res.json(medicoes.map(m => ({ ...m, valorMedido: Number(m.valorMedido), valorGlosa: Number(m.valorGlosa), valorPago: Number(m.valorPago) })));
});

export default router;
