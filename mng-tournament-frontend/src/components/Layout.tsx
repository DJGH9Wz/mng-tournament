import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Auth.css';

interface TournamentRegistration {
  id: number;
  name: string;
  status: string;
}

// Interfaz para la información que realmente viene de Django
interface UserData {
  username: string;
  email: string;
  is_staff: boolean;
  tournaments?: TournamentRegistration[]; // Opcional por si deseas agregarlo después en Django
}

interface LayoutProps {
  isLoggedIn: boolean;
  user: UserData | null; // Recibe el usuario actual o null desde App.tsx
  onLogout: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children, isLoggedIn, user, onLogout }) => {
  const navigate = useNavigate();

  // Obtener la inicial del nombre usando directamente el prop "user"
  const getInitial = () => {
    if (!user?.username) return '?';
    return user.username.charAt(0).toUpperCase();
  };

  const isAdmin = user?.is_staff || false;

  return (
    <div className="app-container">
      {/* Barra de Navegación Lateral Izquierda */}
      <header className="main-header">
        <div className="logo-section">
          <span className="logo-unsa">UNSA</span>
          <span className="logo-sub">Torneos</span>
        </div>
        <nav className="top-nav">
          <NavLink to="/" className="nav-link" end>Inicio</NavLink>
          <NavLink to="/tournaments" className="nav-link">Torneos</NavLink>

          {isLoggedIn && isAdmin && (
            <>
              <NavLink to="/organizers" className="nav-link">Organizadores</NavLink>
              <NavLink to="/players" className="nav-link">Jugadores</NavLink>
              <NavLink to="/teams" className="nav-link">Equipos</NavLink>
              <NavLink to="/registrations" className="nav-link">Inscripciones</NavLink>
            </>
          )}
        </nav>
      </header>

      <div className="main-layout">
        {/* Pantalla Central (Contenido Principal) */}
        <main className="content-area">
          {children}
        </main>

        {/* Barra Lateral Derecha (Sidebar de Usuario) */}
        <aside className="right-sidebar">
          {isLoggedIn && user ? (
            <div className="profile-card">
              <div className="user-avatar-container">
                <div className="user-avatar">{getInitial()}</div>
                {isAdmin && <span className="badge-admin">Admin</span>}
              </div>
              
              <h3 className="user-gamertag">@{user.username}</h3>
              <p className="user-email">{user.email}</p>

              <hr className="divider" />

              {/* Sección Mis Torneos */}
              <div className="sidebar-section">
                <h4>🏆 Mis Torneos</h4>
                {user.tournaments && user.tournaments.length > 0 ? (
                  <ul className="sidebar-list">
                    {user.tournaments.map((t) => (
                      <li key={t.id} className="sidebar-list-item">
                        <span className="tournament-dot"></span>
                        <div className="tournament-info">
                          <p className="t-name">{t.name}</p>
                          <span className="t-status">{t.status}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-text">No estás inscrito en ningún torneo todavía.</p>
                )}
              </div>

              {/* Sección Mis Estadísticas rápidas */}
              <div className="sidebar-section">
                <h4>📊 Estadísticas UNSA</h4>
                <div className="stats-grid">
                  <div className="stat-box">
                    <span className="stat-num">0</span>
                    <span className="stat-label">PJ</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-num">0%</span>
                    <span className="stat-label">Victorias</span>
                  </div>
                </div>
              </div>

              <button className="logout-btn" onClick={onLogout}>
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="guest-card">
              <div className="guest-icon">🎮</div>
              <h3>¡Únete a la Comunidad!</h3>
              <p>Inicia sesión o regístrate para unirte a los torneos de la UNSA, seguir tus fixtures y competir.</p>
              <div className="auth-buttons">
                <button className="login-btn-sidebar" onClick={() => navigate('/login')}>
                  Iniciar Sesión
                </button>
                <button className="register-btn-sidebar" onClick={() => navigate('/register')}>
                  Registrarse
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};