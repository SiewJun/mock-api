import { Header } from '@/components/layout';
import { UserForm } from '@/features/users/components';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function CreateUser() {
  return (
    <>
      <Header
        title="Create New User"
        description="Add a new user to the system with all required information"
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
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <UserForm />
        </div>
      </div>
    </>
  );
}
