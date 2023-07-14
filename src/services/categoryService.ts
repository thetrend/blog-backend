import { Prisma, PrismaClient, Category } from '@prisma/client';

const prisma = new PrismaClient();

export const createCategory = async (input: Prisma.CategoryCreateInput) => {
  return (await prisma.category.create({
    data: input
  })) as Category;
};

export const getCategoryByID = async (
  where: Prisma.CategoryWhereUniqueInput,
) => {
  return (await prisma.category.findUnique({
    where
  })) as Category;
};

export const getAllCategories = async () => {
  return (await prisma.category.findMany()) as Category[];
};

export const updateCategory = async (
  id: number,
  input: Prisma.CategoryUpdateInput
) => {
  return (await prisma.category.update({
    where: { id },
    data: input
  })) as Category;
};
