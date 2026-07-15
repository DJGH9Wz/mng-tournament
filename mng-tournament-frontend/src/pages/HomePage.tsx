import { useResourceList } from '../hooks'
import { useAuth } from '../context/AuthContext'
import type { Tournament, Organizer, Team, Player, PlayerTournament } from '../types/tournament'

export function HomePage() {
  const { isLoggedIn, profile, logout } = useAuth()
  const { data: tournaments } = useResourceList<Tournament>('tournaments')
  const { data: organizers } = useResourceList<Organizer>('organizers')
  const { data: teams } = useResourceList<Team>('teams')
  const { data: players } = useResourceList<Player>('players')
  const { data: registrations } = useResourceList<PlayerTournament>('player-tournaments')

  function handleLogout() {
    if (confirm('¿Deseas cerrar la sesión activa?')) {
      logout()
    }
  }

  const activeTournaments = tournaments?.filter(t => t.status).length || 0
  const activePlayers = players?.filter(p => p.status).length || 0

  return (
    <div className="home-page-container">
      
      {/* Cabecera del Dashboard */}
      <div className="dashboard-header">
        <div className="header-title-block">
          <h1>Sistema de Gestión de Torneos</h1>
          <p className="subtitle">Escuela Profesional de Ingeniería de Sistemas — EPIS</p>
        </div>
        {isLoggedIn && profile && (
          <div className="header-user-block">
            <span className="welcome-text"> Bienvenido, {profile.gamertag}</span>
            <button onClick={handleLogout} className="logout-link-btn">
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>

      <h2 className="section-title">Resumen del Sistema</h2>
      
      {/* Grid de Métricas */}
      <div className="home-grid">
        <div className="home-card">
          <h2>Torneos</h2>
          <p>Gestiona los torneos de videojuegos creados por los organizadores.</p>
          <div className="metric-value">
            {activeTournaments} <span className="metric-label">activos</span>
          </div>
        </div>

        <div className="home-card">
          <h2>Organizadores</h2>
          <p>Administra las organizaciones que crean torneos.</p>
          <div className="metric-value">
            {organizers?.length || 0} <span className="metric-label">registrados</span>
          </div>
        </div>

        <div className="home-card">
          <h2>Equipos</h2>
          <p>Visualiza y administra los equipos participantes.</p>
          <div className="metric-value">
            {teams?.length || 0} <span className="metric-label">totales</span>
          </div>
        </div>

        <div className="home-card">
          <h2>Jugadores</h2>
          <p>Gestiona los jugadores registrados en cada equipo.</p>
          <div className="metric-value">
            {activePlayers} <span className="metric-label">activos</span>
          </div>
        </div>

        <div className="home-card">
          <h2>Inscripciones</h2>
          <p>Controla las inscripciones de jugadores en torneos.</p>
          <div className="metric-value">
            {registrations?.length || 0} <span className="metric-label">participaciones</span>
          </div>
        </div>
      </div>

    </div>
  )
}