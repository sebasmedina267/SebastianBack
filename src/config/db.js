const { Pool } = require('pg');

const databaseUrl = process.env.DATABASE_URL;

const hasValidDatabaseUrl =
  Boolean(databaseUrl) &&
  !databaseUrl.includes('usuario:password@host') &&
  databaseUrl.startsWith('postgres');

const pool = hasValidDatabaseUrl ? new Pool({ connectionString: databaseUrl }) : null;

module.exports = { pool };
