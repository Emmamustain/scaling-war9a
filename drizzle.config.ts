import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

const connectionString = process.env.DATABASE_CONNECTION_STRING_TX || process.env.DATABASE_CONNECTION_STRING;

if (!connectionString) {
  throw new Error("DATABASE_CONNECTION_STRING_TX or DATABASE_CONNECTION_STRING environment variable is required");
}

export default {
  schema: "./database/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: connectionString,
  },
} satisfies Config;
