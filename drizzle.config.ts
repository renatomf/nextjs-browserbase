import { config } from "dotenv"
import { defineConfig } from "drizzle-kit"

config({ path: ".env.local" })

if (!process.env.DATABASE_URL_UNPOOLED) {
  throw new Error("DATABASE_URL_UNPOOLED is not set in .env.local")
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  // Migrations need a direct (non-pooled) connection: PgBouncer runs in
  // transaction mode and does not support session-level operations.
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED,
  },
  casing: "snake_case",
})
