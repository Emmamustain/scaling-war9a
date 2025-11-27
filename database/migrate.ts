import { migrate } from "drizzle-orm/postgres-js/migrator";
import * as dotenv from "dotenv";
import { db } from ".";

// Load environment variables
dotenv.config();

const main = async () => {
  const connectionString =
    process.env.DATABASE_CONNECTION_STRING_TX ||
    process.env.DATABASE_CONNECTION_STRING;

  if (!connectionString) {
    console.error(
      "❌ Error: DATABASE_CONNECTION_STRING_TX or DATABASE_CONNECTION_STRING environment variable is required",
    );
    console.error("Please set one of these in your .env file");
    process.exit(1);
  }

  console.log("🔄 Migration running...");
  try {
    await migrate(db, { migrationsFolder: "drizzle" });
    console.log("✅ Migration done!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
};

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
