import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

export const signJwt = (
  payload: Object,
  expiration: string
) => {
  return jwt.sign(payload, process.env.TOKEN_SECRET as string, { expiresIn: expiration, });
};

export const verifyJwt = <T>(
  token: string,
): T | null => {
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET as string) as T;
    return decoded;
  } catch (error: any) {
    return null;
  }
};
