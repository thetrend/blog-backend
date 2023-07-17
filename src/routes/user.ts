import express from 'express';
import { getMeHandler } from '../controllers/user';
import { deserializeUser } from '../middleware/deserializeUser';
import { requireUser } from '../middleware/requireUser';
import { updateUserHandler } from '../controllers/auth';

const router = express.Router();

router.get('/me', deserializeUser, requireUser, getMeHandler);
router.patch('/edit/:id', deserializeUser, requireUser, updateUserHandler);

export default router;
