const API_BASE_URL = 'http://localhost:8000/api';

// Utilidad centralizada para manejar las respuestas y errores
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let body: any = null;
    try {
      body = await response.json();
    } catch {
      // La respuesta no era JSON
    }
    const message = body?.error || body?.detail || `Error en la petición: ${response.status} ${response.statusText}`;
    throw new Error(message);
  }
  if (response.status === 204) {
    return undefined as unknown as T;
  }
  return response.json() as Promise<T>;
}

// Genera las cabeceras inyectando el Token guardado por App.tsx
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token'); 
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Token ${token}` } : {})
  };
}

// --- Peticiones de la API ---

export async function getList<T>(resource: string): Promise<T[]> {
  const response = await fetch(`${API_BASE_URL}/${resource}/`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return handleResponse<T[]>(response);
}

export async function getOne<T>(resource: string, id: number): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/${resource}/${id}/`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return handleResponse<T>(response);
}

export async function createOne<T>(resource: string, data: Partial<T>): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/${resource}/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse<T>(response);
}

export async function updateOne<T>(resource: string, id: number, data: Partial<T>): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/${resource}/${id}/`, {
    method: 'PUT', // Puedes cambiarlo a 'PATCH' si tu backend lo prefiere
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse<T>(response);
}

export async function deleteOne(resource: string, id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${resource}/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse<void>(response);
}

export async function searchPlayers(q: string) {
  const response = await fetch(`${API_BASE_URL}/players/search/?q=${encodeURIComponent(q)}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return handleResponse<{ id: number; gamertag: string; email: string; rank: string | null; team: number | null; team_name: string | null }[]>(response);
}

export async function sendInvitation(team: number, player: number) {
  const response = await fetch(`${API_BASE_URL}/invitations/send/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ team, player })
  });
  return handleResponse<any>(response);
}

export async function getMyInvitations() {
  const response = await fetch(`${API_BASE_URL}/invitations/mine/`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return handleResponse<any[]>(response);
}

export async function respondInvitation(id: number, action: 'accept' | 'reject') {
  const response = await fetch(`${API_BASE_URL}/invitations/${id}/respond/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ action })
  });
  return handleResponse<any>(response);
}

export async function removeTeamMember(teamId: number, userId: number) {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/remove-member/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ user_id: userId })
  });
  return handleResponse<any>(response);
}

export async function getTeamMembers(teamId: number) {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/members/`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return handleResponse<{ user_id: number; username: string; gamertag: string; email: string; rank: string | null; is_captain: boolean }[]>(response);
}