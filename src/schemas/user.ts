import { object, string, TypeOf, z } from 'zod';

enum RoleEnumType {
  ADMIN = 'admin',
  CONTRIBUTOR = 'contriibutor',
  USER = 'user',
};

export const createUserSchema = object({
  body: object({
    name: string({
      required_error: 'Name is required',
    }),
    email: string({
      required_error: 'Email address is required',
    })
      .email('Invalid email address'),
    password: string({
      required_error: 'Password is required',
    })
      .min(8, 'Password must be at least 8 characters')
      .max(24, 'Password must not exceed 24 characters'),
    passwordConfirm: string({
      required_error: 'Please confirm your password',
    }),
    role: z.optional(z.nativeEnum(RoleEnumType))
  })
    .refine((data) => data.password === data.passwordConfirm, {
      path: ['passwordConfirm'],
      message: 'Passwords do not match'
    }),
});

export const updateUserSchema = object({
  body: object({
    name: string({}),
    email: string({}).email('Invalid email address'),
    password: string({})
      .min(8, 'Password must be at least 8 characters')
      .max(24, 'Password must not exceed 24 characters'),
    passwordConfirm: string({}),
    role: z.optional(z.nativeEnum(RoleEnumType))
  })
    .partial()
    .refine((data) => data.password === data.passwordConfirm, {
      path: ['passwordConfirm'],
      message: 'Passwords do not match',
    }),
});

export const loginUserSchema = object({
  body: object({
    email: string({
      required_error: 'Email address is required',
    })
      .email('Invalid email address'),
    password: string({
      required_error: 'Password is required',
    })
      .min(8, 'Invalid email or password')
  }),
});

export type RegisterUserInput = Omit<
  TypeOf<typeof createUserSchema>['body'],
  'passwordConfirm'
>;

export type UpdateUserInput = TypeOf<typeof updateUserSchema>['body'];
export type LoginUserInput = TypeOf<typeof loginUserSchema>['body'];
