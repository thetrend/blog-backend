import express from 'express';
import { forgotPasswordHandler, loginUserHandler, logoutUserHandler, refreshAccessTokenHandler, registerUserHandler, resetPasswordHandler } from '../controllers/auth';
import { createUserSchema, loginUserSchema } from '../schemas/user';
import { validate } from '../middleware/validate';
import { deserializeUser } from '../middleware/deserializeUser';
import { requireUser } from '../middleware/requireUser';
import { createResetTokenSchema, retrieveResetTokenSchema } from '../schemas/resetToken';

const router = express.Router();

router.post('/register', validate(createUserSchema), registerUserHandler);
router.post('/login', validate(loginUserSchema), loginUserHandler);
router.get('/refresh', refreshAccessTokenHandler);
router.get('/logout', deserializeUser, requireUser, logoutUserHandler);
router.post('/forgot-password', validate(createResetTokenSchema), forgotPasswordHandler);
router.post('/reset-password', validate(retrieveResetTokenSchema), resetPasswordHandler);

export default router;
