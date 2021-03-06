import bcrypt from 'bcrypt';
import { query } from './db.js';

export async function comparePasswords(password, hash) {
  try {
    return await bcrypt.compare(password, hash);
  } catch (e) {
    console.error('Gat ekki borið saman lykilorð', e);
  }

  return false;
}

export async function findByUsername(username) {
  const q = 'SELECT * FROM notendur WHERE username = $1';

  try {
    const result = await query(q, [username]);
    if (result.rowCount === 1) {
      return result.rows[0];
    }
  } catch (e) {
    console.error('Gat ekki fundið notanda eftir notendanafni');
    return null;
  }

  return false;
}

export async function dropUser(username) {
  const q = `
  DELETE FROM
    notendur
  WHERE
    username=$1
  `;

  try {
    await query(q, [username]);
  } catch (e) {
    console.error('Gat ekki eytt notanda', e);
  }
}

export async function createUser(username, password) {
  const hashedPassword = await bcrypt.hash(password, 11);

  const q = `
    INSERT INTO
      notendur (username, password)
    VALUES ($1, $2)
    RETURNING *
  `;

  try {
    const result = await query(q, [username, hashedPassword]);
    return result.rows[0];
  } catch (e) {
    console.error('Gat ekki búið til notanda', e);
  }

  return null;
}

export async function findById(id) {
  const q = 'SELECT * FROM notendur WHERE id = $1';

  try {
    const result = await query(q, [id]);

    if (result.rowCount === 1) {
      return result.rows[0];
    }
  } catch (e) {
    console.error('Gat ekki fundið notanda eftir id');
  }

  return null;
}
