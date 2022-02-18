import express from 'express';
import { body, validationResult } from 'express-validator';
import { createEvent, getEvents } from '../db.js';
import { catchErrors } from '../lib/utils.js';
import passport, { ensureLoggedIn } from '../login.js';

export const router = express.Router();

async function index(req, res) {
  const user = req.user.username;
  return res.render('form', {
    user,
    data: { events: await getEvents()},
    title: 'Viðburðir - Umsjón',
    admin: true,
    logout: '/admin/logout',
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

const validation = [
  body('name').isLength({ min: 1 }).withMessage('Nafn má ekki vera tómt'),
  body('description')
    .isLength({ min: 1 })
    .withMessage('Viðburðsheiti má ekki vera tómt'),
];


router.post('/admin', validation, validationResult, async (req, res) => {
  console.log('req.params :>> ', req.params);
  const { data } = req.params;
  catchErrors(await createEvent(data));
  res.redirect('/');

  // ensureLoggedIn, catchErrors(createEvent())
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});
