import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { HomePage } from './pages/HomePage';
import { TournamentsPage } from './pages/TournamentsPage';
import { OrganizersPage } from './pages/OrganizersPage';
import { PlayersPage } from './pages/PlayersPage';
import { TeamsPage } from './pages/TeamsPage';
import { MyTeamPage } from './pages/MyTeamPage';
import { InvitationsPage } from './pages/InvitationsPage';
import './App.css';

interface ProtectedRouteProps {
  isAllowed: boolean;
  children: React.ReactNode;
}

const ProtectedRoute = ({ isAllowed, children }: ProtectedRouteProps) => {
  if (!isAllowed) return <Navigate to="/" replace />;
  return <>{children}</>;
};

function AppRoutes() {
  const { isLoggedIn, profile } = useAuth();
  const isAdmin = !!profile?.is_staff;
  const isCaptain = profile?.role === 'captain';
  const isPlayer = profile?.role === 'player';

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tournaments" element={<TournamentsPage />} />

        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/register"
          element={isLoggedIn ? <Navigate to="/" /> : <Register />}
        />

        <Route
          path="/my-team"
          element={
            <ProtectedRoute isAllowed={isLoggedIn && isCaptain}>
              <MyTeamPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invitations"
          element={
            <ProtectedRoute isAllowed={isLoggedIn && (isCaptain || isPlayer)}>
              <InvitationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizers"
          element={
            <ProtectedRoute isAllowed={isLoggedIn && isAdmin}>
              <OrganizersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/players"
          element={
            <ProtectedRoute isAllowed={isLoggedIn && isAdmin}>
              <PlayersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams"
          element={
            <ProtectedRoute isAllowed={isLoggedIn && isAdmin}>
              <TeamsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
