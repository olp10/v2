import dotenv from 'dotenv';
import express from 'express';
import { body, validationResult } from 'express-validator';
import { dirname, join } from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';

dotenv.config();

const {
  // eslint-disable-next-line no-unused-vars
  HOST: hostname = '127.0.0.1',
  PORT: port = 3000,
  DATABASE_URL: connectionString,
  NODE_ENV: nodeEnv,
} = process.env;

// Notum SSL tengingu við gagnagrunn ef við erum *ekki* í development
// mode, á heroku, ekki á local vél
const ssl = nodeEnv !== 'development' ? { rejectUnauthorized: false } : false;

const pool = new pg.Pool({ connectionString, ssl });

pool.on('error', (err) => {
  console.error('postgres error, exiting... ', err);
  process.exit(-1);
});

const app = express();

// Sér um að req.body innihaldi gögn úr formi
app.use(express.urlencoded({ extended: true }));

const path = dirname(fileURLToPath(import.meta.url));

app.use(express.static(join(path, '../public')));

app.set('views', join(path, '../views'));
app.set('view engine', 'ejs');

/**
 *
 * @param {string} field Heiti á reit í formi
 * @param {array} errors Fylki af villum frá express-validator pakkanum
 * @returns {boolean} `true` ef `field` er í `errors`, `false` annars
 */
function isInvalid(field, errors = []) {
  // Boolean skilar `true` ef gildi er truthy (eitthvað finnst)
  // eða `false` ef gildi er falsy (ekkert fannst: null)
  return Boolean(errors.find((i) => i && i.param === field));
}

app.locals.isInvalid = isInvalid;

app.locals = {
  // TODO hjálparföll fyrir template
};

// TODO admin routes

async function query(q, values) {
  let client;

  try {
    client = await pool.connect();
  } catch (e) {
    console.error('Unable to connect', e);
    return null;
  }

  try {
    const result = await client.query(q, values);
    return result;
  } catch (e) {
    console.error('Error running query', e);
    return null;
  } finally {
    client.release();
  }
}

async function getEvents() {
  const q = `
  SELECT
    name, slug, description
  FROM
    vidburdir
  `;
  const result = await query(q);
  return result.rows;
}

app.get('/admin', async (req, res) => {
  console.info('request to /admin');
  const eventsList = await getEvents();
  console.info('eventList :>> ', eventsList);
  const name = 'test';
  res.render('form', {
    errors: [],
    data: { title: name, events: eventsList },
  });
});

async function createEvent({ name, event }) {
  const q = `
  INSERT INTO
    vidburdir(name, slug, description)
  VALUES($1, $2, $3)
  RETURNING *`;
  const values = [name, '', event];

  const result = await query(q, values);
  console.info('result :>> ', result);
  return result !== null;
}

const validation = [
  body('name').isLength({ min: 1 }).withMessage('Nafn má ekki vera tómt'),
  body('event')
    .isLength({ min: 1 })
    .withMessage('Viðburðsheiti má ekki vera tómt'),
];

const validationResults = (req, res, next) => {
  const { name = '', event = '' } = req.body;

  const result = validationResult(req);

  if (!result.isEmpty()) {
    // const errorMessages = errors.array().map((i) => i.msg);
    return res.render('form', {
      title: 'Formið mitt',
      errors: result.errors,
      data: { name, event },
    });
  }

  return next();
};

const postEvent = async (req, res) => {
  const { name, event } = req.body;
  console.info('req.body :>> ', req.body);
  const created = await createEvent({ name, event });

  if (created) {
    return res.send('<p>Athugasemd móttekin</p>');
  }

  return res.render('form', {
    title: 'Formið mitt',
    errors: [{ param: '', msg: 'Gat ekki búið til athugasemd' }],
    data: { name, event },
  });
};

app.post('/admin', validation, validationResults, postEvent);

app.get('/admin', (req, res) => {
  res.send('<h1>admin síðan mín</h1>');
});

// eslint-disable-next-line no-unused-vars
function notFoundHandler(req, res, next) {
  const title = 'Síða fannst ekki';
  res.status(404).render('error', { title });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);
  const title = 'Villa kom upp';
  res.status(500).render('error', { title });
}

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
