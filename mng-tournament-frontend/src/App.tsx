import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { HomePage } from './pages/HomePage';
import { TournamentsPage } from './pages/TournamentsPage';
import { OrganizersPage } from './pages/OrganizersPage';
import { PlayersPage } from './pages/PlayersPage';
import { TeamsPage } from './pages/TeamsPage';
import { PlayerTournamentsPage } from './pages/PlayerTournamentsPage';
import './App.css';

// Interfaz para los datos del usuario de Django
interface UserData {
  id: number;      
  username: string;
  email: string;
  is_staff: boolean;
}

interface ProtectedRouteProps {
  isAllowed: boolean;
  children: React.ReactNode;
}

// Componente para proteger rutas de administración
const ProtectedRoute = ({ isAllowed, children }: ProtectedRouteProps) => {
  if (!isAllowed) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<UserData | null>(null);

  // Cargar datos del usuario si hay un token guardado
  const fetchUserData = async (token: string) => {
    console.log("Intentando recuperar usuario con el Token:", token);
    try {
      const response = await fetch('http://localhost:8000/api/current-user/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("Respuesta del servidor HTTP Status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Datos del usuario recibidos de Django:", data);

        if (data.id) {
          localStorage.setItem('userId', data.id.toString()); 
        }
        
        setUser(data);
        setIsLoggedIn(true);
      } else {
        console.warn("La respuesta no fue correcta (no es 2xx). Cerrando sesión...");
        handleLogout();
      }
    } catch (error) {
      console.error("Error de red o CORS conectando a la API de Django:", error);
      handleLogout();
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log("Token detectado en localStorage al cargar:", token);
    if (token) {
      fetchUserData(token);
    }
  }, []);

  const handleLoginSuccess = (token: string) => {
    console.log("Login exitoso. Guardando token en localStorage:", token);
    localStorage.setItem('token', token);
    fetchUserData(token);
  };

  const handleLogout = () => {
    console.log("Ejecutando Logout: limpiando estados y localStorage.");
    localStorage.removeItem('token');
    localStorage.removeItem('userId'); 
    setUser(null);
    setIsLoggedIn(false);
  };

  const isAdmin = user?.is_staff || false;

 return (
    <Router>
      {/* Pasamos 'isLoggedIn', 'user' (que contiene tu perfil) y 'onLogout' */}
      <Layout 
        isLoggedIn={isLoggedIn} 
        user={user} 
        onLogout={handleLogout}
      >
        <Routes>
          {/* ... tus rutas se quedan exactamente igual ... */}
          <Route path="/" element={<HomePage />} />
          <Route path="/tournaments" element={<TournamentsPage isAdmin={isAdmin} />} />
          
          <Route 
            path="/login" 
            element={isLoggedIn ? <Navigate to="/" /> : <Login onLoginSuccess={handleLoginSuccess} />} 
          />
          <Route 
            path="/register" 
            element={isLoggedIn ? <Navigate to="/" /> : <Register />} 
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
          <Route 
            path="/registrations" 
            element={
              <ProtectedRoute isAllowed={isLoggedIn && isAdmin}>
                <PlayerTournamentsPage />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;