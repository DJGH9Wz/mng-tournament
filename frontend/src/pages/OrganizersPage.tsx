import { useState } from 'react';
import type { Organizer } from '../types/tournament'; 
import {
  useCreateResource,
  useDeleteResource,
  useResourceList,
  useUpdateResource,
} from '../hooks';

const RESOURCE = 'organizers'

const emptyForm = {
  organizationName: '',
  email: '',
  website: '',
  status: true,
}

export function OrganizersPage() {
  const { data, isLoading, isError } = useResourceList<Organizer>(RESOURCE)
  const createMutation = useCreateResource<Organizer>(RESOURCE)
  const updateMutation = useUpdateResource<Organizer>(RESOURCE)
  const deleteMutation = useDeleteResource(RESOURCE)

  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)

  function handleChange(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

function handleSubmit(e: React.FormEvent) {
  e?.preventDefault();

  // Aseguramos que 'website' sea un string válido antes de aplicar trim()
  const websiteValue = typeof form.website === 'string' ? form.website.trim() : '';

  const payload: Partial<Organizer> = {
    organizationName: form.organizationName,
    email: form.email,
    status: form.status,
    website: websiteValue === '' ? null : websiteValue,
  };

  if (editingId) {
    updateMutation.mutate(
      { id: editingId, data: payload },
      {
        onSuccess: () => {
          setForm(emptyForm);
          setEditingId(null);
          alert('¡Organizador actualizado!');
        },
      }
    );
  } else {
    createMutation.mutate(payload, {
      onSuccess: () => {
        setForm(emptyForm);
        alert('¡Organizador creado con éxito!');
      },
    });
  }
}

  function handleEdit(organizer: Organizer) {
    setEditingId(organizer.id)
    setForm({
      organizationName: organizer.organizationName,
      email: organizer.email,
      website: organizer.website ?? '',
      status: organizer.status,
    })
  }

  function handleCancel() {
    setForm(emptyForm)
    setEditingId(null)
  }

  function handleDelete(id: number) {
    if (confirm('Esta seguro de eliminar este organizador?')) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) return <div className="status-message">Cargando organizadores...</div>
  if (isError) return <div className="status-message error">Error al cargar organizadores</div>

  return (
    <div className="page-container">
      <h1>Organizadores</h1>

      <div className="form-card">
        <h2>{editingId ? 'Editar Organizador' : 'Nuevo Organizador'}</h2>
        <div className="form-grid">
          <input
            placeholder="Nombre de la organizacion"
            value={form.organizationName}
            onChange={(e) => handleChange('organizationName', e.target.value)}
          />
          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
          <input
            placeholder="Sitio web"
            value={form.website}
            onChange={(e) => handleChange('website', e.target.value)}
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
            <th>Organizacion</th>
            <th>Email</th>
            <th>Website</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.organizationName}</td>
              <td>{o.email}</td>
              <td>{o.website}</td>
              <td>{o.status ? 'Activo' : 'Inactivo'}</td>
              <td>
                <button onClick={() => handleEdit(o)}>Editar</button>
                <button onClick={() => handleDelete(o.id)} className="danger">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}