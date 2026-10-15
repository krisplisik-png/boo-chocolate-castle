import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const visits = sqliteTable("visits", {
  id: text("id").primaryKey(),
  created: text("created"),
});

export const completions = sqliteTable("completions", {
  number: integer("number").primaryKey(),
  runId: text("run_id").notNull().unique(),
  visitorId: text("visitor_id").notNull(),
  created: text("created"),
});
