import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL ?? '');

let databaseReady = false;
let databaseReadyPromise: Promise<void> | null = null;

export async function ensureDatabaseReady() {
  if (databaseReady) {
    return;
  }

  if (!databaseReadyPromise) {
    databaseReadyPromise = (async () => {
      await sql`ALTER TABLE books ADD COLUMN IF NOT EXISTS plan TEXT`;
      await sql`ALTER TABLE books ALTER COLUMN plan SET DEFAULT 'free'`;
      await sql`
        UPDATE books
        SET plan = CASE
          WHEN storage_tier IS NULL OR storage_tier = 'free' THEN 'free'
          ELSE 'pro'
        END
        WHERE plan IS NULL
      `;
      databaseReady = true;
    })().catch((error) => {
      databaseReadyPromise = null;
      throw error;
    });
  }

  await databaseReadyPromise;
}

export default sql;
