import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { contratosTable } from "./contratos";

export const alertasTable = pgTable("alertas", {
  id: serial("id").primaryKey(),
  contratoId: integer("contrato_id").notNull().references(() => contratosTable.id, { onDelete: "cascade" }),
  tipo: text("tipo").notNull(),
  mensagem: text("mensagem").notNull(),
  lido: boolean("lido").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertAlertaSchema = createInsertSchema(alertasTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAlerta = z.infer<typeof insertAlertaSchema>;
export type Alerta = typeof alertasTable.$inferSelect;
