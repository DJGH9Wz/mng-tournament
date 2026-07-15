import { useState } from 'react'
import type { PlayerTournament, Player, Tournament } from '../types/tournament'
import {
  useCreateResource,
  useDeleteResource,
  useResourceList,
  useUpdateResource,
} from '../hooks'

const RESOURCE = 'player-tournaments'

const emptyForm = {
  score: 0,
  finalPosition: 0,
  status: true,
  player: '' as unknown as number,      
  tournament: '' as unknown as number,
}

export function PlayerTournamentsPage() {
  const { data: enrollments, isLoading, isError } = useResourceList<PlayerTournament>(RESOURCE)
  const { data: players } = useResourceList<Player>('players')
  const { data: tournaments } = useResourceList<Tournament>('tournaments')

  const createMutation = useCreateResource<PlayerTournament>(RESOURCE)
  const updateMutation = useUpdateResource<PlayerTournament>(RESOURCE)
  const deleteMutation = useDeleteResource(RESOURCE)

  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)

  function handleChange(field: string, value: number | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit() {
    if (!form.player || !form.tournament) {
      alert('Por favor, seleccione un jugador y un torneo.');
      return;
    }

    const payload: Partial<PlayerTournament> = {
      score: Number(form.score),
      finalPosition: Math.max(0, Number(form.finalPosition)),
      status: form.status,
      player: Number(form.player),
      tournament: Number(form.tournament),
    };

    if (editingId) {
      updateMutation.mutate(
        { id: editingId, data: payload as PlayerTournament },
        {
          onSuccess: () => {
            setForm(emptyForm)
            setEditingId(null)
            alert('¡Inscripción actualizada con éxito!')
          },
        }
      )
    } else {
      createMutation.mutate(payload as PlayerTournament, {
        onSuccess: () => {
          setForm(emptyForm)
          alert('¡Inscripción creada con éxito!')
        },
      })
    }
  }

  function handleEdit(pt: PlayerTournament) {
    setEditingId(pt.id)
    setForm({
      score: pt.score,
      finalPosition: pt.finalPosition ?? 0,
      status: pt.status,
      player: pt.player,
      tournament: pt.tournament,
    })
  }

  function handleCancel() {
    setForm(emptyForm)
    setEditingId(null)
  }

  function handleDelete(id: number) {
    if (confirm('Esta seguro de eliminar esta inscripcion?')) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) return <div className="status-message">Cargando inscripciones...</div>
  if (isError) return <div className="status-message error">Error al cargar inscripciones</div>

  return (
    <div className="page-container">
      <h1>Inscripciones (Player Tournament)</h1>

      <div className="form-card">
        <h2>{editingId ? 'Editar Inscripcion' : 'Nueva Inscripcion'}</h2>
        <div className="form-grid">
          <select
            value={form.player || ''}
            onChange={(e) => handleChange('player', Number(e.target.value))}
            className="form-select"
          >
            <option value="">-- Seleccione un Jugador --</option>
            {players?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.gamertag}
              </option>
            ))}
          </select>

          <select
            value={form.tournament || ''}
            onChange={(e) => handleChange('tournament', Number(e.target.value))}
            className="form-select"
          >
            <option value="">-- Seleccione un Torneo --</option>
            {tournaments?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.tournamentTitle} ({t.gameName})
              </option>
            ))}
          </select>

          <input
            type="number"
            min="0"
            placeholder="Puntaje"
            value={form.score}
            onChange={(e) => handleChange('score', Number(e.target.value))}
          />
          <input
            type="number"
            min="0"
            placeholder="Posicion final"
            value={form.finalPosition}
            onChange={(e) => handleChange('finalPosition', Number(e.target.value))}
          />
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
            <th>Jugador</th>
            <th>Torneo</th>
            <th>Puntaje</th>
            <th>Posicion</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {enrollments?.map((pt) => (
            <tr key={pt.id}>
              <td>{pt.id}</td>
              <td>{(pt as any).player_detail?.gamertag || `Jugador ${pt.player}`}</td>
              <td>{(pt as any).tournament_detail?.tournamentTitle || `Torneo ${pt.tournament}`}</td>
              <td>{pt.score}</td>
              <td>{pt.finalPosition}</td>
              <td>{pt.status ? 'Activo' : 'Inactivo'}</td>
              <td>
                <button onClick={() => handleEdit(pt)}>Editar</button>
                <button onClick={() => handleDelete(pt.id)} className="danger">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}