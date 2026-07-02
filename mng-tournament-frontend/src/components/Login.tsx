import { useState } from 'react'

interface LoginProps {
  onLoginSuccess: (userData: any) => void
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!username.trim() || !password.trim()) {
      alert('Por favor, completa todos los campos.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // El backend nos devuelve un objeto con la estructura { token: "..." }
        localStorage.setItem('auth_token', data.token)
        
        const userData = { username: username.trim() }
        localStorage.setItem('auth_user', JSON.stringify(userData))

        onLoginSuccess(userData)
      } else {
        alert('Nombre de usuario o contraseña incorrectos.')
      }
    } catch (error) {
      alert('Error al conectar con el servidor de Django.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1a1a1a' }}>
      <form onSubmit={handleSubmit} style={{ padding: '2.5rem', background: '#242424', borderRadius: '8px', boxShadow: '0 8px 16px rgba(0,0,0,0.3)', width: '340px', color: '#fff' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#ff6b00' }}>Torneos UNSA - Ingreso</h2>
        
        <div style={{ marginBottom: '1.2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px' }}>Usuario</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#333', color: '#fff', boxSizing: 'border-box' }}
            placeholder="Introduce tu usuario de Django"
          />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px' }}>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#333', color: '#fff', boxSizing: 'border-box' }}
            placeholder="••••••••"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', padding: '0.75rem', background: '#ff6b00', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
        >
          {loading ? 'Validando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  )
}