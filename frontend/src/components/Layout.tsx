import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, profile, logout } = useAuth();

  const role = profile?.role
  const isAdmin = !!profile?.is_staff
  const isCaptain = role === 'captain'
  const isPlayer = role === 'player'

  const isActive = (path: string) => location.pathname === path ? 'nav-link active' : 'nav-link'

  const getInitial = () => {
    if (!profile?.gamertag) return '?';
    return profile.gamertag.charAt(0).toUpperCase();
  };

  return (
    <div className="app-container">
      <header className="main-header">
        <div className="logo-section">
          <span className="logo-unsa">MNG</span>
          <span className="logo-sub">Tournament</span>
        </div>
        <nav className="top-nav">
          <Link to="/" className={isActive('/')}>Inicio</Link>
          <Link to="/tournaments" className={isActive('/tournaments')}>Torneos</Link>

          {isLoggedIn && isCaptain && (
            <>
              <Link to="/my-team" className={isActive('/my-team')}>Mi Equipo</Link>
              <Link to="/invitations" className={isActive('/invitations')}>Invitaciones</Link>
            </>
          )}

          {isLoggedIn && isPlayer && (
            <Link to="/invitations" className={isActive('/invitations')}>Invitaciones</Link>
          )}

          {isLoggedIn && isAdmin && (
            <>
              <Link to="/organizers" className={isActive('/organizers')}>Organizadores</Link>
              <Link to="/players" className={isActive('/players')}>Jugadores</Link>
              <Link to="/teams" className={isActive('/teams')}>Equipos</Link>
            </>
          )}
        </nav>
      </header>

      <div className="main-layout">
        <main className="content-area">
          {children}
        </main>

        <aside className="right-sidebar">
          {isLoggedIn && profile ? (
            <div className="profile-card">
              <div className="user-avatar-container">
                <div className="user-avatar">{getInitial()}</div>
                {isAdmin ? (
                  <span className="badge-admin">Admin</span>
                ) : isCaptain ? (
                  <span className="badge-captain">Cap</span>
                ) : null}
              </div>
              
              <h3 className="user-gamertag">@{profile.gamertag}</h3>
              <p className="user-email">{profile.email}</p>
              {profile.team_name && (
                <p className="user-team">Equipo: {profile.team_name}</p>
              )}

              <hr className="divider" />

              <div className="sidebar-section">
                <h4>Rol</h4>
                <p className="role-text">
                  {isAdmin ? 'Administrador' : isCaptain ? 'Capitán' : isPlayer ? 'Jugador' : ''}
                </p>
              </div>

              <button className="logout-btn" onClick={logout}>
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="guest-card">
              <div className="guest-icon"></div>
              <h3>Unete a la Comunidad!</h3>
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
