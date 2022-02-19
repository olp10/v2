import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import { body, validationResult } from 'express-validator';
import { dirname, join } from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';
import { createEvent, getEvents } from './db.js';
import passport from './login.js';
import { router as adminRoute } from './routes/admin-route.js';
import { router as indexRouter } from './routes/index-route.js';
import { router as slugRouter } from './routes/slug-route.js';

dotenv.config();

const {
  // eslint-disable-next-line no-unused-vars
  HOST: hostname = '127.0.0.1',
  PORT: port = 3000,
  DATABASE_URL: connectionString,
  NODE_ENV: nodeEnv,
} = process.env;

if (!connectionString) {
  console.error('Vantar gögn í env');
  process.exit(1);
}

const app = express();

// Notum SSL tengingu við gagnagrunn ef við erum *ekki* í development
// mode, á heroku, ekki á local vél
const ssl = nodeEnv !== 'development' ? { rejectUnauthorized: false } : false;

const pool = new pg.Pool({ connectionString, ssl });

pool.on('error', (err) => {
  console.error('postgres error, exiting... ', err);
  process.exit(-1);
});

// Sér um að req.body innihaldi gögn úr formi
app.use(express.urlencoded({ extended: true }));

const path = dirname(fileURLToPath(import.meta.url));

app.use(express.static(join(path, '../public')));

app.set('views', join(path, '../views'));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
  maxAge: 20 * 1000, // 20 sek
}));

app.use(passport.initialize());
app.use(passport.session());

/** Hjálparfall til að athuga hvort reitur sé gildur eða ekki
 *
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


app.use('/admin', adminRoute);
app.use('/slug', slugRouter);
app.use('/', indexRouter);

indexRouter.post('/admin/login', adminRoute);

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

const validation = [
  body('name').isLength({ min: 1 }).withMessage('Nafn má ekki vera tómt'),
  body('description')
    .isLength({ min: 1 })
    .withMessage('Viðburðsheiti má ekki vera tómt'),
];

const validationResults = (req, res, next) => {
  const { name = '', description = '' } = req.body;

  const result = validationResult(req);

  if (!result.isEmpty()) {
    // const errorMessages = errors.array().map((i) => i.msg);
    return res.render('form', {
      title: 'Formið mitt',
      errors: result.errors,
      data: { name, description },
    });
  }

  return next();
};

const postEvent = async (req, res) => {
  const { name, description } = req.body;
  console.info('req.body :>> ', req.body);
  const created = await createEvent({ name, slug: '', description });

  if (created) {
    return res.send('<p>Athugasemd móttekin</p>');

  }

  return res.render('form', {
    title: 'Formið mitt',
    errors: [{ param: '', msg: 'Gat ekki búið til athugasemd' }],
    data: { name, description },
  });
};

app.post('/admin', validation, validationResults, postEvent);

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


/*
indexRouter.post('/:slug', (req, res) => {
  console.info('req.body :>> ', req.body);
  res.redirect('/');
});
*/

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
