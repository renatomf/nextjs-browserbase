import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const workflows = pgTable("workflows", {
  id: uuid().primaryKey().defaultRandom(),
  organizationId: text().notNull(),
  name: text().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export type Workflow = typeof workflows.$inferSelect
export type NewWorkflow = typeof workflows.$inferInsert
