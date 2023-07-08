import { NextFunction, Request, Response } from 'express';
import AppError from '../utils/error';

export const requireUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = res.locals.user;

    if (!user) {
      return next(
        new AppError(401, 'Session has expired')
      );
    }
    next();
  } catch (error: any) {
    next(error);
  }
}