import { useState, ChangeEvent } from 'react'
import type { Team } from '../types/tournament'
import {
  useCreateResource,
  useDeleteResource,
  useResourceList,
  useUpdateResource,
} from '../hooks'
import { useAuth } from '../context/AuthContext'


const RESOURCE = 'teams'
const USERS_RESOURCE = 'players' 

const emptyForm = {
  teamName: '',
  logoUrl: '',
  status: true,
  captain: 0, // Ahora el capitán es parte del formulario
  members: [] as number[], 
}

export function TeamsPage() {
  const { profile } = useAuth()
  const { data, isLoading, isError } = useResourceList<any>(RESOURCE)
  const { data: users } = useResourceList<any>(USERS_RESOURCE)

  console.log("Jugadores recibidos de Django:", users)

  const createMutation = useCreateResource<Team>(RESOURCE)
  const updateMutation = useUpdateResource<Team>(RESOURCE)
  const deleteMutation = useDeleteResource(RESOURCE)

  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)

  const loggedInUserId = profile?.id || 0
  const isAdmin = profile?.role === 'admin'

  // El usuario puede crear equipos si está logueado.
  // Pero solo puede EDITAR si es Admin o si es el Capitán actual del equipo en edición.
  const canUserCreateOrEdit = !editingId ? !!loggedInUserId : (form.captain === loggedInUserId || isAdmin)

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

    // El capitán elegido en el formulario (o el usuario logueado por defecto si no se seleccionó)
    const finalCaptainId = form.captain || loggedInUserId;

    // Validación de integrantes mínimos (Capitán + al menos 1 miembro asignado, o 2 miembros adicionales)
    // Para asegurar que haya un mínimo de 2 personas en total en el equipo:
    const totalUniqueParticipants = new Set([finalCaptainId, ...form.members]);
    if (totalUniqueParticipants.size < 2) {
      alert("El equipo debe tener un mínimo de 2 integrantes en total (incluyendo al capitán).")
      return
    }

    const payload = {
      teamName: form.teamName,
      logoUrl: form.logoUrl,
      status: form.status,
      captain: finalCaptainId, // Enviamos el capitán designado en el formulario
      members: form.members,
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
          onError: (err: any) => {
            alert("Error al actualizar: " + (err.message || "Error desconocido"))
          },
        }
      )
    } else {
      createMutation.mutate(payload as unknown as Team, {
        onSuccess: () => {
          setForm(emptyForm)
          alert("Equipo creado correctamente.")
        },
        onError: (err: any) => {
          alert("Error al crear equipo: " + (err.message || "Error desconocido"))
        },
      })
    }
  }

  function handleEdit(team: any) {
    setEditingId(team.id)
    
    const currentMemberIds = team.members_detail 
      ? team.members_detail.map((m: any) => m.id) 
      : (team.members || []);

    setForm({
      teamName: team.teamName,
      logoUrl: team.logoUrl || '',
      status: team.status,
      captain: Number(team.captain), // Cargamos el capitán actual en el formulario
      members: currentMemberIds.filter((id: number) => id !== Number(team.captain)), // No duplicar al capitán en los checkboxes
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

      {/* Condición: Solo mostramos el formulario si el usuario tiene permisos para crear/editar */}
      {canUserCreateOrEdit ? (
        <div className="form-card">
          <h2>{editingId ? 'Editar Equipo' : 'Nuevo Equipo'}</h2>
          <div className="form-grid-custom">
            <input
              className="custom-input"
              placeholder="Nombre del equipo"
              value={form.teamName}
              onChange={(e) => handleChange('teamName', e.target.value)}
            />
            
            {/* Contenedor de subida de logo */}
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

          {/* --- SECCIÓN: DESIGNAR AL CAPITÁN --- */}
          <div className="captain-selection-section" style={{ marginTop: '15px' }}>
            <h3>Designar Capitán del Equipo</h3>
            <select
              className="custom-input"
              value={form.captain || loggedInUserId}
              onChange={(e) => handleChange('captain', Number(e.target.value))}
            >
              {/* Opción por defecto (Tú) */}
              <option value={loggedInUserId}>Tú ({profile?.gamertag || 'Mi Perfil'})</option>
              {/* Opciones con el resto de jugadores */}
              {users?.filter((u: any) => u.id !== loggedInUserId && u.id !== 1).map((player: any) => (
                <option key={player.id} value={player.id}>
                  {player.gamertag || `Jugador #${player.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* --- SECCIÓN: SELECCIONAR INTEGRANTES --- */}
          <div className="members-selection-section" style={{ marginTop: '15px' }}>
            <h3>Seleccionar Integrantes Adicionales</h3>
            <div className="members-checkbox-grid">
              {users?.map((player: any) => {
                const currentCaptainId = form.captain || loggedInUserId;
                
                // 1. Evitamos que el capitán seleccionado arriba pueda ser marcado como integrante común
                if (player.id === currentCaptainId) return null;

                // 2. Excluir cuentas admin (ID 1)
                const adminIds = [1];
                if (adminIds.includes(player.id)) return null;

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
              
              {(!users || users.filter((u: any) => u.id !== (form.captain || loggedInUserId) && u.id !== 1).length === 0) && (
                <p className="no-members-text">No hay otros jugadores disponibles en la plataforma.</p>
              )}
            </div>
          </div>

          <div className="form-actions-custom" style={{ marginTop: '20px' }}>
            <button className="primary-btn" onClick={handleSubmit}>{editingId ? 'Actualizar' : 'Crear'}</button>
            {editingId && <button onClick={handleCancel} className="secondary-btn">Cancelar</button>}
          </div>
        </div>
      ) : (
        <div className="form-card text-center text-muted">
          <p>⚠️ Solo los administradores o el capitán de un equipo pueden realizar modificaciones.</p>
        </div>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Equipo</th>
            <th>Capitán</th>
            <th>Integrantes (Plantilla Completa)</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((t: any) => {
            const isCaptainOfThisTeam = loggedInUserId === Number(t.captain);
            const canModify = isCaptainOfThisTeam || isAdmin;

            // COMBINAR CAPITÁN E INTEGRANTES PARA LA LISTA COMPLETA
            const captainObject = t.captain_detail || { id: Number(t.captain), username: `User #${t.captain}` };
            const otherMembers = t.members_detail || [];
            
            // Filtramos duplicados por si acaso el capitán ya está en members_detail
            const fullSquad = [
              { ...captainObject, isCaptain: true },
              ...otherMembers.filter((m: any) => m.id !== captainObject.id)
            ];

            return (
              <tr key={t.id}>
                <td>{t.id}</td>
                
                <td>
                  <div className="team-identity-cell">
                    {t.logoUrl ? (
                      <img 
                        src={t.logoUrl} 
                        alt="Logo" 
                        className="team-table-logo"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          const placeholder = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                          if (placeholder) placeholder.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="team-table-placeholder" 
                      style={t.logoUrl ? { display: 'none' } : {}}
                    >
                      {t.teamName.charAt(0).toUpperCase()}
                    </div>
                    <span className="team-table-name">{t.teamName}</span>
                  </div>
                </td>
                
                <td>
                  <span className="captain-badge">
                     👑 {t.captain_detail ? (t.captain_detail.gamertag || t.captain_detail.username) : `User #${t.captain}`}
                  </span>
                </td>
                
                <td>
                  <ul className="members-inline-list">
                    {fullSquad.map((member: any) => (
                      <li key={member.id} style={member.isCaptain ? { fontWeight: 'bold' } : {}}>
                        👤 {member.gamertag || member.username || `Jugador #${member.id}`} {member.isCaptain && <small>(Capitán)</small>}
                      </li>
                    ))}
                  </ul>
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