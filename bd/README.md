# Base de Datos - MNG Tournament

Script SQL para la base de datos PostgreSQL utilizada en el proyecto.

## Archivos

- `bd.sql` - Script completo de creación de tablas, índices, restricciones y claves foráneas.

## Tablas

| Tabla | Descripción |
|-------|-------------|
| `organizers` | Organizadores de torneos |
| `teams` | Equipos de jugadores |
| `players` | Perfiles de jugadores |
| `tournaments` | Torneos de esports |
| `matches` | Partidos entre equipos |
| `invitations` | Invitaciones a equipos |
| `players_tournaments` | Inscripciones individuales |
| `teams_tournaments` | Inscripciones de equipos |
| `team_members` | Miembros de equipos |

## Ejecución

El script `bd.sql` está diseñado para ejecutarse en PostgreSQL (Supabase). Se puede ejecutar desde la consola SQL de Supabase o con cualquier cliente PostgreSQL.
