import { useState } from 'react'
import type { Player } from '../types/tournament'
import {
  useCreateResource,
  useDeleteResource,
  useResourceList,
  useUpdateResource,
} from '../hooks/useResource'

const RESOURCE = 'players'

const emptyForm = {
  gamertag: '',
  email: '',
  rank: '',
  status: true,
  team: '' as unknown as number,
}

export function PlayersPage() {
  const { data: players, isLoading, isError } = useResourceList<Player>(RESOURCE)
  const { data: teams } = useResourceList<any>('teams')

  const createMutation = useCreateResource<Player>(RESOURCE)
  const updateMutation = useUpdateResource<Player>(RESOURCE)
  const deleteMutation = useDeleteResource(RESOURCE)

  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)

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
      team: player.team ?? '',
    })
  }


  function handleCancel() {
    setForm(emptyForm)
    setEditingId(null)
  }

  function handleDelete(id: number) {
    if (confirm('Esta seguro de eliminar este jugador?')) {
      deleteMutation.mutate(id)
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
            <th>Equipo</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {players?.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.gamertag}</td>
              <td>{p.email}</td>
              <td>{p.rank}</td>
              <td>{(p as any).team_detail?.teamName || (p as any).team_detail?.name || p.team}</td>
              <td>{p.status ? 'Activo' : 'Inactivo'}</td>
              <td>
                <button onClick={() => handleEdit(p)}>Editar</button>
                <button onClick={() => handleDelete(p.id)} className="danger">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}