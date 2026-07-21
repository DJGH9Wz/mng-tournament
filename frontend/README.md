# Frontend - MNG Tournament

Aplicación web construida con React, TypeScript y Vite.

## Configuración

```bash
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Dependencias

- React 19
- TypeScript 6
- Vite 8
- React Router 7
- TanStack React Query 5

## Estructura

```
frontend/
├── src/
│   ├── App.tsx            Enrutador principal
│   ├── main.tsx           Punto de entrada
│   ├── api/               Llamadas a la API
│   ├── components/        Componentes compartidos (Layout, Login, Register)
│   ├── context/           Estado de autenticación
│   ├── hooks/             Hooks genéricos para CRUD
│   ├── pages/             Páginas de la aplicación
│   └── types/             Interfaces TypeScript
├── package.json
└── vite.config.ts
```

## Páginas

- **Home** - Dashboard con resumen de datos
- **Tournaments** - Gestión de torneos
- **Organizers** - Gestión de organizadores
- **Players** - Gestión de jugadores
- **Teams** - Gestión de equipos
- **MyTeam** - Vista del capitán para gestionar miembros
- **Invitations** - Gestión de invitaciones
- **PlayerTournaments** - Inscripciones a torneos

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | Verificar código con oxlint |
| `npm run preview` | Vista previa del build |
