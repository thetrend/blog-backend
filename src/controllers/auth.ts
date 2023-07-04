import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { omit } from 'lodash';
import { RegisterUserInput } from '../schemas/user';
import { createUser, excludedFields } from '../services/userService';

export const registerUserHandler = async (
  req: Request<{}, {}, RegisterUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await createUser({
      name: req.body.name,
      email: req.body.email.toLowerCase(),
      password: req.body.password,
    });
    const newUser = omit(user, excludedFields);
    res.status(201).json({
      data: {
        user: newUser,
      }
    });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(409).json({
          errors: [{
            code: 'custom',
            path: [
              'body',
              'email',
            ],
            message: 'Email already exists. Please login.'
          }]
        });
      }
    }
    next(error);
  }
};
