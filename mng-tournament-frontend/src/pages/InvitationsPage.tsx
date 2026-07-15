import { useState, useEffect } from 'react'
import { getMyInvitations, respondInvitation } from '../api/tournamentApi'
import '../App.css'

interface Invitation {
  id: number
  team: number
  team_name: string
  player: number
  player_gamertag: string
  status: string
  created_at: string
}

export function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadInvitations = async () => {
    setLoading(true)
    try {
      const data = await getMyInvitations()
      setInvitations(data)
    } catch {
      setError('Error al cargar invitaciones')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInvitations()
  }, [])

  const handleRespond = async (id: number, action: 'accept' | 'reject') => {
    setError('')
    try {
      await respondInvitation(id, action)
      setInvitations(prev => prev.filter(inv => inv.id !== id))
    } catch (e: any) {
      setError(e.message || 'Error al responder invitación')
    }
  }

  if (loading) return <p className="loading-text">Cargando invitaciones...</p>

  return (
    <div className="page-container">
      <h2 className="page-title">Invitaciones</h2>

      {error && <p className="auth-error">{error}</p>}

      {invitations.length === 0 ? (
        <div className="empty-state">
          <p>No tienes invitaciones pendientes.</p>
        </div>
      ) : (
        <div className="invitations-list">
          {invitations.map((inv) => (
            <div key={inv.id} className="invitation-card">
              <div className="invitation-body">
                <p className="invitation-message">
                  El equipo <strong>{inv.team_name}</strong> quiere reclutarte
                </p>
              </div>
              <div className="invitation-actions">
                <button
                  onClick={() => handleRespond(inv.id, 'accept')}
                  className="invite-btn accept"
                >
                  Aceptar
                </button>
                <button
                  onClick={() => handleRespond(inv.id, 'reject')}
                  className="invite-btn reject"
                >
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
