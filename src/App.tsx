import { UsersList } from '@/pages/UsersList';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <>
      <Toaster position='top-center' />
      <UsersList />
    </>
  );
}

export default App;
