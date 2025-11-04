import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UsersList } from '@/pages/UsersList';
import { CreateUser } from '@/pages/CreateUser';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<UsersList />} />
        <Route path="/users/new" element={<CreateUser />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
