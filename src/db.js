import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { DATABASE_URL: connectionString, NODE_ENV: nodeEnv = 'development' } =
  process.env;

const ssl = nodeEnv !== 'development' ? { rejectUnauthorized: false } : false;

const pool = new pg.Pool({ connectionString, ssl });

pool.on('error', (err) => {
  console.error('Villa í tengingu við gagnagrunn, forrit hættir', err);
  process.exit(-1);
});

export async function query(_query, values = []) {
  const client = await pool.connect();

  try {
    const result = await client.query(_query, values);
    return result;
  } finally {
    client.release();
  }
}

export async function insertEvent({ name, slug, description } = {}) {
  let success = true;

  const q = `
    INSERT INTO vidburdir
        (name, slug, description)
    VALUES
        ($1, $2, $3);
    `;
  const values = [name, slug, description];

  try {
    await query(q, values);
  } catch (e) {
    console.error('Error inserting signature', e);
    success = false;
  }

  return success;
}

export async function list(offset = 0, limit = 10, search = '') {
  const values = [offset, limit];

  let searchPart = '';
  if (search) {
    searchPart = `
            WHERE
            to_tsvector('english', name) @@ plainto_tsquery('english', $3)
            OR
            to_tsvector('english', comment) @@ plainto_tsquery('english', $3)
        `;
    values.push(search);
  }

  let result = [];

  try {
    const q = `
				SELECT
					id, name, nationalId, comment, anonymous, signed
				FROM
					signatures
				${searchPart}
				ORDER BY signed DESC
				OFFSET $1 LIMIT $2
			`;

    const queryResult = await query(q, values);

    if (queryResult && queryResult.rows) {
      result = queryResult.rows;
    }
  } catch (e) {
    console.error('Error selecting signatures', e);
  }

  return result;
}

export async function total(search) {
  let searchPart = '';
  if (search) {
    searchPart = `
			WHERE
			to_tsvector('english', name) @@ plainto_tsquery('english', $3)
			OR
			to_tsvector('english, comment) @@ plainto_tsquery('english', $3)
		`;
  }

  try {
    const result = await query(
      `SELECT COUNT(*) AS count FROM signatures ${searchPart}`,
      search ? [search] : []
    );
    return (result.rows && result.rows[0] && result.rows[0].count) || 0;
  } catch (e) {
    console.error('Error counting signatures', e);
  }

  return 0;
}

export async function deleteEventById(id) {
  let result = [];
  try {
    const queryResult = await query('DELETE FROM vidburdir WHERE id = $1', [
      id,
    ]);

    if (queryResult && queryResult.rows) {
      result = queryResult.rows;
    }
  } catch (e) {
    console.error('Error selecting signatures', e);
  }

  return result;
}

export async function createUser(username, password) {
  const hashedPassword = await bcrypt.hash(password, 11);

  const q = `
    INSERT INTO
      notendur (username, password)
    VALUES($1, $2)
    RETURNING *
  `;

  try {
    const result = await query(q, [username, hashedPassword]);
    return result.rows[0];
  } catch (e) {
    console.error('Gat ekki búið til notanda');
  }

  return null;
}

export async function getRegistrations(id) {
  const q = `
  SELECT
    name, comment
  FROM
    skraningar
  WHERE
    event=$1
  `;
  const values = [id];

  const result = await query(q, values);
  return result.rows;
}

export async function getEventByName(eventName) {
  const q = `
  SELECT
    name, description
  FROM
    vidburdir
  WHERE
    name=$1
  `;
  const values = [eventName];

  const result = await query(q, values);
  console.info('result :>> ', result);
  return result !== null;
}

export async function getEvents() {
  const q = `
  SELECT
    name, slug, description
  FROM
    vidburdir
  `;
  const result = await query(q);
  return result.rows;
}

export async function getEventBySlug(eventSlug) {
  const q = `
  SELECT
    name, description, id
  FROM
    vidburdir
  WHERE
    slug=$1
  `;
  const values = [eventSlug];

  const result = await query(q, values);
  const name = result.rows[0];
  const description = result.rows[1];
  const id = result.rows[2];
  return { name, description, id };
}

export async function createEvent(data) {
  const s = `${data.name}.html`;
  const q = `
  INSERT INTO vidburdir(name, slug, description)
  VALUES ($1, $2, $3)
  `;

  try {
    const result = await query(q, [data.name, s, data.description]);
    return result.rows;
  } catch (e) {
    console.error('Gat ekki bætt við viðburði');
  }

  return null;
}

export async function getEventIdByName(name) {
  const q = `
  SELECT id
  FROM vidburdir
  WHERE
  name=$1;
  `;
  const values = [name];

  const result = await query(q, values);
  return result.rows[0];
}

export async function register(name, comment, eventId) {
  const q = `
  INSERT INTO
    skraningar(name, comment, event)
  VALUES
    ($1, $2, $3);
  `;
  const values = [name, comment, eventId];

  const result = await query(q, values);
  console.info('result.rows :>> ', result.rows);
}

export async function end() {
  await pool.end();
}
