import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_CONNECTION_STRING_TX as string, {
  prepare: false,
});

export const db = drizzle(sql);
