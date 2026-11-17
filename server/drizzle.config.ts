import { defineConfig } from "drizzle-kit";

// Config for drizzle-kit, the command-line tool that turns schema.ts into SQL
// migration files and applies them to the database.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle", // generated SQL migrations live here (and are committed to git)
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://synthcore:synthcore@localhost:5432/synthcore",
  },
});
