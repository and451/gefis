import { Router } from "express";
import { db, fornecedoresTable } from "@workspace/db";
import { eq, ilike, or } from "drizzle-orm";
import {
  ListFornecedoresQueryParams,
  CreateFornecedorBody,
  GetFornecedorParams,
  UpdateFornecedorParams,
  UpdateFornecedorBody,
  DeleteFornecedorParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const query = ListFornecedoresQueryParams.safeParse(req.query);
  if (!query.success) {
    return res.status(400).json({ error: "Parâmetros inválidos" });
  }
  const { busca } = query.data;
  let fornecedores;
  if (busca) {
    fornecedores = await db
      .select()
      .from(fornecedoresTable)
      .where(or(ilike(fornecedoresTable.nome, `%${busca}%`), ilike(fornecedoresTable.cnpjCpf, `%${busca}%`)));
  } else {
    fornecedores = await db.select().from(fornecedoresTable);
  }
  return res.json(fornecedores);
});

router.post("/", async (req, res) => {
  const body = CreateFornecedorBody.safeParse(req.body);
  if (!body.success) {
    return res.status(400).json({ error: "Dados inválidos", details: body.error.issues });
  }
  const [created] = await db.insert(fornecedoresTable).values(body.data).returning();
  return res.status(201).json(created);
});

router.get("/:id", async (req, res) => {
  const params = GetFornecedorParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) return res.status(400).json({ error: "ID inválido" });
  const [fornecedor] = await db.select().from(fornecedoresTable).where(eq(fornecedoresTable.id, params.data.id));
  if (!fornecedor) return res.status(404).json({ error: "Fornecedor não encontrado" });
  return res.json(fornecedor);
});

router.patch("/:id", async (req, res) => {
  const params = UpdateFornecedorParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) return res.status(400).json({ error: "ID inválido" });
  const body = UpdateFornecedorBody.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "Dados inválidos" });
  const [updated] = await db
    .update(fornecedoresTable)
    .set({ ...body.data, updatedAt: new Date() })
    .where(eq(fornecedoresTable.id, params.data.id))
    .returning();
  if (!updated) return res.status(404).json({ error: "Fornecedor não encontrado" });
  return res.json(updated);
});

router.delete("/:id", async (req, res) => {
  const params = DeleteFornecedorParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) return res.status(400).json({ error: "ID inválido" });
  await db.delete(fornecedoresTable).where(eq(fornecedoresTable.id, params.data.id));
  return res.status(204).send();
});

export default router;
