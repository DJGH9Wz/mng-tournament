export interface Organizer {
  id: number
  organizationName: string
  email: string
  website?: string | null;
  status: boolean
  created?: string | null;
  modified?: string
}

export interface Team {
  id: number
  teamName: string
  logoUrl: string
  status: boolean
  created?: string
  modified?: string
}

export interface Player {
  id: number
  gamertag: string
  email: string
  rank: string
  status: boolean
  team: number
  team_detail?: Team;
  created?: string
  modified?: string
}

export interface Tournament {
  id: number
  gameName: string
  tournamentTitle: string
  virtualPrize: string
  maxParticipants: number
  eventDate: string
  status: boolean
  organizer: number
  organizer_detail?: Organizer;
  created?: string
  modified?: string
}

export interface PlayerTournament {
  id: number
  score: number
  finalPosition: number
  status: boolean
  player: number
  tournament: number
  player_detail?: Player;
  tournament_detail?: Tournament;
  created?: string
  modified?: string
}