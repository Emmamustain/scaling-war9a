import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const connectionString = process.env.DATABASE_CONNECTION_STRING_TX || process.env.DATABASE_CONNECTION_STRING;

if (!connectionString) {
  throw new Error(
    "DATABASE_CONNECTION_STRING_TX or DATABASE_CONNECTION_STRING environment variable is required. " +
    "Please set one of these in your .env file with your Supabase database connection string."
  );
}

const sql = postgres(connectionString, {
  prepare: false,
});

export const db = drizzle(sql);
