import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { searchPlayers, sendInvitation, removeTeamMember, getTeamMembers } from '../api/tournamentApi'
import { useResourceOne } from '../hooks'
import type { Team } from '../types/tournament'
import '../App.css'

const MAX_MEMBERS = 5

interface SearchResult {
  id: number
  gamertag: string
  email: string
  rank: string | null
  team: number | null
  team_name: string | null
}

interface TeamMember {
  user_id: number
  username: string
  gamertag: string
  email: string
  rank: string | null
  is_captain: boolean
}

export function MyTeamPage() {
  const { profile } = useAuth()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [sentTo, setSentTo] = useState<Set<number>>(new Set())
  const [error, setError] = useState('')
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loadingMembers, setLoadingMembers] = useState(true)

  const { data: team } = useResourceOne<Team>('teams', profile?.team || 0)

  const fetchMembers = useCallback(async () => {
    if (!profile?.team) return
    setLoadingMembers(true)
    try {
      const data = await getTeamMembers(profile.team)
      setMembers(data)
    } catch {
      // ignore
    } finally {
      setLoadingMembers(false)
    }
  }, [profile?.team])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

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
      await sendInvitation(profile.team, playerId);
      setSentTo(prev => {
        const next = new Set(prev);
        next.add(playerId);
        return next;
      });
      alert('Invitación enviada con éxito.');
    } catch (e: any) {
      const errorMsg = e.response?.data?.error || e.message || 'Error al enviar invitación';
      setError(errorMsg);
    }
  };

  const handleRemoveMember = async (userId: number, username: string) => {
    if (!profile?.team) return
    if (!confirm(`¿Eliminar a ${username} del equipo?`)) return
    try {
      await removeTeamMember(profile.team, userId)
      setMembers(prev => prev.filter(m => m.user_id !== userId))
    } catch (e: any) {
      const errorMsg = e.response?.data?.error || e.message || 'Error al eliminar miembro'
      alert(errorMsg)
    }
  }

  const currentMemberCount = members.length
  const isFull = currentMemberCount >= MAX_MEMBERS

  return (
    <div className="page-container">
      <h2 className="page-title">Mi Equipo</h2>

      {team && (
        <div className="team-info-card">
          <h3>{team.teamName}</h3>
          <div className="team-meta-row">
            <span className="team-capacity">
              Miembros: {currentMemberCount} / {MAX_MEMBERS}
            </span>
            {isFull && <span className="team-full-badge">Equipo completo</span>}
          </div>
        </div>
      )}

      <div className="team-members-section">
        <h3>Integrantes del Equipo</h3>
        {loadingMembers ? (
          <p className="text-muted">Cargando miembros...</p>
        ) : members.length === 0 ? (
          <p className="text-muted">No hay miembros registrados.</p>
        ) : (
          <div className="members-list">
            {members.map((m) => (
              <div key={m.user_id} className="member-card">
                <div className="member-info">
                  <div className="member-avatar">
                    {m.gamertag.charAt(0).toUpperCase()}
                  </div>
                  <div className="member-details">
                    <strong>{m.gamertag}</strong>
                    <span className="member-meta">
                      {m.rank && `Rank: ${m.rank}`}
                      {m.is_captain && ' | Capitán'}
                    </span>
                  </div>
                </div>
                {!m.is_captain && profile?.role === 'captain' && (
                  <button
                    className="remove-member-btn"
                    onClick={() => handleRemoveMember(m.user_id, m.gamertag)}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {profile?.role === 'captain' && (
        <div className="search-section">
          <h3>Buscar y Invitar Jugadores</h3>
          {isFull && (
            <p className="team-full-text">
              El equipo está completo ({MAX_MEMBERS}/{MAX_MEMBERS}). Elimina un miembro para invitar a otro.
            </p>
          )}
          <div className="search-bar">
            <input
              type="text"
              placeholder="Buscar por gamertag..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isFull && handleSearch()}
              className="auth-input search-input"
              disabled={isFull}
            />
            <button
              onClick={handleSearch}
              disabled={searching || isFull}
              className="auth-submit-btn search-btn"
            >
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
                    disabled={sentTo.has(p.id) || !!p.team || isFull}
                    className={`invite-btn ${sentTo.has(p.id) ? 'invited' : p.team || isFull ? 'unavailable' : ''}`}
                  >
                    {sentTo.has(p.id) ? 'Invitación enviada' : p.team ? 'En otro equipo' : isFull ? 'Equipo lleno' : 'Enviar invitación'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
