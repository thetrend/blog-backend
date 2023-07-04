import express from 'express';
import { registerUserHandler } from '../controllers/auth';
import { createUserSchema } from '../schemas/user';
import { validate } from '../middleware/validate';

const router = express.Router();

router.post('/register', validate(createUserSchema), registerUserHandler);

export default router;
