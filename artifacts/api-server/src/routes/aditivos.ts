import { Router } from "express";
import { db, aditivosTable, contratosTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  CreateAditivoBody,
  UpdateAditivoParams,
  UpdateAditivoBody,
  DeleteAditivoParams,
} from "@workspace/api-zod";

const router = Router();

router.post("/", async (req, res) => {
  const body = CreateAditivoBody.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "Dados inválidos", details: body.error.issues });

  const [created] = await db.insert(aditivosTable).values({
    ...body.data,
    valorAcrescimo: body.data.valorAcrescimo != null ? String(body.data.valorAcrescimo) : null,
  }).returning();

  if (body.data.dataNovaVigencia) {
    await db.update(contratosTable)
      .set({ dataVigenciaFim: body.data.dataNovaVigencia, updatedAt: new Date() })
      .where(eq(contratosTable.id, body.data.contratoId));
  }

  if (body.data.valorAcrescimo) {
    const [contrato] = await db.select().from(contratosTable).where(eq(contratosTable.id, body.data.contratoId));
    if (contrato) {
      const novoValor = Number(contrato.valorAtual) + body.data.valorAcrescimo;
      await db.update(contratosTable)
        .set({ valorAtual: String(novoValor), updatedAt: new Date() })
        .where(eq(contratosTable.id, body.data.contratoId));
    }
  }

  return res.status(201).json(created);
});

router.patch("/:id", async (req, res) => {
  const params = UpdateAditivoParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) return res.status(400).json({ error: "ID inválido" });

  const body = UpdateAditivoBody.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "Dados inválidos" });

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  const { valorAcrescimo, ...rest } = body.data;
  Object.assign(updateData, rest);
  if (valorAcrescimo !== undefined) {
    updateData.valorAcrescimo = valorAcrescimo != null ? String(valorAcrescimo) : null;
  }

  const [updated] = await db
    .update(aditivosTable)
    .set(updateData)
    .where(eq(aditivosTable.id, params.data.id))
    .returning();

  if (!updated) return res.status(404).json({ error: "Aditivo não encontrado" });

  return res.json(updated);
});

router.delete("/:id", async (req, res) => {
  const params = DeleteAditivoParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) return res.status(400).json({ error: "ID inválido" });
  await db.delete(aditivosTable).where(eq(aditivosTable.id, params.data.id));
  return res.status(204).send();
});

export default router;
