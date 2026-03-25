import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import VerbyLanding from './pages/VerbyLanding';
import Login from './pages/auth/Login';
import Profile from './pages/profile/profile';
import EditProfile from './pages/profile/EditProfile';
import Arena from './pages/arena/Arena';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" richColors />
      <Router>
        <Routes>
          <Route path="/" element={<VerbyLanding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/arena" element={<Arena />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
