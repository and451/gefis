import { Router } from "express";
import { db, medicoesTable, contratosTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [medicao] = await db.select().from(medicoesTable).where(eq(medicoesTable.id, id));
  if (!medicao) return res.status(404).json({ error: "Medição não encontrada" });
  return res.json(formatMedicao(medicao));
});

router.post("/", async (req, res) => {
  const { contratoId, numero, mesReferencia, periodoInicio, periodoFim, valorMedido, valorGlosa, numeroNotaFiscal, dataNotaFiscal, observacoes } = req.body;
  const [nova] = await db.insert(medicoesTable).values({
    contratoId,
    numero,
    mesReferencia,
    periodoInicio,
    periodoFim,
    valorMedido: String(valorMedido),
    valorGlosa: String(valorGlosa ?? 0),
    valorPago: "0",
    situacao: "pendente",
    numeroNotaFiscal: numeroNotaFiscal ?? null,
    dataNotaFiscal: dataNotaFiscal ?? null,
    observacoes: observacoes ?? null,
  }).returning();
  return res.status(201).json(formatMedicao(nova));
});

router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { numero, mesReferencia, periodoInicio, periodoFim, valorMedido, valorGlosa, situacao, numeroNotaFiscal, dataNotaFiscal, observacoes } = req.body;
  const patch: Record<string, unknown> = {};
  if (numero !== undefined) patch.numero = numero;
  if (mesReferencia !== undefined) patch.mesReferencia = mesReferencia;
  if (periodoInicio !== undefined) patch.periodoInicio = periodoInicio;
  if (periodoFim !== undefined) patch.periodoFim = periodoFim;
  if (valorMedido !== undefined) patch.valorMedido = String(valorMedido);
  if (valorGlosa !== undefined) patch.valorGlosa = String(valorGlosa);
  if (situacao !== undefined) patch.situacao = situacao;
  if (numeroNotaFiscal !== undefined) patch.numeroNotaFiscal = numeroNotaFiscal;
  if (dataNotaFiscal !== undefined) patch.dataNotaFiscal = dataNotaFiscal;
  if (observacoes !== undefined) patch.observacoes = observacoes;
  const [updated] = await db.update(medicoesTable).set(patch).where(eq(medicoesTable.id, id)).returning();
  if (!updated) return res.status(404).json({ error: "Medição não encontrada" });
  return res.json(formatMedicao(updated));
});

router.patch("/:id/aprovar", async (req, res) => {
  const id = parseInt(req.params.id);
  const [updated] = await db.update(medicoesTable).set({ situacao: "aprovada" }).where(eq(medicoesTable.id, id)).returning();
  if (!updated) return res.status(404).json({ error: "Medição não encontrada" });
  return res.json(formatMedicao(updated));
});

router.patch("/:id/pagar", async (req, res) => {
  const id = parseInt(req.params.id);
  const { valorPago, numeroNotaFiscal, dataNotaFiscal, observacoes } = req.body;
  const [updated] = await db.update(medicoesTable).set({
    situacao: "paga",
    valorPago: String(valorPago),
    numeroNotaFiscal: numeroNotaFiscal ?? null,
    dataNotaFiscal: dataNotaFiscal ?? null,
    observacoes: observacoes ?? null,
  }).where(eq(medicoesTable.id, id)).returning();
  if (!updated) return res.status(404).json({ error: "Medição não encontrada" });

  // Atualizar valorPago no contrato
  await db.execute(
    sql`UPDATE contratos SET valor_pago = (
      SELECT COALESCE(SUM(valor_pago::numeric), 0) FROM medicoes WHERE contrato_id = ${updated.contratoId}
    ) WHERE id = ${updated.contratoId}`
  );

  return res.json(formatMedicao(updated));
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [deleted] = await db.delete(medicoesTable).where(eq(medicoesTable.id, id)).returning();
  if (!deleted) return res.status(404).json({ error: "Medição não encontrada" });
  return res.status(204).send();
});

function formatMedicao(m: typeof medicoesTable.$inferSelect) {
  return {
    ...m,
    valorMedido: Number(m.valorMedido),
    valorGlosa: Number(m.valorGlosa),
    valorPago: Number(m.valorPago),
  };
}

export default router;
