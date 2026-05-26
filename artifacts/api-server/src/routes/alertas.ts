import { Router } from "express";
import { db, alertasTable, contratosTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import {
  ListAlertasQueryParams,
  MarcarAlertaLidoParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const query = ListAlertasQueryParams.safeParse(req.query);
  if (!query.success) return res.status(400).json({ error: "Parâmetros inválidos" });

  const { lido } = query.data;

  const conditions = [];
  if (lido !== undefined && lido !== null) {
    conditions.push(eq(alertasTable.lido, lido));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const alertas = await db
    .select({
      id: alertasTable.id,
      contratoId: alertasTable.contratoId,
      contratoNumero: contratosTable.numeroContrato,
      tipo: alertasTable.tipo,
      mensagem: alertasTable.mensagem,
      lido: alertasTable.lido,
      createdAt: alertasTable.createdAt,
    })
    .from(alertasTable)
    .leftJoin(contratosTable, eq(alertasTable.contratoId, contratosTable.id))
    .where(where)
    .orderBy(alertasTable.createdAt);

  return res.json(alertas);
});

router.patch("/:id/marcar-lido", async (req, res) => {
  const params = MarcarAlertaLidoParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) return res.status(400).json({ error: "ID inválido" });

  const [updated] = await db
    .update(alertasTable)
    .set({ lido: true, updatedAt: new Date() })
    .where(eq(alertasTable.id, params.data.id))
    .returning();

  if (!updated) return res.status(404).json({ error: "Alerta não encontrado" });

  const [contrato] = await db.select().from(contratosTable).where(eq(contratosTable.id, updated.contratoId));

  return res.json({ ...updated, contratoNumero: contrato?.numeroContrato ?? null });
});

export default router;
