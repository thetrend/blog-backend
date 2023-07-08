import { NextFunction, Request, Response } from 'express';
import { omit } from 'lodash';
import { excludedFields, findUniqueUser } from '../services/userService';
import AppError from '../utils/error';
import redisClient from '../utils/redis';
import { verifyJwt } from '../utils/jwt';

export const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let access_token: string | undefined;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      access_token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.access_token) {
      access_token = req.cookies.access_token;
    }

    if (!access_token) {
      return next(new AppError(401, 'You are not logged in'));
    }

    const decoded = verifyJwt<{ sub: string }>(access_token);

    if (!decoded) {
      return next(new AppError(401, 'Invalid token or nothing decoded'));
    }

    const session = await redisClient.get(`user_${decoded.sub}`);

    if (!session) {
      return next(new AppError(401, 'Invalid token or session expired'));
    }

    const user = await findUniqueUser({ id: JSON.parse(session).id });

    if (!user) {
      return next(new AppError(401, 'Invalid token or no such user'));
    }

    res.locals.user = omit(user, excludedFields);
    next();
  } catch (error: any) {
    next(error);
  }
};
