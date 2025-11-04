import { mockApiClient } from '@/lib/axios';
import {
  type User,
  type UserFormData,
  usersArraySchema,
  userResponseSchema,
} from '@/features/users/schemas/users.schema';
import { USERS_ENDPOINTS } from '@/constants/endpoints';

export async function getAllUsers(): Promise<User[]> {
  const response = await mockApiClient.get(USERS_ENDPOINTS.getAll);

  const validatedData = usersArraySchema.parse(response.data);

  return validatedData;
}

export async function createUser(data: UserFormData): Promise<User> {
  const response = await mockApiClient.post(USERS_ENDPOINTS.create, data);

  const validatedData = userResponseSchema.parse(response.data);

  return validatedData;
}
