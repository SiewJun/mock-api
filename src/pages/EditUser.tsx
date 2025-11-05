import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Header } from '@/components/layout';
import { UserForm } from '@/features/users/components';
import { useUser } from '@/features/users/api/users.hooks';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, RefreshCcw } from 'lucide-react';

export function EditUser() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      navigate('/', { replace: true });
    }
  }, [id, navigate]);

  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useUser(id, {
    retry: false,
  });

  if (!id) {
    return null;
  }

  const isPending = isLoading || isFetching;

  return (
    <>
      <Header
        title={user ? `Edit ${user.name}` : 'Edit User'}
        description="Update user details and manage their profile information."
        actions={
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        }
      />
      <div className="container mx-auto py-8 px-6 max-w-2xl">
        <div className="rounded-lg border bg-card p-6 shadow-sm min-h-80 flex items-center justify-center">
          {isPending && (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading user details...</span>
            </div>
          )}

          {!isPending && isError && (
            <div className="flex flex-col items-center gap-4 text-center">
              <div>
                <p className="text-destructive font-semibold">
                  Failed to load user
                </p>
                <p className="text-sm text-muted-foreground">
                  {error?.response?.data?.message ||
                    error?.message ||
                    'An unexpected error occurred while fetching the user details.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button variant="outline" onClick={() => navigate('/')}>
                  Back to list
                </Button>
                <Button onClick={() => refetch()} disabled={isFetching}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Try again
                </Button>
              </div>
            </div>
          )}

          {!isPending && !isError && user && (
            <div className="w-full">
              <UserForm mode="edit" initialData={user} userId={user.id} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
