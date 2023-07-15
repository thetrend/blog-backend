import { boolean, number, object, string, TypeOf } from 'zod';

export const createResetTokenSchema = object({
  body: object({
    email: string({
      required_error: 'Email address is required',
    }),
  })
});

export const retrieveResetTokenSchema = object({
  body: object({
    email: string({
      required_error: 'Email address is required',
    }),
    token: string({
      required_error: 'Token is required',
    }),
  })
});

export const updateResetTokenSchema = object({
  body: object({
    token: string({
      required_error: 'Token is required'
    })
  })
});

export type CreateResetTokenInput = TypeOf<typeof createResetTokenSchema>['body'];
export type RetrieveResetTokenInput = TypeOf<typeof retrieveResetTokenSchema>['body'];
export type UpdateResetTokenInput = TypeOf<typeof updateResetTokenSchema>['body'];
