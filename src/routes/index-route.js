import express from 'express';
import { getEventBySlug, getEvents } from '../db.js';
import { catchErrors } from '../lib/catch-errors.js';
import { router as slugRoute } from './slug-route.js';

export const router = express.Router();

async function indexRoute(req, res) {
  res.render('index', {
    title: 'Viðburðasíðan',
    data: { events: await getEvents()},
  });
}

router.get('/', catchErrors(indexRoute));
router.post('/', catchErrors(slugRoute));

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
