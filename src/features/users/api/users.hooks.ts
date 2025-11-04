import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { getAllUsers, createUser } from '@/features/users/api/users.api';
import type {
  User,
  UserFormData,
} from '@/features/users/schemas/users.schema';
import { toast } from 'sonner';

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

export function useCreateUser(
  options?: Omit<
    UseMutationOptions<User, Error, UserFormData, { previousUsers: User[] | undefined }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation<User, Error, UserFormData, { previousUsers: User[] | undefined }>({
    mutationFn: createUser,
    onMutate: async (newUser) => {
      await queryClient.cancelQueries({ queryKey: usersKeys.list() });

      const previousUsers = queryClient.getQueryData<User[]>(usersKeys.list());

      queryClient.setQueryData<User[]>(usersKeys.list(), (old = []) => {
        const tempUser: User = {
          ...newUser,
          id: `temp-${Date.now()}`,
          createdAt: new Date().toISOString(),
          avatar: newUser.avatar || '',
          bio: newUser.bio || '',
        };
        return [tempUser, ...old];
      });

      return { previousUsers };
    },
    onError: (error, _newUser, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(usersKeys.list(), context.previousUsers);
      }
      toast.error('Failed to create user', {
        description: error.message || 'An error occurred while creating the user',
      });
    },
    onSuccess: (data) => {
      toast.success('User created successfully', {
        description: `${data.name} has been added to the system`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.list() });
    },
    ...options,
  });
}
