import { pgTable, text, serial, timestamp, numeric, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { contratosTable } from "./contratos";

export const aditivosTable = pgTable("aditivos", {
  id: serial("id").primaryKey(),
  contratoId: integer("contrato_id").notNull().references(() => contratosTable.id, { onDelete: "cascade" }),
  tipo: text("tipo").notNull(),
  numero: text("numero").notNull(),
  dataAssinatura: date("data_assinatura").notNull(),
  dataNovaVigencia: date("data_nova_vigencia"),
  valorAcrescimo: numeric("valor_acrescimo", { precision: 15, scale: 4 }),
  objeto: text("objeto").notNull(),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertAditivoSchema = createInsertSchema(aditivosTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAditivo = z.infer<typeof insertAditivoSchema>;
export type Aditivo = typeof aditivosTable.$inferSelect;
