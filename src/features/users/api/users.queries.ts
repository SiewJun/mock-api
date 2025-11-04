import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { getAllUsers } from '@/features/users/api/users.api';
import type { User } from '@/features/users/schemas/users.schema';

export const usersKeys = {
  all: ['users'] as const,
  list: () => [...usersKeys.all, 'list'] as const,
};

export function useUsers(
  options?: Omit<UseQueryOptions<User[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: usersKeys.list(),
    queryFn: getAllUsers,
    ...options,
  });
}
