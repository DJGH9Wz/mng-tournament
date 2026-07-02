import { useState } from 'react'
import type { Team } from '../types/tournament'
import {
  useCreateResource,
  useDeleteResource,
  useResourceList,
  useUpdateResource,
} from '../hooks/useResource'

const RESOURCE = 'teams'

const emptyForm = {
  teamName: '',
  logoUrl: '',
  status: true,
}

export function TeamsPage() {
  const { data, isLoading, isError } = useResourceList<Team>(RESOURCE)
  const createMutation = useCreateResource<Team>(RESOURCE)
  const updateMutation = useUpdateResource<Team>(RESOURCE)
  const deleteMutation = useDeleteResource(RESOURCE)

  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)

  function handleChange(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit() {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: form })
    } else {
      createMutation.mutate(form)
    }
    setForm(emptyForm)
    setEditingId(null)
  }

  function handleEdit(team: Team) {
    setEditingId(team.id)
    setForm({
      teamName: team.teamName,
      logoUrl: team.logoUrl,
      status: team.status,
    })
  }

  function handleCancel() {
    setForm(emptyForm)
    setEditingId(null)
  }

  function handleDelete(id: number) {
    if (confirm('Esta seguro de eliminar este equipo?')) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) return <div className="status-message">Cargando equipos...</div>
  if (isError) return <div className="status-message error">Error al cargar equipos</div>

  return (
    <div className="page-container">
      <h1>Equipos</h1>

      <div className="form-card">
        <h2>{editingId ? 'Editar Equipo' : 'Nuevo Equipo'}</h2>
        <div className="form-grid">
          <input
            placeholder="Nombre del equipo"
            value={form.teamName}
            onChange={(e) => handleChange('teamName', e.target.value)}
          />
          <input
            placeholder="URL del logo"
            value={form.logoUrl}
            onChange={(e) => handleChange('logoUrl', e.target.value)}
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
            <th>Equipo</th>
            <th>Logo</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.teamName}</td>
              <td>{t.logoUrl}</td>
              <td>{t.status ? 'Activo' : 'Inactivo'}</td>
              <td>
                <button onClick={() => handleEdit(t)}>Editar</button>
                <button onClick={() => handleDelete(t.id)} className="danger">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}