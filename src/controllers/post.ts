import { NextFunction, Request, Response } from 'express';
import { CreatePostInput, UpdatePostInput } from '../schemas/post';
import { createPost, deletePost, getAllPosts, getAllPublishedPublicPosts, getPostByID, updatePost } from '../services/postService';

export const CreatePostHandler = async (
  req: Request<{}, {}, CreatePostInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const post = await createPost({
      title: req.body.title,
      content: req.body.content,
      published: req.body.published,
      author: {
        connect: {
          id: res.locals.user.id,
        }
      },
      category: {
        connect: {
          id: req.body.categoryId,
        }
      }
    });
    res.status(201).json({
      data: {
        post,
      }
    });
  } catch (error: any) {
    next(error);
  }
};

export const ReadAllPostsHandler = async (
  req: Request<{ c: string; g: string; }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const isAuthenticated = Boolean(res.locals.user);
    const forceGuest = Boolean(req.query.g as string)
    const lastCursor = parseInt(req.query.c as string);
    const data = (isAuthenticated || !forceGuest) ? await getAllPosts(lastCursor) : await getAllPublishedPublicPosts(lastCursor);
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

export const ReadPostHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const isAuthenticated = Boolean(req.headers.authorization?.startsWith('Bearer'));
    const post = await(getPostByID({ id: parseInt(req.params.id) }));
    res.status(200).json({
      data: {
        post: (!isAuthenticated && (post.private || !post.published)) ? null : post,
      }
    });
  } catch (error) {
    next(error);
  }
};

export const UpdatePostHandler = async (
  req: Request<{ id: string; }, {}, UpdatePostInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const post = await updatePost(parseInt(req.params.id), req.body);
    res.status(200).json({
      data: {
        post,
      }
    });
  } catch (error: any) {
    next(error);
  }
};

export const DeletePostHandler = async (
  req: Request<{ id: string; }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const post = await deletePost(parseInt(req.params.id));
    res.status(200).json({
      data: {
        id: req.params.id,
        deleted: true,
      }
    })
  } catch (error: any) {
    next(error);
  }
}
