import { useState, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { TournamentsPage } from './pages/TournamentsPage'
import { OrganizersPage } from './pages/OrganizersPage'
import { TeamsPage } from './pages/TeamsPage'
import { PlayersPage } from './pages/PlayersPage'
import { PlayerTournamentsPage } from './pages/PlayerTournamentsPage'
import { Login } from './components/Login'
import './App.css'

function App() {
  const [user, setUser] = useState<any>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user')
    const token = localStorage.getItem('auth_token')
    if (savedUser && token) {
      setUser(JSON.parse(savedUser))
    }
    setCheckingAuth(false)
  }, [])

  if (checkingAuth) {
    return <div className="status-message">Verificando credenciales...</div>
  }

  if (!user) {
    return <Login onLoginSuccess={(userData) => setUser(userData)} />
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tournaments" element={<TournamentsPage />} />
          <Route path="/organizers" element={<OrganizersPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/player-tournaments" element={<PlayerTournamentsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App