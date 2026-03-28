import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import VerbyLanding from './pages/VerbyLanding';
import Login from './pages/auth/Login';
import Profile from './pages/profile/profile';
import PublicProfile from './pages/profile/PublicProfile';
import EditProfile from './pages/profile/EditProfile';
import Arena from './pages/arena/Arena';
import Blitz from './pages/arena/blitz';
import VerbyStreak from './pages/arena/VerbyStreak';
import ZenMode from './pages/arena/ZenMode';
import CommunityBlitz from './pages/community/blitz';
import CommunityStreak from './pages/community/streak';
import CommunitySDL from './pages/community/sdl';
import SDLBlitz from './pages/arena/SDLBlitz';
import SDLZenMode from './pages/arena/SDLZenMode';
import Tools from './pages/tools/tools';
import VerbSearch from './pages/tools/search';
import Admin from './pages/admin/admin';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" richColors />
      <Router>
        <Routes>
          <Route path="/" element={<VerbyLanding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<PublicProfile />} />
          <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="/arena" element={<ProtectedRoute><Arena /></ProtectedRoute>} />
          <Route path="/arena/blitz" element={<ProtectedRoute><Blitz /></ProtectedRoute>} />
          <Route path="/arena/streak" element={<ProtectedRoute><VerbyStreak /></ProtectedRoute>} />
          <Route path="/arena/zen" element={<ProtectedRoute><ZenMode /></ProtectedRoute>} />
          <Route path="/arena/sdl" element={<ProtectedRoute><SDLBlitz /></ProtectedRoute>} />
          <Route path="/arena/sdlzen" element={<ProtectedRoute><SDLZenMode /></ProtectedRoute>} />
          <Route path="/community/blitz" element={<CommunityBlitz />} />
          <Route path="/community/streak" element={<CommunityStreak />} />
          <Route path="/community/sdl" element={<CommunitySDL />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/tools/search" element={<VerbSearch />} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
