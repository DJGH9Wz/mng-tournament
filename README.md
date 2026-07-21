# MNG Tournament

Sistema de gestión de torneos de esports desarrollado como proyecto del curso de Desarrollo de Aplicaciones Web (DAW).

## Estructura del Proyecto

```
├── backend/        API REST con Django y Django REST Framework
├── bd/             Script SQL de la base de datos PostgreSQL
├── frontend/       Aplicación web con React, TypeScript y Vite
└── README.md       Este archivo
```

## Tecnologías

- **Backend:** Python 3.10, Django 5.2, Django REST Framework, drf-spectacular
- **Frontend:** React 19, TypeScript 6, Vite 8, TanStack React Query
- **Base de datos:** PostgreSQL (Supabase)

## Inicio Rápido

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

La API estará disponible en `http://127.0.0.1:8000/api/docs/`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Endpoints Principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/tournaments/` | Listar torneos |
| GET | `/api/teams/` | Listar equipos |
| GET | `/api/players/` | Listar jugadores |
| GET | `/api/organizers/` | Listar organizadores |
| POST | `/api/login/` | Iniciar sesión |
| POST | `/api/register/` | Registrar usuario |

## Funcionalidades

- Gestión de torneos (CRUD)
- Gestión de equipos con sistema de capitanes
- Inscripción de equipos e individuales a torneos
- Sistema de invitaciones a equipos
- Autenticación por token con roles (admin, capitán, jugador)
- Documentación interactiva de la API (Swagger)
