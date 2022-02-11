import dotenv from 'dotenv';
import express from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const { PORT: port = 3000 } = process.env;

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

// app.use('/', indexRouter);
// TODO admin routes

app.get('/', async (req, res) => {
  console.info('request to /');
  const name = 'test';
  // render nær í ejs view úr views möppunni
  res.render('form', {
  errors: [],
  data: { name },
  });
});

app.post('/post', (req, res) => {
  const { name, event } = req.body;

  res.render('form', {
    title: 'Formið mitt',
    errors: [],
    data: { name, event },  // TEST GÖGN
  });
});



app.get('/admin', (req, res) => {
  res.send('<h1>admin síðan mín</h1>');
});

/* Middleware sem sér um 404 villur */
app.use((err, req, res) => {
  const title = 'Síða fannst ekki';
  console.error('Villa');
  res.status(404).render('error', { title });
});

/** Middleware sem sér um villumeðhöndlun */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  const title = 'Villa kom upp';
  res.status(500).render('error', { title });
})

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
