import { Prisma, PrismaClient, User } from '@prisma/client';
import redisClient from '../utils/redis';
import { signJwt } from '../utils/jwt';
import { omit } from 'lodash';

const prisma = new PrismaClient();

export const excludedFields = ['password'];

export const createUser = async (input: Prisma.UserCreateInput) => {
  return (await prisma.user.create({
    data: input
  })) as User;
};

export const findUniqueUser = async (
  where: Prisma.UserWhereUniqueInput,
  select?: Prisma.UserSelect
) => {
  return (await prisma.user.findFirst({
    where,
    select,
  })) as User;
};

export const signTokens = async (user: Prisma.UserUncheckedCreateInput) => {
  const redisUser = omit(user, excludedFields);
  const userID = (redisUser.id)?.toString();
  redisClient.set(`user_${userID}`, JSON.stringify(redisUser), 'EX', 60 * 60);

  const access_token = signJwt({ sub: userID }, '15m');

  const refresh_token = signJwt({ sub: userID }, '5d');

  return { access_token, refresh_token };
};

export const updateUser = async (
  id: number,
  input: Prisma.UserUpdateInput
) => {
  return (await prisma.user.update({
    where: { id },
    data: input
  }))
};