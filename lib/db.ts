import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL || 'postgresql://placeholder');

export default sql;