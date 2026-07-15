import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface Profile {
  id: number
  gamertag: string
  email: string
  rank: string | null
  role: 'admin' | 'captain' | 'player'
  team: number | null
  team_name: string | null
  status: boolean
}

interface AuthContextType {
  isLoggedIn: boolean
  profile: Profile | null
  login: (token: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)

  const fetchProfile = async (token: string) => {
    const res = await fetch('http://localhost:8000/api/my-profile/', {
      headers: { 'Authorization': `Token ${token}` }
    })
    if (!res.ok) throw new Error('No se pudo cargar el perfil')
    return res.json() as Promise<Profile>
  }

  const login = async (token: string) => {
    localStorage.setItem('token', token)
    const p = await fetchProfile(token)
    localStorage.setItem('userId', p.id.toString())
    localStorage.setItem('userRole', p.role)
    setProfile(p)
    setIsLoggedIn(true)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('userRole')
    setProfile(null)
    setIsLoggedIn(false)
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchProfile(token)
        .then(p => {
          setProfile(p)
          setIsLoggedIn(true)
        })
        .catch(() => logout())
    }
  }, [])

  return (
    <AuthContext.Provider value={{ isLoggedIn, profile, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
