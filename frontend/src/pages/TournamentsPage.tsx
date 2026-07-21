import { useState } from 'react'
import type { Tournament, TeamTournament } from '../types/tournament'
import {
  useCreateResource,
  useDeleteResource,
  useResourceList,
  useUpdateResource,
} from '../hooks'
import { useAuth } from '../context/AuthContext'

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

interface TournamentsPageProps {
  isAdmin?: boolean;
}

export function TournamentsPage(_props?: TournamentsPageProps) {
  const { profile } = useAuth();
  const isAdmin = !!profile?.is_staff;
  const isCaptain = profile?.role === 'captain';
  const { data: tournaments, isLoading, isError } = useResourceList<Tournament>(RESOURCE);
  const { data: organizers } = useResourceList<any>('organizers');
  
  // 1. Obtenemos todos los equipos del sistema
  const { data: allTeams } = useResourceList<any>('teams');

  // 2. Recuperamos el ID del usuario logueado (user_id, no player id)
  const loggedInUserId = profile?.user_id || 0;

  // 3. Filtramos los equipos en el frontend para mostrar SOLO aquellos donde el usuario es el Capitán
  const myCaptainedTeams = allTeams?.filter((team: any) => Number(team.captain) === loggedInUserId) || [];

  const createMutation = useCreateResource<Tournament>(RESOURCE)
  const updateMutation = useUpdateResource<Tournament>(RESOURCE)
  const deleteMutation = useDeleteResource(RESOURCE)
  const registerMutation = useCreateResource<TeamTournament>('team-tournaments')

  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  const [selectedTournamentId, setSelectedTournamentId] = useState<number | null>(null)
  const [selectedTeamId, setSelectedTeamId] = useState<number | "">("")

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
    if (confirm('¿Está seguro de eliminar este torneo?')) {
      deleteMutation.mutate(id)
    }
  }

  function handleRegisterTeam() {
    if (!selectedTournamentId || !selectedTeamId) {
      alert("Por favor selecciona un equipo válido.");
      return;
    }

    registerMutation.mutate(
      { team: Number(selectedTeamId), tournament: selectedTournamentId },
      {
        onSuccess: () => {
          alert("¡Equipo inscrito con éxito!");
          setSelectedTournamentId(null);
          setSelectedTeamId("");
        },
        onError: (err: any) => {
          alert(`Error al inscribir: ${err.message || "Verifica si ya estás inscrito o si eres el capitán."}`);
        }
      }
    );
  }

  if (isLoading) return <div className="status-message">Cargando torneos...</div>
  if (isError) return <div className="status-message error">Error al cargar torneos</div>

  return (
    <div className="page-container">
      <h1>Torneos</h1>
      
      {isAdmin && (
        <div className="form-card">
          <h2>{editingId ? 'Editar Torneo' : 'Nuevo Torneo'}</h2>
          <div className="form-grid">
            <input
              placeholder="Nombre del juego"
              value={form.gameName}
              onChange={(e) => handleChange('gameName', e.target.value)}
            />
            <input
              placeholder="Título del torneo"
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
              placeholder="Máximo de participantes"
              value={form.maxParticipants || ''}
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
              className="form-select"
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
      )}

      {/* MODAL DE INSCRIPCIÓN */}
      {selectedTournamentId !== null && (
        <div className="modal-overlay" onClick={() => { setSelectedTournamentId(null); setSelectedTeamId(""); }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>Inscribir Equipo al Torneo</h2>
            <p className="modal-subtitle">
              Torneo #{selectedTournamentId}
            </p>

            {myCaptainedTeams.length > 0 ? (
              <>
                <div className="modal-field">
                  <label>Selecciona tu equipo</label>
                  <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value ? Number(e.target.value) : "")}
                    className="form-select"
                  >
                    <option value="">-- Selecciona uno de tus equipos --</option>
                    {myCaptainedTeams.map((team: any) => (
                      <option key={team.id} value={team.id}>
                        {team.teamName}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedTeamId && (
                  <div className="modal-warning">
                    <p>
                      Al inscribir tu equipo, la plantilla actual se <strong>congelará</strong> para este evento.
                      No podrás modificar integrantes hasta que finalice el torneo.
                    </p>
                  </div>
                )}

                <div className="modal-actions">
                  <button
                    onClick={handleRegisterTeam}
                    disabled={!selectedTeamId || registerMutation.isPending}
                    className="modal-confirm"
                  >
                    {registerMutation.isPending ? 'Inscribiendo...' : 'Confirmar Inscripción'}
                  </button>
                  <button
                    onClick={() => { setSelectedTournamentId(null); setSelectedTeamId(""); }}
                    className="modal-cancel"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <div className="modal-warning">
                <p>
                  No eres capitán de ningún equipo. Solo los capitanes pueden inscribir equipos.
                </p>
                <div className="modal-actions">
                  <button
                    onClick={() => { setSelectedTournamentId(null); setSelectedTeamId(""); }}
                    className="modal-cancel"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Juego</th>
            <th>Título</th>
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
                <div className="admin-actions">
                  {isAdmin ? (
                    <>
                      <button onClick={() => handleEdit(t)}>Editar</button>
                      <button onClick={() => handleDelete(t.id)}>Eliminar</button>
                    </>
                  ) : isCaptain ? (
                    <button 
                      onClick={() => setSelectedTournamentId(t.id)} 
                      className="primary"
                    >
                      Inscribir Equipo
                    </button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}