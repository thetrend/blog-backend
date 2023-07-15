import express from 'express';
import { emailHandler } from '../controllers/email';

const router = express.Router();

router.post('/send', emailHandler);

export default router;
