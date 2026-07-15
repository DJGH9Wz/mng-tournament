import { useState, ChangeEvent } from 'react'
import type { Team } from '../types/tournament'
import {
  useCreateResource,
  useDeleteResource,
  useResourceList,
  useUpdateResource,
} from '../hooks/useResource'

const RESOURCE = 'teams'
// CAMBIO CLAVE: Cambiamos 'users' a 'players' porque así está registrado en el router de Django
const USERS_RESOURCE = 'players' 

const emptyForm = {
  teamName: '',
  logoUrl: '',
  status: true,
  members: [] as number[], // Guardará los IDs de los integrantes seleccionados
}

export function TeamsPage() {
  const { data, isLoading, isError } = useResourceList<any>(RESOURCE)
  // Cargamos todos los usuarios/jugadores (players) para poder seleccionarlos
  const { data: users } = useResourceList<any>(USERS_RESOURCE)

  console.log("Jugadores recibidos de Django:", users)

  const createMutation = useCreateResource<Team>(RESOURCE)
  const updateMutation = useUpdateResource<Team>(RESOURCE)
  const deleteMutation = useDeleteResource(RESOURCE)

  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)

  const loggedInUserId = Number(localStorage.getItem('userId'))
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  function handleChange(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        handleChange('logoUrl', reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Maneja la selección/deselección de integrantes
  function handleMemberToggle(userId: number) {
    const isSelected = form.members.includes(userId);
    if (isSelected) {
      handleChange('members', form.members.filter(id => id !== userId));
    } else {
      handleChange('members', [...form.members, userId]);
    }
  }

  function handleSubmit() {
    if (!loggedInUserId) {
      alert("Debes iniciar sesión para realizar esta acción.")
      return
    }

    // NUEVA VALIDACIÓN: Obligar a registrar un mínimo de 2 integrantes seleccionados
    if (form.members.length < 2) {
      alert("Debes seleccionar un mínimo de 2 integrantes para poder crear o actualizar el equipo.")
      return
    }

    const payload = {
      ...form,
      captain: loggedInUserId,
    }

    if (editingId) {
      updateMutation.mutate(
        { id: editingId, data: payload as unknown as Team },
        {
          onSuccess: () => {
            setForm(emptyForm)
            setEditingId(null)
            alert("Equipo actualizado correctamente.")
          },
        }
      )
    } else {
      createMutation.mutate(payload as unknown as Team, {
        onSuccess: () => {
          setForm(emptyForm)
          alert("Equipo creado correctamente.");
        },
      })
    }
  }

  function handleEdit(team: any) {
    setEditingId(team.id)
    // Extraemos los IDs de los miembros actuales si vienen detallados en la respuesta
    const currentMemberIds = team.members_detail 
      ? team.members_detail.map((m: any) => m.id) 
      : (team.members || []);

    setForm({
      teamName: team.teamName,
      logoUrl: team.logoUrl || '',
      status: team.status,
      members: currentMemberIds,
    })
  }

  function handleCancel() {
    setForm(emptyForm)
    setEditingId(null)
  }

  function handleDelete(id: number) {
    if (confirm('¿Está seguro de eliminar este equipo?')) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) return <div className="status-message">Cargando equipos...</div>
  if (isError) return <div className="status-message error">Error al cargar equipos</div>

  return (
    <div className="page-container animate-fade-in">
      <h1>Equipos</h1>

      <div className="form-card">
        <h2>{editingId ? 'Editar Equipo' : 'Nuevo Equipo'}</h2>
        <div className="form-grid-custom">
          <input
            className="custom-input"
            placeholder="Nombre del equipo"
            value={form.teamName}
            onChange={(e) => handleChange('teamName', e.target.value)}
          />
          
          {/* Contenedor de subida de logo estilizado */}
          <div className="logo-upload-wrapper">
            <label className="file-upload-btn">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="file-input-hidden" 
              />
              <span className="file-upload-icon-text">📁 Seleccionar Logo</span>
            </label>
            
            {form.logoUrl && (
              <div className="preview-container">
                <img src={form.logoUrl} alt="Preview" className="logo-preview-img" />
                <button type="button" className="remove-logo" onClick={() => handleChange('logoUrl', '')}>×</button>
              </div>
            )}
          </div>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.status}
              onChange={(e) => handleChange('status', e.target.checked)}
            />
            Activo
          </label>
        </div>

        {/* --- SECCIÓN: SELECCIONAR INTEGRANTES --- */}
        <div className="members-selection-section">
          <h3>Seleccionar Integrantes del Equipo (Mínimo 2)</h3>
          <div className="members-checkbox-grid">
            {users?.map((player: any) => {
              // 1. Evitamos que el capitán actual se agregue a sí mismo como integrante
              if (player.id === loggedInUserId) return null;

              // 2. Filtro temporal en Frontend: Excluir cuentas de administrador conocidas por su ID o gamertag
              // (Por ejemplo, tu usuario Admin 'DjinsValdivia' con ID 1)
              const adminIds = [1]; // Agrega aquí otros IDs de administradores si los hay
              if (adminIds.includes(player.id)) return null;

              // 3. CORRECCIÓN DE NOMBRE: Leemos la propiedad 'gamertag' que vimos en consola
              const usernameDisplay = player.gamertag || `Jugador #${player.id}`;

              return (
                <label key={player.id} className="member-checkbox-card">
                  <input
                    type="checkbox"
                    checked={form.members.includes(player.id)}
                    onChange={() => handleMemberToggle(player.id)}
                  />
                  <span>👤 {usernameDisplay}</span>
                </label>
              );
            })}
            
            {/* Validar si quedan jugadores válidos para mostrar */}
            {(!users || users.filter((u: any) => u.id !== loggedInUserId && u.id !== 1).length === 0) && (
              <p className="no-members-text">No hay otros jugadores disponibles en la plataforma.</p>
            )}
          </div>
        </div>

        <div className="form-actions-custom">
          <button className="primary-btn" onClick={handleSubmit}>{editingId ? 'Actualizar' : 'Crear'}</button>
          {editingId && <button onClick={handleCancel} className="secondary-btn">Cancelar</button>}
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Equipo</th>
            <th>Capitán</th>
            <th>Integrantes</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((t: any) => {
            const canModify = (loggedInUserId === Number(t.captain)) || isAdmin;

            return (
              <tr key={t.id}>
                <td>{t.id}</td>
                
                <td>
                  <div className="team-identity-cell">
                    {t.logoUrl ? (
                      <img src={t.logoUrl} alt="Logo" className="team-table-logo" />
                    ) : (
                      <div className="team-table-placeholder">
                        {t.teamName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="team-table-name">{t.teamName}</span>
                  </div>
                </td>
                
                <td>
                  <span className="captain-badge">
                    👑 {t.captain_detail ? t.captain_detail.username : `User #${t.captain}`}
                  </span>
                </td>
                
                <td>
                  {t.members_detail && t.members_detail.length > 0 ? (
                    <ul className="members-inline-list">
                      {t.members_detail.map((member: any) => (
                        // Cambiado a member.gamertag
                        <li key={member.id}>👤 {member.gamertag || `Jugador #${member.id}`}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="no-members">Sin integrantes</span>
                  )}
                </td>
                
                <td>
                  <span className={`status-badge ${t.status ? 'active' : 'inactive'}`}>
                    {t.status ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                
                <td>
                  {canModify ? (
                    <div className="actions-cell">
                      <button className="edit-btn" onClick={() => handleEdit(t)}>Editar</button>
                      <button className="delete-btn" onClick={() => handleDelete(t.id)}>Eliminar</button>
                    </div>
                  ) : (
                    <span className="readonly-text">Solo Lectura</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  )
}