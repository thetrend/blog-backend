import express from 'express';

import { deserializeUser } from '../middleware/deserializeUser';
import { requireUser } from '../middleware/requireUser';
import { CreateCategoryHandler, ReadAllCategoriesHandler, ReadCategoryHandler, UpdateCategoryHandler } from '../controllers/category';
import { validate } from '../middleware/validate';
import { createCategorySchema, updateCategorySchema } from '../schemas/category';

const router = express.Router();

router.get('/get/all', ReadAllCategoriesHandler);
router.get('/get/:id', ReadCategoryHandler);

router.post('/create', deserializeUser, requireUser, validate(createCategorySchema), CreateCategoryHandler);
router.patch('/update/:id', deserializeUser, requireUser, validate(updateCategorySchema), UpdateCategoryHandler);

export default router;
