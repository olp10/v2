import express from 'express';
import { catchErrors } from '../lib/utils.js';
import passport, { ensureLoggedIn } from '../login.js';


export const router = express.Router();

async function index(req, res) {
  const { user } = req;

  return res.render('form', {
    user,
    title: 'Undirskriftarlisti - umsjón',
    admin: true,
  });
}

function login(req, res) {
  if (req.isAuthenticated()) {
    console.info('Skráður inn sem Notandi');
    return res.redirect('/index-route.js');
  }

  let message = '';

  if (req.session.messages && req.session.messages.length > 0) {
    message = req.session.messages.join(', ');
    req.session.messages = [];
  }

  return res.render('login', { message, title: 'Innskráning' });
}

async function deleteRoute(req, res) {
  const { id } = req.params;

  // eslint-disable-next-line no-undef
  const deleted = deleteRow(id);

  if (deleted) {
    return res.redirect('/admin');
  }

  return res.render('error', { title: 'Gat ekki eytt færslu' });
}

router.get('/', ensureLoggedIn, catchErrors(index));
router.get('/login', login);
router.post('/delete/:id', ensureLoggedIn, catchErrors(deleteRoute));

router.post(
  '/login',

  passport.authenticate('local', {
    redirect: '/',
    // failureMessage: 'Notandanafn eða lykilorð vitlaust.',
    // failureRedirect: '/admin/login',
  }),

  (req, res) => {
    res.redirect('/admin');
  },
);

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
})
