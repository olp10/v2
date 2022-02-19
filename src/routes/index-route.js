import express from 'express';
import { getEventBySlug, getEventIdByName, getEvents, getRegistrations, register } from '../db.js';
import { catchErrors } from '../lib/catch-errors.js';

export const router = express.Router();

async function indexRoute(req, res) {
  res.render('index', {
    title: 'Viðburðasíðan',
    data: { events: await getEvents()},
  });
}

router.get('/', catchErrors(indexRoute));
// router.post('/', catchErrors(slugRoute));


router.get('/:slug', async (req, res) => {
  const data = await getEventBySlug(req.params.slug);
  const registrations = await getRegistrations(data.name.id);
  res.render('slug', {
    title: 'Viðburður',
    registrations,
    data: {
      name: data.name, comment: data.description,
    },
  })
});

router.post('/', async (req, res) => {
  const id = await getEventIdByName(req.body.eventName);
  register(req.body.name, req.body.comment, id.id);
  res.redirect(req.get('referer'));
});

