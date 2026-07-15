const API_BASE_URL = 'http://localhost:8000/api';

// Utilidad centralizada para manejar las respuestas y errores
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
  }
  if (response.status === 204) {
    
    return undefined as unknown as T;
  }
  return response.json() as Promise<T>;
}

// Genera las cabeceras inyectando el Token guardado por App.tsx
function getAuthHeaders(): HeadersInit {
  // Usamos 'token' para coincidir exactamente con lo guardado en tu App.tsx
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