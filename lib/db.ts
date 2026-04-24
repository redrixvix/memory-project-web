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
          WHEN plan IN ('free', 'premium', 'plus') THEN plan
          WHEN plan = 'pro' AND storage_tier = '15gb' THEN 'plus'
          WHEN plan = 'pro' THEN 'premium'
          WHEN storage_tier = '15gb' THEN 'plus'
          WHEN storage_tier = '5gb' THEN 'premium'
          ELSE 'free'
        END
        WHERE plan IS NULL OR plan NOT IN ('free', 'premium', 'plus')
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
