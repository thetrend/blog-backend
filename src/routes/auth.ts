import express from 'express';
import { loginUserHandler, logoutUserHandler, refreshAccessTokenHandler, registerUserHandler } from '../controllers/auth';
import { createUserSchema, loginUserSchema } from '../schemas/user';
import { validate } from '../middleware/validate';
import { deserializeUser } from '../middleware/deserializeUser';
import { requireUser } from '../middleware/requireUser';

const router = express.Router();

router.post('/register', validate(createUserSchema), registerUserHandler);
router.post('/login', validate(loginUserSchema), loginUserHandler);
router.get('/refresh', refreshAccessTokenHandler);
router.get('/logout', deserializeUser, requireUser, logoutUserHandler);

export default router;
