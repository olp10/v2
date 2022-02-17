import express from 'express';
import { catchErrors } from '../lib/catch-errors.js';
import { getEvent, getEvents } from './admin-route.js';

export const router = express.Router();

async function indexRoute(req, res) {
  // const events = await listEvents();
  res.render('index', {
    title: 'Viðburðasíðan',
    data: { events: await getEvents()},
  });
}

router.get('/', catchErrors(indexRoute));


async function slug(req, res) {
  const s = req.body;
  console.log('req.body :>> ', req.body);
  const { name, description } = await getEvent(s);
  return res.render('slug', {
    name,
    description,
  });
}

router.get('/slug', slug)


// TODO útfæra öll routes
