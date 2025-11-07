import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  useUsers,
  useDeleteUser,
  usersKeys,
} from '@/features/users/api/users.hooks';
import { deleteUser as deleteUserRequest } from '@/features/users/api/users.api';
import { DataTable } from '@/features/users/components/DataTable';
import { createColumns } from '@/features/users/components/Columns';
import { BioDialog } from '@/features/users/components/BioDialog';
import { ConfirmDialog } from '@/features/users/components/ConfirmDialog';
import { Header } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { User } from '@/features/users/schemas/users.schema';

type PendingBulkDeletion = {
  users: User[];
  previousUsers: User[] | undefined;
  toastId: string | number;
  timeoutId: ReturnType<typeof setTimeout>;
  intervalId: ReturnType<typeof setInterval> | null;
  expiresAt: number;
  message: string;
};

type PendingBulkDeletionStorage = {
  users: User[];
  previousUsers: User[] | null;
  expiresAt: number;
  message: string;
};

const PENDING_BULK_DELETION_STORAGE_KEY = 'users:list:pendingBulkDeletion';

const persistPendingBulkDeletion = (value: PendingBulkDeletion | null) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (!value) {
      window.sessionStorage.removeItem(PENDING_BULK_DELETION_STORAGE_KEY);
      return;
    }

    const payload: PendingBulkDeletionStorage = {
      users: value.users,
      previousUsers: value.previousUsers ?? null,
      expiresAt: value.expiresAt,
      message: value.message,
    };

    window.sessionStorage.setItem(
      PENDING_BULK_DELETION_STORAGE_KEY,
      JSON.stringify(payload)
    );
  } catch (err) {
    console.error('Failed to persist pending bulk deletion state', err);
  }
};

