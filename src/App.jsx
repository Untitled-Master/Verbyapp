import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VerbyLanding from './pages/VerbyLanding';
import Login from './pages/account/login';
import Register from './pages/account/register';
import Profile from './pages/profile/profile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<VerbyLanding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;