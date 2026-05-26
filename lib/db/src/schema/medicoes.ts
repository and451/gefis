import { pgTable, text, serial, timestamp, numeric, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { contratosTable } from "./contratos";

export const medicoesTable = pgTable("medicoes", {
  id: serial("id").primaryKey(),
  contratoId: integer("contrato_id").notNull().references(() => contratosTable.id, { onDelete: "cascade" }),
  numero: text("numero").notNull(),
  mesReferencia: text("mes_referencia").notNull(),
  periodoInicio: date("periodo_inicio").notNull(),
  periodoFim: date("periodo_fim").notNull(),
  valorMedido: numeric("valor_medido", { precision: 15, scale: 4 }).notNull(),
  valorGlosa: numeric("valor_glosa", { precision: 15, scale: 4 }).notNull().default("0"),
  valorPago: numeric("valor_pago", { precision: 15, scale: 4 }).notNull().default("0"),
  situacao: text("situacao").notNull().default("pendente"),
  numeroNotaFiscal: text("numero_nota_fiscal"),
  dataNotaFiscal: date("data_nota_fiscal"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertMedicaoSchema = createInsertSchema(medicoesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertMedicao = z.infer<typeof insertMedicaoSchema>;
export type Medicao = typeof medicoesTable.$inferSelect;
