import { Prisma, PrismaClient, ResetTokens } from '@prisma/client';
import { RetrieveResetTokenInput, UpdateResetTokenInput } from '../schemas/resetToken';

const prisma = new PrismaClient();

export const createResetToken = async (
  input: Prisma.ResetTokensCreateInput
) => {
  return (await prisma.resetTokens.create({
    data: input
  })) as ResetTokens;
};

export const retrieveResetToken = async (
  input: RetrieveResetTokenInput
) => {
  const foundToken = (await prisma.resetTokens.findUnique({
    where: {
      token: input.token,
    }
  })) as ResetTokens;
  if (
    (foundToken.email !== input.email)
  ) {
    return null;
  }
  return (new Date() < new Date(foundToken.expiry)) ? foundToken : null;
};

export const updateResetToken = async (
  input: UpdateResetTokenInput
) => {
  return (await prisma.resetTokens.update({
    where: { token: input.token },
    data: {
      used: true,
    }
  }));
}
