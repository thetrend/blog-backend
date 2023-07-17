import { boolean, number, object, string, TypeOf } from 'zod';

export const createPostSchema = object({
  body: object({
    title: string()
      .optional(),
    content: string({
      required_error: 'Content is required',
    })
      .min(1, 'Content must not be empty'),
    categoryId: number({
      required_error: 'Category ID is required',
    })
      .min(1, 'Category ID must not be empty'),
    published: boolean({
      required_error: 'Published must either be true or false'
    })
  })
});

export const updatePostSchema = object({
  body: object({
    id: number({}),
    title: string({}),
    slug: string({}),
    content: string({}),
    published: boolean({}),
    private: boolean({}),
    categoryId: number({}),
  })
    .partial()
});

export type CreatePostInput = TypeOf<typeof createPostSchema>['body'];
export type UpdatePostInput = TypeOf<typeof updatePostSchema>['body'];
