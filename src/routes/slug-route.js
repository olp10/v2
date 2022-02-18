import express from 'express';
import { getEventBySlug, getEvents } from '../db.js';
import { catchErrors } from '../lib/catch-errors.js';

export const router = express.Router();

async function slugRoute(req, res) {
  res.render('slug', {
    title: 'Viðburðasíðan',
    data: { events: await getEvents()},
  });
}

router.get('/', catchErrors(slugRoute));

router.get('/:slug', async (req, res) => {
  const data = await getEventBySlug(req.params.slug);
  // console.log('data :>> ', data.name.name);
  res.render('slug', {
    title: 'Viðburður',
    data: {
      name: data.name, description: data.description,
    },
  })
});
