import express from 'express';

export const router = express.Router();

/*
router.get('/:slug', async (req, res) => {
  const data = await getEventBySlug(req.params.slug);
  res.render('slug', {
    title: 'Viðburður',
    data: {
      name: data.name, description: data.description,
    },
  })
});


router.post('/', async (req, res) => {
  console.log('req.params :>> ', req.params);
  res.redirect('/');
  await register();
});
*/