const readPendingBulkDeletion = (): PendingBulkDeletionStorage | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.sessionStorage.getItem(PENDING_BULK_DELETION_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as PendingBulkDeletionStorage;

    if (!Array.isArray(parsed.users) || typeof parsed.expiresAt !== 'number') {
      window.sessionStorage.removeItem(PENDING_BULK_DELETION_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('Failed to read pending bulk deletion state', error);
    window.sessionStorage.removeItem(PENDING_BULK_DELETION_STORAGE_KEY);
    return null;
  }
};

export function UsersList() {
  const { data: users = [], isLoading, isError, error } = useUsers();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isBioDialogOpen, setIsBioDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [clearSelectionSignal, setClearSelectionSignal] = useState(0);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const deleteUserMutation = useDeleteUser();
  const pendingBulkDeletion = useRef<PendingBulkDeletion | null>(null);

  const handleViewBio = (user: User) => {
    setSelectedUser(user);
    setIsBioDialogOpen(true);
  };

  const finalizeBulkDeletion = useCallback(async () => {
    const pending = pendingBulkDeletion.current;

    if (!pending) {
      persistPendingBulkDeletion(null);
      return;
    }

    pendingBulkDeletion.current = null;
    persistPendingBulkDeletion(null);
    clearTimeout(pending.timeoutId);
    if (pending.intervalId) {
      clearInterval(pending.intervalId);
    }

    toast.dismiss(pending.toastId);

    const deletionResults: { success: string[]; failed: string[] } = {
      success: [],
      failed: [],
    };

    for (const user of pending.users) {
      try {
        await deleteUserRequest(user.id);
        deletionResults.success.push(user.name);
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (err) {
        deletionResults.failed.push(user.name);
        console.error(`Failed to delete user ${user.name}:`, err);
      }
    }

    if (deletionResults.failed.length === 0) {
      toast.success('Users deleted', {
        description: `${deletionResults.success.length} user(s) deleted permanently`,
      });
    } else if (deletionResults.success.length === 0) {
      queryClient.setQueryData(usersKeys.list(), pending.previousUsers);

      toast.error('Failed to delete users', {
        description: `Could not delete any of the ${pending.users.length} selected user(s)`,
      });
    } else {
      toast.warning('Partial deletion', {
        description: `${deletionResults.success.length} deleted, ${
          deletionResults.failed.length
        } failed: ${deletionResults.failed.join(', ')}`,
        duration: 7000,
      });
    }

    await queryClient.invalidateQueries({ queryKey: usersKeys.list() });
  }, [queryClient]);

  const undoBulkDeletion = useCallback(() => {
    const pending = pendingBulkDeletion.current;

    if (!pending) {
      persistPendingBulkDeletion(null);
      return;
    }

    pendingBulkDeletion.current = null;
    persistPendingBulkDeletion(null);
    clearTimeout(pending.timeoutId);
    if (pending.intervalId) {
      clearInterval(pending.intervalId);
    }

    toast.dismiss(pending.toastId);

    queryClient.setQueryData(usersKeys.list(), pending.previousUsers);

    toast.success('Undo successful', {
      description: `${pending.users.length} user(s) restored`,
    });

    void queryClient.invalidateQueries({ queryKey: usersKeys.list() });
  }, [queryClient]);

  const startBulkDelete = useCallback(
    async (usersToDelete: User[]) => {
      if (usersToDelete.length === 0) {
        return;
      }

      await finalizeBulkDeletion();

      setIsBulkProcessing(true);

      try {
        await queryClient.cancelQueries({ queryKey: usersKeys.list() });

        const previousUsers = queryClient.getQueryData<User[]>(
          usersKeys.list()
        );
        const idsToDelete = new Set(usersToDelete.map((user) => user.id));

        queryClient.setQueryData<User[]>(usersKeys.list(), (old = []) =>
          old.filter((user) => !idsToDelete.has(user.id))
        );

        const messageBase =
          usersToDelete.length === 1
            ? `${usersToDelete[0].name} removed.`
            : `${usersToDelete.length} users removed.`;
        const expiresAt = Date.now() + 5000;
        const initialSeconds = Math.max(
          0,
          Math.ceil((expiresAt - Date.now()) / 1000)
        );

        const toastId = toast.warning('Users removed', {
          description: `${messageBase} Undo in ${initialSeconds}s.`,
          action: {
            label: 'Undo',
            onClick: () => undoBulkDeletion(),
          },
          duration: 5000,
        });

        const timeoutId = setTimeout(() => {
          void finalizeBulkDeletion();
        }, 5000);

        const intervalId = setInterval(() => {
          const pending = pendingBulkDeletion.current;

          if (!pending) {
            clearInterval(intervalId);
            return;
          }

          const secondsLeft = Math.max(
            0,
            Math.ceil((pending.expiresAt - Date.now()) / 1000)
          );

          toast.warning('Users removed', {
            description: `${pending.message} Undo in ${secondsLeft}s.`,
            action:
              secondsLeft > 0
                ? {
                    label: 'Undo',
                    onClick: () => undoBulkDeletion(),
                  }
                : undefined,
            duration: 5000,
            id: pending.toastId,
          });

          if (secondsLeft <= 0) {
            clearInterval(intervalId);
          }
        }, 250);

        pendingBulkDeletion.current = {
          users: usersToDelete,
          previousUsers,
          toastId,
          timeoutId,
          intervalId,
          expiresAt,
          message: messageBase,
        };
        persistPendingBulkDeletion(pendingBulkDeletion.current);

        setClearSelectionSignal((value) => value + 1);
        setSelectedUsers([]);
      } finally {
        setIsBulkProcessing(false);
      }
    },
    [finalizeBulkDeletion, queryClient, undoBulkDeletion]
  );

  useEffect(() => {
    if (pendingBulkDeletion.current) {
      return;
    }

    const stored = readPendingBulkDeletion();

    if (!stored) {
      return;
    }

    const idsToDelete = new Set(stored.users.map((user) => user.id));
    const message =
      stored.message ||
      (stored.users.length === 1
        ? `${stored.users[0].name} removed.`
        : `${stored.users.length} users removed.`);

    queryClient.setQueryData<User[]>(usersKeys.list(), (old) => {
      const source = old ?? stored.previousUsers ?? [];
      return source.filter((user) => !idsToDelete.has(user.id));
    });

    const remainingMs = stored.expiresAt - Date.now();
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let toastId: string | number = 'pending-bulk-delete-restored';

    if (remainingMs <= 0) {
      timeoutId = setTimeout(() => {
        void finalizeBulkDeletion();
      }, 0);
    } else {
      const secondsLeft = Math.max(0, Math.ceil(remainingMs / 1000));

      toastId = toast.warning('Users removed', {
        description: `${message} Undo in ${secondsLeft}s.`,
        action: {
          label: 'Undo',
          onClick: () => undoBulkDeletion(),
        },
        duration: remainingMs,
        id: toastId,
      });

      timeoutId = setTimeout(() => {
        void finalizeBulkDeletion();
      }, remainingMs);

      intervalId = setInterval(() => {
        const pending = pendingBulkDeletion.current;

        if (!pending) {
          clearInterval(intervalId!);
          return;
        }

        const secondsRemaining = Math.max(
          0,
          Math.ceil((pending.expiresAt - Date.now()) / 1000)
        );

        toast.warning('Users removed', {
          description: `${pending.message} Undo in ${secondsRemaining}s.`,
          action:
            secondsRemaining > 0
              ? {
                  label: 'Undo',
                  onClick: () => undoBulkDeletion(),
                }
              : undefined,
          duration: 5000,
          id: pending.toastId,
        });

        if (secondsRemaining <= 0) {
          clearInterval(intervalId!);
        }
      }, 250);
    }

    if (timeoutId) {
      pendingBulkDeletion.current = {
        users: stored.users,
        previousUsers: stored.previousUsers ?? undefined,
        toastId,
        timeoutId,
        intervalId,
        expiresAt: stored.expiresAt,
        message,
      };
      persistPendingBulkDeletion(pendingBulkDeletion.current);
    } else {
      persistPendingBulkDeletion(null);
    }
  }, [finalizeBulkDeletion, queryClient, undoBulkDeletion]);

  useEffect(() => {
    const pending = pendingBulkDeletion.current;

    if (!pending || pending.users.length === 0) {
      return;
    }

    const idsToDelete = new Set(pending.users.map((user) => user.id));
    const hasPendingUsers = users.some((user) => idsToDelete.has(user.id));

    if (!hasPendingUsers) {
      return;
    }

    queryClient.setQueryData<User[]>(usersKeys.list(), (old = []) =>
      old.filter((user) => !idsToDelete.has(user.id))
    );
  }, [queryClient, users]);

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) {
      return;
    }

    setIsDeleteDialogOpen(false);
    setUserToDelete(null);

    await deleteUserMutation.mutateAsync({ id: userToDelete.id });
  };

  const handleBulkDeleteRequest = () => {
    if (selectedUsers.length === 0) {
      return;
    }

    setIsBulkDialogOpen(true);
  };

  const handleConfirmBulkDelete = async () => {
    setIsBulkDialogOpen(false);
    await startBulkDelete(selectedUsers);
  };

  const columns = createColumns({
    onViewBio: handleViewBio,
    onEditUser: (user) => navigate(`/users/${user.id}`),
    onDeleteUser: handleDeleteUser,
  });

  return (
    <>
      <Header
        title="User Management"
        description="Manage and view all users fetched from the mock API."
        actions={
          <Link to="/users/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create User
            </Button>
          </Link>
        }
      />
      <div className="container mx-auto py-8 px-6">
        <DataTable
          columns={columns}
          data={users}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onSelectionChange={setSelectedUsers}
          onBulkDelete={handleBulkDeleteRequest}
          isBulkDeleting={isBulkProcessing}
          clearSelectionSignal={clearSelectionSignal}
        />
        <BioDialog
          user={selectedUser}
          open={isBioDialogOpen}
          onOpenChange={setIsBioDialogOpen}
        />
        <ConfirmDialog
          open={isDeleteDialogOpen && Boolean(userToDelete)}
          onOpenChange={(open) => {
            setIsDeleteDialogOpen(open);
            if (!open) {
              setUserToDelete(null);
            }
          }}
          title="Delete user"
          description={
            userToDelete
              ? `Are you sure you want to delete ${userToDelete.name}? This action cannot be undone.`
              : 'Are you sure you want to delete this user?'
          }
          confirmText="Delete"
          destructive
          isLoading={deleteUserMutation.isPending}
          onConfirm={handleConfirmDeleteUser}
        />
        <ConfirmDialog
          open={isBulkDialogOpen}
          onOpenChange={setIsBulkDialogOpen}
          title="Delete selected users"
          description={`Are you sure you want to delete ${selectedUsers.length} selected user(s)?`}
          confirmText="Delete"
          destructive
          isLoading={isBulkProcessing}
          onConfirm={handleConfirmBulkDelete}
        />
      </div>
    </>
  );
}
