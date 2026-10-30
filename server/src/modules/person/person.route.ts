import { Router } from 'express';
import { getAllPersons, getPerson } from './person.controller.js';

const router = Router();

/* [GET] /api/person/ */
router.get('/', getAllPersons);

/* [GET] /api/person/:id */
router.get('/:id', getPerson);

export default router;