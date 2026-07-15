import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { searchPlayers, sendInvitation } from '../api/tournamentApi'
import { useResourceOne } from '../hooks'
import type { Team } from '../types/tournament'
import '../App.css'

interface SearchResult {
  id: number
  gamertag: string
  email: string
  rank: string | null
  team: number | null
  team_name: string | null
}

export function MyTeamPage() {
  const { profile } = useAuth()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [sentTo, setSentTo] = useState<Set<number>>(new Set())
  const [error, setError] = useState('')

  const { data: team } = useResourceOne<Team>('teams', profile?.team || 0)

  const handleSearch = async () => {
    if (!query.trim()) return
    setSearching(true)
    setError('')
    try {
      const data = await searchPlayers(query.trim())
      setResults(data)
    } catch {
      setError('Error al buscar jugadores')
    } finally {
      setSearching(false)
    }
  }

  const handleInvite = async (playerId: number) => {
    if (!profile?.team) {
      alert('No tienes un equipo asignado o no eres capitán.');
      return;
    }
    setError('');
    try {
      // 1. Llama a la API para intentar enviar la invitación en el backend
      await sendInvitation(profile.team, playerId);
      
      // 2. Si la API responde con éxito, marcamos al jugador como "invitado" en la interfaz
      setSentTo(prev => {
        const next = new Set(prev);
        next.add(playerId);
        return next;
      });
      alert('¡Invitación enviada con éxito!'); 
    } catch (e: any) {
      // 3. Si el backend rechaza la petición, capturamos el mensaje de error real y lo mostramos
      const errorMsg = e.response?.data?.error || e.message || 'Error al enviar invitación';
      setError(errorMsg);
      alert('Error: ' + errorMsg); 
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">Mi Equipo</h2>

      {team && (
        <div className="team-info-card">
          <h3>{team.teamName}</h3>
          <p>ID del equipo: {team.id}</p>
        </div>
      )}

      <div className="search-section">
        <h3>Buscar Jugadores</h3>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar por gamertag..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="auth-input search-input"
          />
          <button onClick={handleSearch} disabled={searching} className="auth-submit-btn search-btn">
            {searching ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {error && <p className="auth-error">{error}</p>}

        {results.length > 0 && (
          <div className="search-results">
            {results.map((p) => (
              <div key={p.id} className="player-result-card">
                <div className="player-info">
                  <strong>{p.gamertag}</strong>
                  <span className="player-meta">
                    {p.rank && `Rank: ${p.rank}`}
                    {p.team_name ? ` | Equipo: ${p.team_name}` : ' | Sin equipo'}
                  </span>
                </div>
                <button
                  onClick={() => handleInvite(p.id)}
                  disabled={sentTo.has(p.id) || !!p.team}
                  className={`invite-btn ${sentTo.has(p.id) ? 'invited' : p.team ? 'unavailable' : ''}`}
                >
                  {sentTo.has(p.id) ? 'Invitación enviada' : p.team ? 'En otro equipo' : 'Enviar invitación'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
