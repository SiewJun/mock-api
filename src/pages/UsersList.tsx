import { useUsers } from '@/features/users/api/users.queries';
import { DataTable } from '@/features/users/components/DataTable';
import { createColumns } from '@/features/users/components/Columns';
import { BioDialog } from '@/features/users/components/BioDialog';
import { Header } from '@/components/layout';
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
    <>
      <Header
        title="User Management"
        description="Manage and view all users fetched from the mock API."
      />
      <div className="container mx-auto py-8 px-6">
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
    </>
  );
}
