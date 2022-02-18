import express from 'express';
import { query } from '../db.js';
import { catchErrors } from '../lib/utils.js';
import passport, { ensureLoggedIn } from '../login.js';

export const router = express.Router();

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

export async function getEvent(eventName) {
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

async function index(req, res) {
  const user = req.user.username;
  return res.render('form', {
    user,
    data: { events: await getEvents()},
    title: 'Viðburðir - Umsjón',
    admin: true,
    logout: '/logout',
  });

}

function login(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/admin');
  }

  let message = '';

  if (req.session.messages && req.session.messages.length > 0) {
    message = req.session.messages.join(', ');
    req.session.messages = [];
  }

  return res.render('login', { message, title: 'Innskráning' });
}

router.get('/', ensureLoggedIn, catchErrors(index));
router.get('/login', login);
// router.post('/delete/:id', ensureLoggedIn, catchErrors(deleteRoute));

router.post(
  '/login',

  passport.authenticate('local', {
    failureMessage: 'Notandanafn eða lykilorð vitlaust.',
    failureRedirect: '/admin/login',
  }),

  (req, res) => {
    res.redirect('/admin');
  },
);

async function createEvent(name, slug, description) {
  const q = `
  INSERT INTO vidburdir(name, slug, description)
  VALUES ($1, $2, $3)
  `;
  const values = [name, slug, description];

  const result = await query(q, values);
  console.info('result :>> ', result);
  return result !== null;
}

router.post('/admin', ensureLoggedIn, catchErrors(createEvent));

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
})
