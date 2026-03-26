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
import CommunityDuels from './pages/community/duels';
import CommunityMastery from './pages/community/mastery';
import CommunityDaily from './pages/community/daily';
import Tools from './pages/tools/tools';
import VerbSearch from './pages/tools/search';

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
          <Route path="/community/blitz" element={<CommunityBlitz />} />
          <Route path="/community/duels" element={<CommunityDuels />} />
          <Route path="/community/mastery" element={<CommunityMastery />} />
          <Route path="/community/daily" element={<CommunityDaily />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/tools/search" element={<VerbSearch />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
