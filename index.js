import pg from 'pg';

const connectionString = 'postgres://olafur:admin@localhost/db-test';

const pool = new pg.Pool({ connectionString });

async function main() {
  const client = await pool.connect();
  const result = await client.query('SELECT * FROM test');
  console.log(result.rows);
  await client.release();
  await pool.end();
}

main().catch((e) => console.error(e));
