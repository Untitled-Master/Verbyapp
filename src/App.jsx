import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import VerbyLanding from './pages/VerbyLanding';
import Login from './pages/auth/Login';
import Profile from './pages/profile/profile';
import PublicProfile from './pages/profile/PublicProfile';
import EditProfile from './pages/profile/EditProfile';
import Arena from './pages/arena/Arena';
import Blitz from './pages/arena/blitz';
import CommunityBlitz from './pages/community/blitz';
import CommunityDuels from './pages/community/duels';
import CommunityMastery from './pages/community/mastery';
import CommunityDaily from './pages/community/daily';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" richColors />
      <Router>
        <Routes>
          <Route path="/" element={<VerbyLanding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:id" element={<PublicProfile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/arena" element={<Arena />} />
          <Route path="/arena/blitz" element={<Blitz />} />
          <Route path="/community/blitz" element={<CommunityBlitz />} />
          <Route path="/community/duels" element={<CommunityDuels />} />
          <Route path="/community/mastery" element={<CommunityMastery />} />
          <Route path="/community/daily" element={<CommunityDaily />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
