import { useUsers } from '@/features/users/api/users.queries';
import { DataTable } from '@/features/users/components/DataTable';
import { createColumns } from '@/features/users/components/Columns';
import { BioDialog } from '@/features/users/components/BioDialog';
import { useState } from 'react';
import type { User } from '@/features/users/schemas/users.schema';

export function UsersList() {
  const { data: users = [], isLoading, isError, error } = useUsers();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isBioDialogOpen, setIsBioDialogOpen] = useState(false);

  const handleViewBio = (user: User) => {
    setSelectedUser(user);
    setIsBioDialogOpen(true);
  };

  const columns = createColumns({
    onViewBio: handleViewBio,
  });

  return (
    <div className="container mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Mock API Users</h1>
        <p className="text-muted-foreground mt-2">
          Manage and view all users fetched from the mock API.
        </p>
      </div>
      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        isError={isError}
        error={error}
      />
      <BioDialog
        user={selectedUser}
        open={isBioDialogOpen}
        onOpenChange={setIsBioDialogOpen}
      />
    </div>
  );
}
