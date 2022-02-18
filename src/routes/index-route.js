import express from 'express';
import { catchErrors } from '../lib/catch-errors.js';
import { getEvent, getEvents } from './admin-route.js';

export const router = express.Router();

async function indexRoute(req, res) {
  res.render('index', {
    title: 'Viðburðasíðan',
    data: { events: await getEvents()},
  });
}

router.get('/', catchErrors(indexRoute));


async function slug(req, res) {
  const s = req.body;
  console.info('req.body :>> ', req.body);
  const { name, description } = await getEvent(s);
  return res.render(`${s}`, {
    name,
    description,
    slug:s,
  });
}

router.post('/indexRoute', slug);
