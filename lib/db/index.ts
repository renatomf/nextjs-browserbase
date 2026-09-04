import "server-only"

import { attachDatabasePool } from "@vercel/functions"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

import * as schema from "./schema"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

// The pool is cached on globalThis so Next.js dev/HMR reloads reuse a single
// pool instead of opening a new one on every module re-evaluation.
const globalForDb = globalThis as unknown as {
  pool: Pool | undefined
}

const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  })

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool
}

// Lets Vercel Fluid drain idle connections when a compute instance shuts down.
// No-op outside of Vercel.
attachDatabasePool(pool)

export const db = drizzle(pool, { schema, casing: "snake_case" })

export { schema }
