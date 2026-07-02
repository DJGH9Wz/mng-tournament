import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="app-shell">
      <nav className="navbar">
        <div className="nav-brand">MNG Tournament</div>
        <div className="nav-links">
          <Link to="/">Inicio</Link>
          <Link to="/tournaments">Torneos</Link>
          <Link to="/organizers">Organizadores</Link>
          <Link to="/teams">Equipos</Link>
          <Link to="/players">Jugadores</Link>
          <Link to="/player-tournaments">Inscripciones</Link>
        </div>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  )
}
