import { pgTable, text, serial, timestamp, numeric, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { fornecedoresTable } from "./fornecedores";

export const contratosTable = pgTable("contratos", {
  id: serial("id").primaryKey(),
  numeroContrato: text("numero_contrato").notNull(),
  numeroControlePncp: text("numero_controle_pncp"),
  processo: text("processo"),
  objeto: text("objeto").notNull(),
  fornecedorId: integer("fornecedor_id").notNull().references(() => fornecedoresTable.id),
  valorInicial: numeric("valor_inicial", { precision: 15, scale: 4 }).notNull(),
  valorAtual: numeric("valor_atual", { precision: 15, scale: 4 }).notNull(),
  valorPago: numeric("valor_pago", { precision: 15, scale: 4 }).notNull().default("0"),
  fiscal: text("fiscal"),
  gestor: text("gestor"),
  dataAssinatura: date("data_assinatura").notNull(),
  dataVigenciaInicio: date("data_vigencia_inicio").notNull(),
  dataVigenciaFim: date("data_vigencia_fim").notNull(),
  status: text("status").notNull().default("vigente"),
  modalidade: text("modalidade").notNull(),
  categoriaProcesso: text("categoria_processo"),
  unidadeGestora: text("unidade_gestora"),
  observacoes: text("observacoes"),
  numeroParcelas: integer("numero_parcelas"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertContratoSchema = createInsertSchema(contratosTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertContrato = z.infer<typeof insertContratoSchema>;
export type Contrato = typeof contratosTable.$inferSelect;
