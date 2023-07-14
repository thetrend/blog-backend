import { Prisma, PrismaClient, Post, Category } from '@prisma/client';

const prisma = new PrismaClient();

export const createPost = async (input: Prisma.PostCreateInput) => {
  return (await prisma.post.create({
    data: input
  })) as Post;
}

export const getPostByID = async (
  where: Prisma.PostWhereUniqueInput,
) => {
  return (await prisma.post.findUnique({
    where
  })) as Post;
};

export const getAllPublishedPublicPosts = async (
  lastCursor: number,
  onlyPublished: boolean = false,
  take?: number,
) => {
  let query = await (prisma.post.findMany({
    take: take ?? 5,
    ...(lastCursor && {
      skip: 1,
      cursor: {
        id: lastCursor,
      }
    }),
    where: {
      published: true,
      private: false,
    },
    orderBy: {
      createdAt: 'desc',
    }
  }));

  const lastPostID: number = query[query.length - 1].id;

  const nextPage = await (prisma.post.findMany({
    take: take ?? 5,
    skip: 1,
    cursor: {
      id: lastPostID,
    },
    where: {
      published: true,
      private: false,
    },
    orderBy: {
      createdAt: 'desc',
    }
  }));

  const data = {
    posts: query,
    metaData: {
      lastCursor: (nextPage.length > 0) ? lastPostID : null,
      hasNextPage: (nextPage.length > 0) ?? false,
    },
  };

  return data;
};

export const getAllPosts = async (
  lastCursor: number,
  take?: number,
) => {
  let query = await (prisma.post.findMany({
    take: take ?? 5,
    ...(lastCursor && {
      skip: 1,
      cursor: {
        id: lastCursor,
      }
    }),
    orderBy: {
      createdAt: 'desc',
    }
  }));

  const lastPostID: number = query[query.length - 1].id;

  const nextPage = await (prisma.post.findMany({
    take: take ?? 5,
    skip: 1,
    cursor: {
      id: lastPostID,
    },
    orderBy: {
      createdAt: 'desc',
    }
  }));

  const data = {
    posts: query,
    metaData: {
      lastCursor: (nextPage.length > 0) ? lastPostID : null,
      hasNextPage: (nextPage.length > 0) ?? false,
    },
  };

  return data;
};

export const updatePost = async (
  id: number,
  input: Prisma.PostUpdateInput
) => {
  return (await prisma.post.update({
    where: { id },
    data: input
  }));
};

export const deletePost = async (
  id: number,
) => {
  return (await prisma.post.delete({
    where: {
      id
    }
  }));
};
