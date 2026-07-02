import { useState } from 'react'
import type { Tournament } from '../types/tournament'
import {
  useCreateResource,
  useDeleteResource,
  useResourceList,
  useUpdateResource,
} from '../hooks/useResource'

const RESOURCE = 'tournaments'

const emptyForm = {
  gameName: '',
  tournamentTitle: '',
  virtualPrize: '',
  maxParticipants: '' as unknown as number,
  eventDate: '',
  status: true,
  organizer: '' as unknown as number,
}

export function TournamentsPage() {
  const { data: tournaments, isLoading, isError } = useResourceList<Tournament>(RESOURCE);
  const { data: organizers } = useResourceList<any>('organizers');
  const createMutation = useCreateResource<Tournament>(RESOURCE)
  const updateMutation = useUpdateResource<Tournament>(RESOURCE)
  const deleteMutation = useDeleteResource(RESOURCE)

  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)

  function handleChange(field: string, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit() {
    if (!form.organizer) {
      alert('Por favor, seleccione un organizador.');
      return;
    }

    const payload: Partial<Tournament> = {
      gameName: form.gameName,
      tournamentTitle: form.tournamentTitle,
      virtualPrize: form.virtualPrize,
      maxParticipants: Math.max(0, Number(form.maxParticipants)),
      eventDate: form.eventDate,
      status: form.status,
      organizer: Number(form.organizer),
    };

    if (editingId) {
      updateMutation.mutate(
        { id: editingId, data: payload as Tournament},
        {
          onSuccess: () => {
            setForm(emptyForm)
            setEditingId(null)
            alert('¡Torneo actualizado con éxito!')
          }
        }
      )
    } else {
      createMutation.mutate(payload as Tournament, {
        onSuccess: () => {
          setForm(emptyForm)
          alert('¡Torneo creado con éxito!')
        }
      })
    }
  }

  function handleEdit(tournament: Tournament) {
    setEditingId(tournament.id)
    setForm({
      gameName: tournament.gameName,
      tournamentTitle: tournament.tournamentTitle,
      virtualPrize: tournament.virtualPrize,
      maxParticipants: tournament.maxParticipants,
      eventDate: tournament.eventDate,
      status: tournament.status,
      organizer: tournament.organizer,
    })
  }

  function handleCancel() {
    setForm(emptyForm)
    setEditingId(null)
  }

  function handleDelete(id: number) {
    if (confirm('Esta seguro de eliminar este torneo?')) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) return <div className="status-message">Cargando torneos...</div>
  if (isError) return <div className="status-message error">Error al cargar torneos</div>

  return (
    <div className="page-container">
      <h1>Torneos</h1>

      <div className="form-card">
        <h2>{editingId ? 'Editar Torneo' : 'Nuevo Torneo'}</h2>
        <div className="form-grid">
          <input
            placeholder="Nombre del juego"
            value={form.gameName}
            onChange={(e) => handleChange('gameName', e.target.value)}
          />
          <input
            placeholder="Titulo del torneo"
            value={form.tournamentTitle}
            onChange={(e) => handleChange('tournamentTitle', e.target.value)}
          />
          <input
            placeholder="Premio virtual"
            value={form.virtualPrize}
            onChange={(e) => handleChange('virtualPrize', e.target.value)}
          />
          <input
            type="number"
            min="0"
            placeholder="Maximo de participantes"
            value={form.maxParticipants || ''} // Usar '' evita que se quede un cero molesto por defecto
            onChange={(e) => handleChange('maxParticipants', Number(e.target.value))}
          />
          <input
            type="date"
            value={form.eventDate}
            onChange={(e) => handleChange('eventDate', e.target.value)}
          />
          <select
            value={form.organizer || ''}
            onChange={(e) => handleChange('organizer', e.target.value ? Number(e.target.value) : '')}
            className="form-select" // Añade tu clase CSS si tienes estilos listos
          >
            <option value="">-- Seleccione un Organizador --</option>
            {organizers?.map((org: any) => (
              <option key={org.id} value={org.id}>
                {org.organizationName}
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
            <th>Juego</th>
            <th>Titulo</th>
            <th>Premio</th>
            <th>Max. Part.</th>
            <th>Fecha</th>
            <th>Organizador</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tournaments?.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.gameName}</td>
              <td>{t.tournamentTitle}</td>
              <td>{t.virtualPrize}</td>
              <td>{t.maxParticipants}</td>
              <td>{t.eventDate ? t.eventDate.split('T')[0] : ''}</td>
              <td>{t.organizer_detail?.organizationName || 'Sin Organizador'}</td>
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