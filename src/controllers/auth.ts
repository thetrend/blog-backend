import { CookieOptions, NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { omit } from 'lodash';
import { LoginUserInput, RegisterUserInput } from '../schemas/user';
import { createUser, excludedFields, findUniqueUser, signTokens } from '../services/userService';
import AppError from '../utils/error';
import { signJwt, verifyJwt } from '../utils/jwt';
import redisClient from '../utils/redis';

const cookiesOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
};

if (process.env.NODE_ENV === 'production') cookiesOptions.secure = true;

const accessTokenCookieOptions: CookieOptions = {
  ...cookiesOptions,
  expires: new Date(
    Date.now() + 15 * 60 * 1000,
  ),
    maxAge: 15 * 60 * 1000,
};

const refreshTokenCookieOptions: CookieOptions = {
  ...cookiesOptions,
  expires: new Date(
    Date.now() + 60 * 60 * 1000,
  ),
  maxAge: 60 * 60 * 1000,
};

export const registerUserHandler = async (
  req: Request<{}, {}, RegisterUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    const user = await createUser({
      name: req.body.name,
      email: req.body.email.toLowerCase(),
      password: hashedPassword,
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

export const loginUserHandler = async (
  req: Request<{}, {}, LoginUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const user = await findUniqueUser(
      { email: email.toLowerCase(), },
      { id: true, email: true, password: true, }
    );

    if (!user) {
      return next(new AppError(400, 'Invalid email or password'));
    }

    const checkPassword = bcrypt.compareSync(password, user.password);

    if (!checkPassword) {
      return next(new AppError(400, 'Invalid email or password'));
    }

    const { access_token, refresh_token } = await signTokens(user);
    res.cookie('access_token', access_token, accessTokenCookieOptions);
    res.cookie('refresh_token', refresh_token, refreshTokenCookieOptions);
    res.cookie('logged_in', true, {
      ...accessTokenCookieOptions,
      httpOnly: false,
    });

    res.status(200).json({
      access_token,
    });
  } catch (error: any) {
    next(error);
  }
};

export const refreshAccessTokenHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const message = 'Could not refresh access token';

    const refresh_token = req.cookies.refresh_token;

    if (!refresh_token) {
      return next(new AppError(403, message));
    }

    const decoded = verifyJwt<{ sub: string }>(refresh_token);

    if (!decoded) {
      return next(new AppError(403, message));
    }

    const session = await redisClient.get(decoded!.sub);

    if (!session) {
      return next(new AppError(403, message));
    }

    const user = await findUniqueUser({ id: JSON.parse(session!).id });
    
    if (!user) {
      return next(new AppError(403, message));
    }

    const access_token = signJwt({ sub: user.id }, '15m');

    res.cookie('access_token', access_token, accessTokenCookieOptions);
    res.cookie('logged_in', true, {
      ...accessTokenCookieOptions,
      httpOnly: false,
    });

    res.status(200).json({
      access_token,
    });
  } catch (error: any) {
    next(error);
  }
};

const logout = (res: Response) => {
  res.cookie('access_token', '', { maxAge: -1 });
  res.cookie('refresh_token', '', { maxAge: -1 });
  res.cookie('logged_in', '', { maxAge: -1 });
};

export const logoutUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await redisClient.del(`user_${res.locals.user.id}`);
    logout(res);

    res.status(200).json({
      logout: true,
    });
  } catch (error: any) {
    next(error);
  }
}
