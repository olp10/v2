import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const {
    DATABASE_URL: connectionString,
    NODE_ENV: nodeEnv = 'development',
} = process.env;

const ssl = nodeEnv !== 'development' ? { rejectUnauthorized: false } : false;

const pool = new pg.Pool({ connectionString, ssl});

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

export async function insert({
    name, nationalId, comment, anonymous,
} = {}) {
    let success = true;

    const q = `
    INSERT INTO signatures
        (name, nationalId, comment, anonymous)
    VALUES
        ($1, $2, $3, $4);
    `;
    const values = [name, nationalId, comment, anonymous === 'on'];

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
			search ? [search] : [],
		);
		return (result.rows && result.rows[0] && result.rows[0].count) || 0;
	} catch (e) {
		console.error('Error counting signatures', e);
	}

	return 0;
}

export async function deleteRow(id) {
	let result = [];
	try {
		const queryResult = await query(
			'DELETE FROM signatures WHERE id = $1',
			[id],
		);

		if (queryResult && queryResult.rows) {
			result = queryResult.rows;
		}
	} catch (e) {
		console.error('Error selecting signatures', e);
	}

	return result;
}


export async function end() {
	await pool.end();
}