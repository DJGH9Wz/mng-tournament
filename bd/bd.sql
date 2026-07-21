-- ============================================================
-- MNG Tournament - Script de Base de Datos (PostgreSQL)
-- Generado a partir de los modelos Django
-- Base de datos: Supabase PostgreSQL
-- ============================================================

-- ============================================================
-- TABLA: organizers
-- Organizadores de torneos
-- ============================================================
CREATE TABLE IF NOT EXISTS organizers (
    id              BIGSERIAL PRIMARY KEY,
    organizationName VARCHAR(150) NOT NULL UNIQUE,
    email           VARCHAR(100) NOT NULL UNIQUE,
    website         VARCHAR(255) UNIQUE,
    status          BOOLEAN NOT NULL DEFAULT TRUE,
    created         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    modified        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_status ON organizers(status);

COMMENT ON TABLE organizers IS 'Organizadores de torneos de esports';

-- ============================================================
-- TABLA: teams
-- Equipos de jugadores
-- ============================================================
CREATE TABLE IF NOT EXISTS teams (
    id              BIGSERIAL PRIMARY KEY,
    teamName        VARCHAR(100) NOT NULL UNIQUE,
    logoUrl         TEXT,
    captain_id      BIGINT NOT NULL,
    inviteCode      VARCHAR(6) DEFAULT '',
    status          BOOLEAN NOT NULL DEFAULT TRUE,
    created         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    modified        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tea_status ON teams(status);
CREATE INDEX IF NOT EXISTS idx_tea_invite_code ON teams(inviteCode);

COMMENT ON TABLE teams IS 'Equipos participantes en torneos';

-- ============================================================
-- TABLA: players
-- Perfiles de jugadores vinculados a usuarios Django
-- ============================================================
CREATE TABLE IF NOT EXISTS players (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT UNIQUE,
    gamertag        VARCHAR(50) NOT NULL UNIQUE,
    email           VARCHAR(100) NOT NULL UNIQUE,
    rank            VARCHAR(50),
    role            VARCHAR(15) NOT NULL DEFAULT 'player'
                    CHECK (role IN ('admin', 'captain', 'player')),
    teams_id        BIGINT,
    status          BOOLEAN NOT NULL DEFAULT TRUE,
    created         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    modified        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pla_teamsId ON players(teams_id);
CREATE INDEX IF NOT EXISTS idx_pla_status ON players(status);

COMMENT ON TABLE players IS 'Perfiles de jugadores con gamertag y rol';

-- ============================================================
-- TABLA: tournaments
-- Torneos disponibles
-- ============================================================
CREATE TABLE IF NOT EXISTS tournaments (
    id                  BIGSERIAL PRIMARY KEY,
    organizers_id       BIGINT NOT NULL,
    gameName            VARCHAR(100) NOT NULL,
    tournamentTitle     VARCHAR(150) NOT NULL,
    virtualPrize        VARCHAR(100),
    maxParticipants     INTEGER NOT NULL DEFAULT 2 CHECK (maxParticipants >= 2),
    eventDate           DATE NOT NULL,
    status              BOOLEAN NOT NULL DEFAULT TRUE,
    created             TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    modified            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tou_organizersId ON tournaments(organizers_id);
CREATE INDEX IF NOT EXISTS idx_tou_eventDate ON tournaments(eventDate);
CREATE INDEX IF NOT EXISTS idx_tou_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tou_gameName ON tournaments(gameName);

COMMENT ON TABLE tournaments IS 'Torneos de esports con fecha y premio virtual';

-- ============================================================
-- TABLA: matches
-- Partidos entre equipos dentro de un torneo
-- ============================================================
CREATE TABLE IF NOT EXISTS matches (
    id              BIGSERIAL PRIMARY KEY,
    tournaments_id  BIGINT NOT NULL,
    team1_id        BIGINT,
    team2_id        BIGINT,
    score_team1     INTEGER NOT NULL DEFAULT 0,
    score_team2     INTEGER NOT NULL DEFAULT 0,
    winner_team_id  BIGINT,
    round_number    INTEGER NOT NULL DEFAULT 1,
    match_date      TIMESTAMP WITH TIME ZONE,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE'
                    CHECK (status IN ('PENDIENTE', 'EN_CURSO', 'FINALIZADO')),
    created         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    modified        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE matches IS 'Partidos/encuentros entre equipos en un torneo';

-- ============================================================
-- TABLA: invitations
-- Invitaciones de equipos a jugadores
-- ============================================================
CREATE TABLE IF NOT EXISTS invitations (
    id              BIGSERIAL PRIMARY KEY,
    team_id         BIGINT NOT NULL,
    player_id       BIGINT NOT NULL,
    status          VARCHAR(10) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (team_id, player_id)
);

COMMENT ON TABLE invitations IS 'Invitaciones pendientes de equipos a jugadores';

-- ============================================================
-- TABLA: players_tournaments
-- Inscripciones individuales de jugadores en torneos
-- ============================================================
CREATE TABLE IF NOT EXISTS players_tournaments (
    id              BIGSERIAL PRIMARY KEY,
    players_id      BIGINT NOT NULL,
    tournaments_id  BIGINT NOT NULL,
    score           INTEGER NOT NULL DEFAULT 0,
    finalPosition   INTEGER,
    status          BOOLEAN NOT NULL DEFAULT TRUE,
    created         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    modified        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_player_tournament UNIQUE (players_id, tournaments_id)
);

CREATE INDEX IF NOT EXISTS idx_pt_playersId ON players_tournaments(players_id);
CREATE INDEX IF NOT EXISTS idx_pt_tournamentsId ON players_tournaments(tournaments_id);
CREATE INDEX IF NOT EXISTS idx_pt_score ON players_tournaments(score DESC);
CREATE INDEX IF NOT EXISTS idx_pt_finalPosition ON players_tournaments(finalPosition);
CREATE INDEX IF NOT EXISTS idx_pt_status ON players_tournaments(status);

COMMENT ON TABLE players_tournaments IS 'Registro de participacion individual de jugadores en torneos';

-- ============================================================
-- TABLA: teams_tournaments
-- Inscripciones de equipos en torneos
-- ============================================================
CREATE TABLE IF NOT EXISTS teams_tournaments (
    id              BIGSERIAL PRIMARY KEY,
    teams_id        BIGINT NOT NULL,
    tournaments_id  BIGINT NOT NULL,
    score           INTEGER NOT NULL DEFAULT 0,
    finalPosition   INTEGER,
    status          BOOLEAN NOT NULL DEFAULT TRUE,
    created         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    modified        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_team_tournament UNIQUE (teams_id, tournaments_id)
);

CREATE INDEX IF NOT EXISTS idx_tt_teamsId ON teams_tournaments(teams_id);
CREATE INDEX IF NOT EXISTS idx_tt_tournamentsId ON teams_tournaments(tournaments_id);
CREATE INDEX IF NOT EXISTS idx_tt_score ON teams_tournaments(score DESC);
CREATE INDEX IF NOT EXISTS idx_tt_finalPosition ON teams_tournaments(finalPosition);
CREATE INDEX IF NOT EXISTS idx_tt_status ON teams_tournaments(status);

COMMENT ON TABLE teams_tournaments IS 'Registro de participacion de equipos en torneos';

-- ============================================================
-- TABLA: team_members
-- Relacion many-to-many entre usuarios y equipos
-- ============================================================
CREATE TABLE IF NOT EXISTS team_members (
    id          BIGSERIAL PRIMARY KEY,
    team_id     BIGINT NOT NULL,
    user_id     BIGINT NOT NULL,
    joined_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (team_id, user_id)
);

COMMENT ON TABLE team_members IS 'Miembros de cada equipo (usuarios Django)';

-- ============================================================
-- FOREIGN KEYS
-- ============================================================

-- teams -> auth_user (captain)
ALTER TABLE teams
    ADD CONSTRAINT fk_teams_captain
    FOREIGN KEY (captain_id) REFERENCES auth_user(id)
    ON DELETE CASCADE;

-- players -> auth_user
ALTER TABLE players
    ADD CONSTRAINT fk_players_user
    FOREIGN KEY (user_id) REFERENCES auth_user(id)
    ON DELETE CASCADE;

-- players -> teams
ALTER TABLE players
    ADD CONSTRAINT fk_players_team
    FOREIGN KEY (teams_id) REFERENCES teams(id)
    ON DELETE SET NULL;

-- tournaments -> organizers
ALTER TABLE tournaments
    ADD CONSTRAINT fk_tournaments_organizer
    FOREIGN KEY (organizers_id) REFERENCES organizers(id)
    ON DELETE RESTRICT;

-- matches -> tournaments
ALTER TABLE matches
    ADD CONSTRAINT fk_matches_tournament
    FOREIGN KEY (tournaments_id) REFERENCES tournaments(id)
    ON DELETE CASCADE;

-- matches -> teams (team1, team2, winner)
ALTER TABLE matches
    ADD CONSTRAINT fk_matches_team1
    FOREIGN KEY (team1_id) REFERENCES teams(id)
    ON DELETE SET NULL;

ALTER TABLE matches
    ADD CONSTRAINT fk_matches_team2
    FOREIGN KEY (team2_id) REFERENCES teams(id)
    ON DELETE SET NULL;

ALTER TABLE matches
    ADD CONSTRAINT fk_matches_winner
    FOREIGN KEY (winner_team_id) REFERENCES teams(id)
    ON DELETE SET NULL;

-- invitations -> teams
ALTER TABLE invitations
    ADD CONSTRAINT fk_invitations_team
    FOREIGN KEY (team_id) REFERENCES teams(id)
    ON DELETE CASCADE;

-- invitations -> players
ALTER TABLE invitations
    ADD CONSTRAINT fk_invitations_player
    FOREIGN KEY (player_id) REFERENCES players(id)
    ON DELETE CASCADE;

-- players_tournaments -> players
ALTER TABLE players_tournaments
    ADD CONSTRAINT fk_pt_player
    FOREIGN KEY (players_id) REFERENCES players(id)
    ON DELETE CASCADE;

-- players_tournaments -> tournaments
ALTER TABLE players_tournaments
    ADD CONSTRAINT fk_pt_tournament
    FOREIGN KEY (tournaments_id) REFERENCES tournaments(id)
    ON DELETE CASCADE;

-- teams_tournaments -> teams
ALTER TABLE teams_tournaments
    ADD CONSTRAINT fk_tt_team
    FOREIGN KEY (teams_id) REFERENCES teams(id)
    ON DELETE CASCADE;

-- teams_tournaments -> tournaments
ALTER TABLE teams_tournaments
    ADD CONSTRAINT fk_tt_tournament
    FOREIGN KEY (tournaments_id) REFERENCES tournaments(id)
    ON DELETE CASCADE;

-- team_members -> teams
ALTER TABLE team_members
    ADD CONSTRAINT fk_tm_team
    FOREIGN KEY (team_id) REFERENCES teams(id)
    ON DELETE CASCADE;

-- team_members -> auth_user
ALTER TABLE team_members
    ADD CONSTRAINT fk_tm_user
    FOREIGN KEY (user_id) REFERENCES auth_user(id)
    ON DELETE CASCADE;

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
