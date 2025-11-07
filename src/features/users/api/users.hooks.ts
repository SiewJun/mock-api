import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
} from '@/features/users/api/users.api';
import type { User, UserFormData } from '@/features/users/schemas/users.schema';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';

type ApiError = AxiosError<{ message?: string }>;

export const usersKeys = {
  all: ['users'] as const,
  list: () => [...usersKeys.all, 'list'] as const,
  detail: (id: string) => [...usersKeys.all, 'detail', id] as const,
};

export function useUsers(
  options?: Omit<UseQueryOptions<User[], ApiError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: usersKeys.list(),
    queryFn: getAllUsers,
    ...options,
  });
}

export function useCreateUser(
  options?: Omit<
    UseMutationOptions<
      User,
      ApiError,
      UserFormData,
      { previousUsers: User[] | undefined; toastId: string | number }
    >,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    User,
    ApiError,
    UserFormData,
    { previousUsers: User[] | undefined; toastId: string | number }
  >({
    mutationFn: createUser,
    onMutate: async (newUser) => {
      const toastId = toast.loading('Creating user...');
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

      return { previousUsers, toastId };
    },
    onError: (error, _newUser, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(usersKeys.list(), context.previousUsers);
      }
      const description =
        error.response?.data?.message ||
        error.message ||
        'An error occurred while creating the user';
      toast.error('Failed to create user', {
        description,
        id: context?.toastId,
      });
    },
    onSuccess: (data, _variables, context) => {
      queryClient.setQueryData<User[]>(usersKeys.list(), (old = []) => {
        const existingIndex = old.findIndex((user) => user.id === data.id);
        if (existingIndex !== -1) {
          const next = [...old];
          next[existingIndex] = data;
          return next;
        }

        const tempIndex = old.findIndex((user) => user.id.startsWith('temp-'));
        if (tempIndex !== -1) {
          const next = [...old];
          next[tempIndex] = data;
          return next;
        }

        return [data, ...old];
      });
      toast.success('User created successfully', {
        description: `${data.name} has been added to the system`,
        id: context?.toastId,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.list() });
    },
    ...options,
  });
}

export function useUser(
  id: string | undefined,
  options?: Omit<UseQueryOptions<User, ApiError>, 'queryKey' | 'queryFn'>
) {
  const { enabled, ...restOptions } = options ?? {};
  return useQuery({
    ...restOptions,
    queryKey: id
      ? usersKeys.detail(id)
      : ([...usersKeys.all, 'detail', 'unknown'] as const),
    queryFn: () => {
      if (!id) {
        throw new Error('User ID is required');
      }
      return getUserById(id);
    },
    enabled: Boolean(id) && (enabled ?? true),
  });
}

export function useUpdateUser(
  options?: Omit<
    UseMutationOptions<
      User,
      ApiError,
      { id: string; data: UserFormData },
      {
        previousUsers: User[] | undefined;
        previousUser: User | undefined;
        toastId: string | number;
      }
    >,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    User,
    ApiError,
    { id: string; data: UserFormData },
    {
      previousUsers: User[] | undefined;
      previousUser: User | undefined;
      toastId: string | number;
    }
  >({
    mutationFn: updateUser,
    onMutate: async ({ id, data }) => {
      const toastId = toast.loading('Saving changes...');
      await Promise.all([
        queryClient.cancelQueries({ queryKey: usersKeys.list() }),
        queryClient.cancelQueries({ queryKey: usersKeys.detail(id) }),
      ]);

      const previousUsers = queryClient.getQueryData<User[]>(usersKeys.list());
      const previousUser = queryClient.getQueryData<User>(usersKeys.detail(id));

      queryClient.setQueryData<User[]>(usersKeys.list(), (old = []) =>
        old.map((user) =>
          user.id === id
            ? {
                ...user,
                ...data,
              }
            : user
        )
      );

      queryClient.setQueryData<User>(usersKeys.detail(id), (old) =>
        old
          ? {
              ...old,
              ...data,
            }
          : old
      );

      return { previousUsers, previousUser, toastId };
    },
    onError: (error, variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(usersKeys.list(), context.previousUsers);
      }

      if (context?.previousUser) {
        queryClient.setQueryData(
          usersKeys.detail(variables.id),
          context.previousUser
        );
      }

      const isNotFound = error.response?.status === 404;
      const description =
        error.response?.data?.message ||
        (isNotFound
          ? 'The user you are trying to edit was removed.'
          : error.message || 'An error occurred while updating the user');

      toast.error(
        isNotFound ? 'User no longer exists' : 'Failed to update user',
        {
          description,
          id: context?.toastId,
        }
      );
    },
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(usersKeys.detail(variables.id), data);
      queryClient.setQueryData<User[]>(usersKeys.list(), (old = []) =>
        old.map((user) => (user.id === data.id ? data : user))
      );

      toast.success('User updated successfully', {
        description: `${data.name} has been updated`,
        id: context?.toastId,
      });
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.list() });
      queryClient.invalidateQueries({
        queryKey: usersKeys.detail(variables.id),
      });
    },
    ...options,
  });
}

export function useDeleteUser(
  options?: Omit<
    UseMutationOptions<
      void,
      ApiError,
      { id: string },
      {
        previousUsers: User[] | undefined;
        previousUser: User | undefined;
        toastId: string | number;
      }
    >,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    ApiError,
    { id: string },
    {
      previousUsers: User[] | undefined;
      previousUser: User | undefined;
      toastId: string | number;
    }
  >({
    mutationFn: ({ id }) => deleteUser(id),
    onMutate: async ({ id }) => {
      const toastId = toast.loading('Deleting user...');

      await Promise.all([
        queryClient.cancelQueries({ queryKey: usersKeys.list() }),
        queryClient.cancelQueries({ queryKey: usersKeys.detail(id) }),
      ]);

      const previousUsers = queryClient.getQueryData<User[]>(usersKeys.list());
      const previousUser = queryClient.getQueryData<User>(usersKeys.detail(id));

      queryClient.setQueryData<User[]>(usersKeys.list(), (old = []) =>
        old.filter((user) => user.id !== id)
      );

      queryClient.setQueryData<User | undefined>(usersKeys.detail(id), undefined);

      return { previousUsers, previousUser, toastId };
    },
    onError: (error, variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(usersKeys.list(), context.previousUsers);
      }

      if (context?.previousUser) {
        queryClient.setQueryData(usersKeys.detail(variables.id), context.previousUser);
      }

      const description =
        error.response?.data?.message ||
        error.message ||
        'An error occurred while deleting the user';

      toast.error('Failed to delete user', {
        description,
        id: context?.toastId,
      });
    },
    onSuccess: (_data, _variables, context) => {
      toast.success('User deleted successfully', {
        description: 'The user has been removed from the system.',
        id: context?.toastId,
      });
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.list() });
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(variables.id) });
    },
    ...options,
  });
}
