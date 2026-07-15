
import { useState } from 'react'
import type { Player } from '../types/tournament'
import {
  useCreateResource,
  useDeleteResource,
  useResourceList,
  useUpdateResource,
} from '../hooks'
import { useAuth } from '../context/AuthContext'

const RESOURCE = 'players'

const emptyForm = {
  gamertag: '',
  email: '',
  rank: '',
  status: true,
  role: 'player', // Soporta 'player' | 'captain' | 'admin'
  team: '' as unknown as number,
}

export function PlayersPage() {
  const { profile } = useAuth()
  const { data: players, isLoading, isError, refetch } = useResourceList<Player>(RESOURCE)
  const { data: teams } = useResourceList<any>('teams')

  const createMutation = useCreateResource<Player>(RESOURCE)
  const updateMutation = useUpdateResource<Player>(RESOURCE)
  const deleteMutation = useDeleteResource(RESOURCE)

  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)

  const isAdmin = profile?.role === 'admin'

  function handleChange(field: string, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit() {
    if (!form.team) {
      alert('Por favor, seleccione un equipo.')
      return
    }

    const payload: Partial<Player> = {
      gamertag: form.gamertag,
      email: form.email,
      rank: form.rank,
      status: form.status,
      role: form.role, // Envía 'admin', 'captain' o 'player'
      team: Number(form.team), 
    }

    if (editingId) {
      updateMutation.mutate(
        { id: editingId, data: payload as Player },
        {
          onSuccess: () => {
            setForm(emptyForm)
            setEditingId(null)
            alert('¡Jugador actualizado con éxito!')
          },
        }
      )
    } else {
      createMutation.mutate(payload as Player, {
        onSuccess: () => {
          setForm(emptyForm)
          alert('¡Jugador creado con éxito!')
        },
      })
    }
  }

  function handleEdit(player: Player) {
    setEditingId(player.id)
    setForm({
      gamertag: player.gamertag,
      email: player.email,
      rank: player.rank ?? '',
      status: player.status,
      role: (player as any).role || 'player',
      team: player.team ?? '',
    })
  }

  // Maneja la rotación del rol entre las 3 opciones mediante clics consecutivos
  function handleToggleRole(player: any) {
    if (!isAdmin) {
      alert("No tienes permisos para realizar esta acción.")
      return
    }

    // Rotación ordenada: player -> captain -> admin -> player
    let newRole = 'player'
    if (player.role === 'player') {
      newRole = 'captain'
    } else if (player.role === 'captain') {
      newRole = 'admin'
    }

    const confirmMessage = `¿Estás seguro de cambiar el rol de "${player.gamertag}" a ${newRole.toUpperCase()}?`

    if (window.confirm(confirmMessage)) {
      updateMutation.mutate(
        { 
          id: player.id, 
          data: { ...player, role: newRole } as Player 
        },
        {
          onSuccess: () => {
            alert('¡Rol de jugador actualizado con éxito!')
            if (refetch) refetch()
          },
          onError: (err: any) => {
            alert('Error al actualizar el rol: ' + (err.message || 'Error desconocido'))
          }
        }
      )
    }
  }

  function handleCancel() {
    setForm(emptyForm)
    setEditingId(null)
  }

  function handleDelete(id: number) {
    if (confirm('¿Está seguro de eliminar este jugador?')) {
      deleteMutation.mutate(id)
    }
  }

  // Muestra el nombre exacto usando tus clases CSS
  function getRoleLabel(role: string) {
    switch (role) {
      case 'admin':
        return ' Administrador'
      case 'captain':
        return ' Capitán'
      case 'player':
      default:
        return ' Jugador'
    }
  }

  if (isLoading) return <div className="status-message">Cargando jugadores...</div>
  if (isError) return <div className="status-message error">Error al cargar jugadores</div>

  return (
    <div className="page-container">
      <h1>Jugadores</h1>

      <div className="form-card">
        <h2>{editingId ? 'Editar Jugador' : 'Nuevo Jugador'}</h2>
        <div className="form-grid">
          <input
            placeholder="Gamertag"
            value={form.gamertag}
            onChange={(e) => handleChange('gamertag', e.target.value)}
          />
          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
          <input
            placeholder="Rank"
            value={form.rank}
            onChange={(e) => handleChange('rank', e.target.value)}
          />
          
          <select
            value={form.team || ''}
            onChange={(e) => handleChange('team', e.target.value ? Number(e.target.value) : '')}
            className="form-select"
          >
            <option value="">-- Seleccione un Equipo --</option>
            {teams?.map((t: any) => (
              <option key={t.id} value={t.id}>
                {t.teamName || t.name || `Equipo ${t.id}`} 
              </option>
            ))}
          </select>

          {/* Selector de roles en el formulario con las 3 opciones exactas */}
          {isAdmin && (
            <select
              value={form.role}
              onChange={(e) => handleChange('role', e.target.value)}
              className="form-select"
            >
              <option value="player">Jugador</option>
              <option value="captain">Capitán</option>
              <option value="admin">Administrador</option>
            </select>
          )}

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.status}
              onChange={(e) => handleChange('status', e.target.checked)}
            />
            Activo
          </label>
        </div>
        <div className="form-actions">
          <button onClick={handleSubmit}>{editingId ? 'Actualizar' : 'Crear'}</button>
          {editingId && <button onClick={handleCancel} className="secondary">Cancelar</button>}
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Gamertag</th>
            <th>Email</th>
            <th>Rank</th>
            <th>Rol</th>
            <th>Equipo</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {players?.map((p) => {
            const isSelf = p.id === profile?.id
            const currentRole = (p as any).role || 'player'

            return (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.gamertag}</td>
                <td>{p.email}</td>
                <td>{p.rank}</td>
                <td>
                  <span className={`role-badge ${currentRole}`} style={{
                    fontWeight: currentRole !== 'player' ? 'bold' : 'normal',
                    color: currentRole === 'admin' ? '#ffd700' : currentRole === 'captain' ? '#1890ff' : 'inherit'
                  }}>
                    {getRoleLabel(currentRole)}
                  </span>
                </td>
                <td>{(p as any).team_detail?.teamName || (p as any).team_detail?.name || p.team}</td>
                <td>{p.status ? 'Activo' : 'Inactivo'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => handleEdit(p)}>Editar</button>
                    
                    {/* Botón con el CSS original para rotar entre los 3 roles */}
                    {isAdmin && !isSelf && (
                      <button 
                        onClick={() => handleToggleRole(p)} 
                        className="warning"
                        style={{ backgroundColor: '#f0ad4e', color: 'white' }}
                      >
                        {currentRole === 'player' && 'Hacer Capitán'}
                        {currentRole === 'captain' && 'Hacer Admin'}
                        {currentRole === 'admin' && 'Hacer Jugador'}
                      </button>
                    )}

                    <button onClick={() => handleDelete(p.id)} className="danger">Eliminar</button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
