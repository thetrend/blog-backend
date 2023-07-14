import express from 'express';

import { deserializeUser } from '../middleware/deserializeUser';
import { requireUser } from '../middleware/requireUser';
import { validate } from '../middleware/validate';
import { createPostSchema, updatePostSchema } from '../schemas/post';
import { CreatePostHandler, DeletePostHandler, ReadAllPostsHandler, ReadPostHandler, UpdatePostHandler } from '../controllers/post';

const router = express.Router();

router.post('/create', deserializeUser, requireUser, validate(createPostSchema), CreatePostHandler);
router.get('/get/all', ReadAllPostsHandler);
router.get('/get/:id', ReadPostHandler);
router.patch('/update/:id', deserializeUser, requireUser, validate(updatePostSchema), UpdatePostHandler);
router.delete('/delete/:id', deserializeUser, requireUser, DeletePostHandler);

export default router;
