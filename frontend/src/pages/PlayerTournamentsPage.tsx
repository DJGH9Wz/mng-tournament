import { useState } from 'react'
import type { TeamTournament } from '../types/tournament'
import {
  useCreateResource,
  useDeleteResource,
  useResourceList,
  useUpdateResource,
} from '../hooks'

const RESOURCE = 'team-tournaments'

const emptyForm = {
  team: '' as unknown as number,
  tournament: '' as unknown as number,
  score: 0,
  finalPosition: 0 as unknown as number,
}

export function PlayerTournamentsPage() {
  const { data: enrollments, isLoading, isError, refetch } = useResourceList<any>(RESOURCE)
  const { data: teams } = useResourceList<any>('teams')
  const { data: tournaments } = useResourceList<any>('tournaments')

  const createMutation = useCreateResource<TeamTournament>(RESOURCE)
  const updateMutation = useUpdateResource<TeamTournament>(RESOURCE)
  const deleteMutation = useDeleteResource(RESOURCE)

  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)

  function handleChange(field: string, value: number | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit() {
    if (!form.team || !form.tournament) {
      alert('Por favor, seleccione un equipo y un torneo.')
      return
    }

    if (editingId) {
      const payload = {
        score: Number(form.score),
        finalPosition: Number(form.finalPosition) || null,
      }
      updateMutation.mutate(
        { id: editingId, data: payload as any },
        {
          onSuccess: () => {
            setForm(emptyForm)
            setEditingId(null)
            alert('¡Inscripción actualizada con éxito!')
            refetch()
          },
        }
      )
    } else {
      const payload = {
        team: Number(form.team),
        tournament: Number(form.tournament),
      }
      createMutation.mutate(payload as unknown as TeamTournament, {
        onSuccess: () => {
          setForm(emptyForm)
          alert('¡Equipo inscrito en torneo con éxito!')
          refetch()
        },
        onError: (err: any) => {
          alert('Error al inscribir: ' + (err.message || 'Error desconocido'))
        },
      })
    }
  }

  function handleEdit(enrollment: any) {
    setEditingId(enrollment.id)
    setForm({
      team: enrollment.team,
      tournament: enrollment.tournament,
      score: enrollment.score ?? 0,
      finalPosition: enrollment.finalPosition ?? 0,
    })
  }

  function handleCancel() {
    setForm(emptyForm)
    setEditingId(null)
  }

  function handleDelete(id: number) {
    if (confirm('¿Está seguro de eliminar esta inscripción?')) {
      deleteMutation.mutate(id, { onSuccess: () => refetch() })
    }
  }

  if (isLoading) return <div className="status-message">Cargando inscripciones...</div>
  if (isError) return <div className="status-message error">Error al cargar inscripciones</div>

  return (
    <div className="page-container">
      <h1>Inscripciones de Equipos en Torneos</h1>

      <div className="form-card">
        <h2>{editingId ? 'Editar Inscripción' : 'Nueva Inscripción'}</h2>
        <div className="form-grid">
          <select
            value={form.team || ''}
            onChange={(e) => handleChange('team', Number(e.target.value))}
            className="form-select"
            disabled={!!editingId}
          >
            <option value="">-- Seleccione un Equipo --</option>
            {teams?.map((t: any) => (
              <option key={t.id} value={t.id}>
                {t.teamName}
              </option>
            ))}
          </select>

          <select
            value={form.tournament || ''}
            onChange={(e) => handleChange('tournament', Number(e.target.value))}
            className="form-select"
            disabled={!!editingId}
          >
            <option value="">-- Seleccione un Torneo --</option>
            {tournaments?.map((t: any) => (
              <option key={t.id} value={t.id}>
                {t.tournamentTitle} ({t.gameName})
              </option>
            ))}
          </select>

          {editingId && (
            <>
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
                placeholder="Posición final"
                value={form.finalPosition || ''}
                onChange={(e) => handleChange('finalPosition', Number(e.target.value))}
              />
            </>
          )}
        </div>
        <div className="form-actions">
          <button onClick={handleSubmit}>{editingId ? 'Actualizar' : 'Inscribir'}</button>
          {editingId && <button onClick={handleCancel} className="secondary">Cancelar</button>}
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Equipo</th>
            <th>Torneo</th>
            <th>Puntaje</th>
            <th>Posición</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {enrollments?.map((et: any) => (
            <tr key={et.id}>
              <td>{et.id}</td>
              <td>{et.team_detail?.teamName || `Equipo ${et.team}`}</td>
              <td>{et.tournament_detail?.tournamentTitle || `Torneo ${et.tournament}`}</td>
              <td>{et.score}</td>
              <td>{et.finalPosition ?? '-'}</td>
              <td>
                <span className={`status-badge ${et.status ? 'active' : 'inactive'}`}>
                  {et.status ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button onClick={() => handleEdit(et)}>Editar</button>
                  <button onClick={() => handleDelete(et.id)} className="danger">Eliminar</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
