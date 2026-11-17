import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "../config.js";
import * as schema from "./schema.js";

// `postgres` is the low-level driver: it opens connections and sends SQL.
// `drizzle` sits on top and lets us write type-safe queries in TypeScript.
export const sql = postgres(config.databaseUrl, { max: 10 });
export const db = drizzle(sql, { schema });

export type Db = typeof db;
