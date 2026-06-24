// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';

// Public Pages
import RegisterPage from './pages/RegisterPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';

// Admin Pages
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ScannerPage from './pages/ScannerPage';
import TeamsPage from './pages/TeamsPage';
import ActivitiesPage from './pages/ActivitiesPage';
import ChallengesPage from './pages/ChallengesPage';
import ConferencesPage from './pages/ConferencesPage';
import ParticipantsPage from './pages/ParticipantsPage';

function RequireAuth({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Layout />}>
        <Route index element={<RegisterPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="profile/:userId" element={<ProfilePage />} />
        <Route path="login" element={<LoginPage />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<RequireAuth><Layout admin /></RequireAuth>}>
        <Route index element={<AdminDashboard />} />
        <Route path="scanner" element={<ScannerPage />} />
        <Route path="teams" element={<TeamsPage />} />
        <Route path="activities" element={<ActivitiesPage />} />
        <Route path="challenges" element={<ChallengesPage />} />
        <Route path="conferences" element={<ConferencesPage />} />
        <Route path="participants" element={<ParticipantsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
