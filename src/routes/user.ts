import express from 'express';
import { getMeHandler } from '../controllers/user';
import { deserializeUser } from '../middleware/deserializeUser';
import { requireUser } from '../middleware/requireUser';

const router = express.Router();

router.use(deserializeUser, requireUser);

router.get('/me', getMeHandler);

export default router;
