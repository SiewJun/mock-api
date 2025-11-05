import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UsersList } from '@/pages/UsersList';
import { CreateUser } from '@/pages/CreateUser';
import { EditUser } from '@/pages/EditUser';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<UsersList />} />
        <Route path="/users/new" element={<CreateUser />} />
        <Route path="/users/:id" element={<EditUser />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
