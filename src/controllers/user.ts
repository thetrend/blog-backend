import { NextFunction, Request, Response } from 'express';

export const getMeHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = res.locals.user;
    res.status(200).json({
      data: {
        user,
      },
    });
  } catch (error: any) {
    next(error);
  }
}
