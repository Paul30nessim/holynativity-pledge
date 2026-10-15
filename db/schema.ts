import {
  pgTable,
  text,
  integer,
  timestamp,
  serial,
  jsonb,
  uniqueIndex,
  check,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
export const pledges = pgTable(
  'pledges',
  {
    id: serial().primaryKey(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    email: text().notNull(),
    phone: text().notNull(),
    project: text().notNull(),
    windowNumber: integer('window_number'),
    amount: integer().notNull(),
    method: text().notNull(),
    status: text().notNull().default('reserved'),
    message: text().notNull().default(''),
    notes: text().notNull().default(''),
  },
  (t) => [
    uniqueIndex('one_active_pledge_per_window')
      .on(t.windowNumber)
      .where(sql`${t.status} <> 'cancelled'`),
    check('positive_amount', sql`${t.amount} > 0`),
    check(
      'valid_window',
      sql`${t.windowNumber} IS NULL OR (${t.windowNumber} BETWEEN 1 AND 36 AND ${t.project} = 'windows')`,
    ),
    check(
      'valid_status',
      sql`${t.status} IN ('pending','reserved','paid','cancelled')`,
    ),
  ],
)
export const settings = pgTable('settings', {
  id: integer().primaryKey(),
  content: jsonb().notNull(),
})
