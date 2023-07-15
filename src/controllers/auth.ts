import { CookieOptions, NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import ShortUniqueId from 'short-unique-id';
import generator from 'generate-password';
import { omit } from 'lodash';
import { LoginUserInput, RegisterUserInput } from '../schemas/user';
import { createUser, excludedFields, findUniqueUser, signTokens, updateUser } from '../services/userService';
import AppError from '../utils/error';
import { signJwt, verifyJwt } from '../utils/jwt';
import redisClient from '../utils/redis';
import { createResetToken, retrieveResetToken, updateResetToken } from '../services/resetTokenService';
import { sendEmail } from '../utils/email';

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

    const decoded = verifyJwt<{ sub: string; }>(refresh_token);

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
};

export const forgotPasswordHandler = async (
  req: Request<{}, {}, { email: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const email = req.body.email.toLowerCase();
    const foundUser = await findUniqueUser({ email });
    if (foundUser) {
      const token = new ShortUniqueId({ length: 10 })();
      const createEntry = await createResetToken({
        email,
        token,
        expiry: new Date(new Date().getTime() + (60 * 60 * 1000)), // expires in 1 hour
      });
      if (createEntry) {
        const send = await sendEmail({
          to: email,
          subject: 'blog.graced.is - Forgot Password',
          html: `<p>Hi there!</p>
          <p><strong>blog.graced.is</strong> received a request to reset your password!</p>
          <p><a href="https://blog.graced.is/password/reset?token=${token}&email=${email}">Click Here to reset your password</a>.</p>
          <h2>${token}</h2>
          <p>If you didn't request to reset your password, disregard this email.</p>
          <p>Have a nice day!</p>`
        });
        console.log(`Email sent`, send);
      }
    }
    res.status(200).json({
      message: "A link to reset your password has been sent to your email if an account exists.",
    });
} catch (error: any) {
    next(error)
  }
};

export const resetPasswordHandler = async (
  req: Request<{}, {}, { token: string; email: string; }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, email } = req.body;

    const foundToken = await retrieveResetToken({ token, email: email.toLowerCase() });

    if (!foundToken) {
      res.status(200).json({
        data: {
          token: null,
        }
      })
    }

    const updateToken = await updateResetToken({ token });

    const generatedPassword = generator.generate({
      length: 20,
      numbers: true,
      symbols: true,
      strict: true,
    });
    
    const hashedPassword = await bcrypt.hash(generatedPassword, 12);

    const userID = (await findUniqueUser({ email })).id;

    const updateUserPassword = await updateUser(userID, { password: hashedPassword });

    const send = await sendEmail({
      to: email,
      subject: 'blog.graced.is - Password Reset Requested',
      html: `<h1>${generatedPassword}</h1>
      <p>You recently requested a temporary password on <b>blog.graced.is</b>.</p>
      <p>Make sure you reset your password after you <a href="https://blog.graced.is/login">log in!</a></p>
      <p>If you didn't request to reset your password, contact <a href="mailto:blog@graced.is">blog@graced.is</a>.
      <p>Have a nice day!</p>`
    });

    const user = omit(updateUserPassword, excludedFields);

    console.log(new Date(), ` - Token updated to used status.\n updateToken:`, updateToken);
    console.log(new Date(), ` - Email sent to ${email.toLowerCase()}.\n send:`, send);
    console.log(new Date(), ` - Password updated for user ID ${userID}.\n user:`, user);

    res.status(200).json({
      data: {
        token,
        used: true,
        deliveredTo: email.toLowerCase(),
        user,
      }
    });
  } catch (error: any) {
    next(error);
  }
};
