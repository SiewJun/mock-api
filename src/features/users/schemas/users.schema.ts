import { z } from 'zod';

export const userResponseSchema = z.object({
  createdAt: z.iso.datetime(),
  name: z.string(),
  phoneNumber: z.string(),
  email: z.email(),
  avatar: z.url().optional().or(z.literal('')),
  active: z.boolean(),
  role: z.string(),
  bio: z.string().optional(),
  id: z.string(),
});

export const userFormSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.email('Invalid email format').trim(),
  phoneNumber: z.string().min(1, 'Phone number is required').trim(),
  active: z.boolean().default(true),
  avatar: z.url('Invalid avatar URL').optional().or(z.literal('')),
  role: z.enum(['Admin', 'User', 'Guest'], {
    message: 'Role is required',
  }),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
});

export const usersArraySchema = z.array(userResponseSchema);

export type User = z.infer<typeof userResponseSchema>;
export type UserFormData = z.infer<typeof userFormSchema>;
export type UsersArray = z.infer<typeof usersArraySchema>;
