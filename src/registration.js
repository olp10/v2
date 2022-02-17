import express from 'express';
import { body, validationResult } from 'express-validator';
import xss from 'xss';

import { list, insertEvent, total } from './db.js'
import {
  catchErrors, pagingInfo, PAGE_SIZE, setPagenumber,
} from './lib/utils.js';

export const router = express.Router();

async function index(req, res) {
  let { page = 1 } = req.query;
  page = setPagenumber(page);

  const errors = [];
  const formData = {
    name: '',
    nationalId: '',
    anonymous: false,
    comment: '',
  };

  const offset = (page - 1) * PAGE_SIZE;

  const registrations = await list(offset, PAGE_SIZE);
  const totalRegistrations = await total();
  const paging = await pagingInfo(
    {
      page, offset, totalRegistrations, registrationsLength: registrations.length,
    },
  );

  res.render('index', {
    errors, formData, registrations, paging, title: 'Undirskriftarlisti', admin: false,
  });
}

const validationMiddleware = [
  body('name')
    .isLength({ min: 1 })
    .withMessage('Nafn má ekki vera tómt'),
  body('name')
    .isLength({ max: 128 })
    .withMessage('Nafn má að hámarki vera 128 stafir'),
  body('nationalId')
    .isLength({ min: 1})
    .withMessage('Kennitala má ekki vera tóm'),
  body('comment')
    .isLength({ max: 128 })
    .withMessage('Athugasemd má að hámarki vera 400 stafir'),
];

const xssSanitizationMiddleware = [
  body('name').customSanitizer((v) => xss(v)),
  body('nationalId').customSanitizer((v) => xss(v)),
  body('comment').customSanitizer((v) => xss(v)),
  body('anonymous').customSanitizer((v) => xss(v)),
];

const sanitizationMiddleware = [
  body('name').trim().escape(),
  body('nationalId').blacklist('-'),
];

async function validationCheck(req, res, next) {
  const {
    name, nationalId, comment, anonymous,
  } = req.body;

  const formData = {
    name, nationalId, comment, anonymous,
  };
  const registrations = await list();

  const validation = validationResult(req);

  if (!validation.isEmpty()) {
    return res.render('index', { formData, errors: validation.errors, registrations });
  }

  return next;
}

async function register(req, res) {
  const {
    name, nationalId, comment, anonymous,
  } = req.body;

  let success = true;

  try {
    success = await insertEvent({
      name, nationalId, comment, anonymous,
    });
  } catch (e) {
    console.error(e);
  }

  if (success) {
    return res.redirect('/');
  }

  return res.render('error', { title: 'Gat ekki skráð!', text: 'Hafðir þú skrifað undir áður?' });
}

router.get('/', catchErrors(index));

router.post(
  '/',
  validationMiddleware,
  xssSanitizationMiddleware,
  catchErrors(validationCheck),
  sanitizationMiddleware,
  catchErrors(register),
);
