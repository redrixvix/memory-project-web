import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

async function migrate() {
  console.log('Running Google auth schema migration...');

  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE`;
    console.log('✓ google_id column added (or already exists)');

    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url TEXT`;
    console.log('✓ profile_image_url column added (or already exists)');

    console.log('\n✅ Migration complete!');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

migrate();