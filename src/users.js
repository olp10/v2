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



