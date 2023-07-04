import { Prisma, PrismaClient, User } from '@prisma/client';
import redisClient from '../utils/redis';

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
  return (await prisma.user.findUnique({
    where,
    select,
  })) as User;
};
