import { mockApiClient } from '@/lib/axios';
import {
  type User,
  usersArraySchema,
} from '@/features/users/schemas/users.schema';
import { USERS_ENDPOINTS } from '@/constants/endpoints';

export async function getAllUsers(): Promise<User[]> {
  const response = await mockApiClient.get(USERS_ENDPOINTS.getAll);

  const validatedData = usersArraySchema.parse(response.data);

  return validatedData;
}
