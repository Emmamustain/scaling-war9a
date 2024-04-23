import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from ".";

const main = async () => {
  console.log("migration running");
  await migrate(db, { migrationsFolder: "drizzle" });
  console.log("migration done!");
};

main().then(() => {
  process.exit();
});
