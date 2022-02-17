import { promises } from 'fs';
import { end, query } from './db.js';

// MUNA `heroku run npm run setup` til að fá gögnin inn

const schemaFile = './sql/schema.sql';
const fakeData = './sql/insert.sql';


async function create() {
  const data = await promises.readFile(schemaFile);
  const fake = await promises.readFile(fakeData);

  await query(data.toString('utf-8'));
  await query(fake.toString('utf-8'));

  await end();

  console.info('Schema created');
}

create().catch((err) => {
  console.error('Error creating running setup', err);
});
