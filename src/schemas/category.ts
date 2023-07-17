import { boolean, number, object, string, TypeOf } from 'zod';

export const createCategorySchema = object({
  body: object({
    name: string({
      required_error: 'Name is required',
    })
      .min(1, 'Name must not be empty')
      .max(30, 'Name must not exceed 30 characters'),
    private: boolean({
      required_error: 'Private must either be true or false',
    }),
  }),
});

export const updateCategorySchema = object({
  body: object({
    id: number({}),
    name: string({}),
    slug: string({}),
    private: boolean({}),
  })
    .partial()
});

export type CreateCategoryInput = TypeOf<typeof createCategorySchema>['body'];
export type UpdateCategoryInput = TypeOf<typeof updateCategorySchema>['body'];
