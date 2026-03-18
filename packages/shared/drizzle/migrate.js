require('dotenv/config');
const { drizzle } = require('drizzle-orm/node-postgres');
const { migrate } = require('drizzle-orm/node-postgres/migrator');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

migrate(db, { migrationsFolder: './drizzle' })
  .then(() => {
    console.log('Migrations applied successfully!');
    return pool.end();
  })
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err);
    pool.end().finally(() => process.exit(1));
  });
