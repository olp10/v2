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
  console.log('result :>> ', result);
  return result !== null;
}

async function index(req, res) {
  const { user } = req.body;
  return res.render('form', {
    user,
    data: { events: await getEvents()},
    title: 'Undirskriftarlisti - umsjón',
    admin: true,
  });

}

function login(req, res) {
  if (req.isAuthenticated()) {
    console.info('Skráður inn sem Notandi');
    return res.redirect('/admin');
  }

  let message = '';

  if (req.session.messages && req.session.messages.length > 0) {
    message = req.session.messages.join(', ');
    req.session.messages = [];
  }

  return res.render('login', { message, title: 'Innskráning' });
}

/*
async function deleteRoute(req, res) {
  const { id } = req.params;

  // eslint-disable-next-line no-undef
  const deleted = deleteRow(id);

  if (deleted) {
    return res.redirect('/admin');
  }

  return res.render('error', { title: 'Gat ekki eytt færslu' });
}
*/

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


router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
})
