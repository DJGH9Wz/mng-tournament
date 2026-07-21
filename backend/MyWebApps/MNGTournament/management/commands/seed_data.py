from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.db import transaction
from datetime import date, timedelta
from MyWebApps.MNGTournament.models import (
    Organizer, Tournament, Player, Team, TeamMember, Invitation, TeamTournament
)


class Command(BaseCommand):
    help = 'Crea datos de prueba: organizadores, torneos, jugadores, equipos e inscripciones'

    def handle(self, *args, **options):
        PASSWORD = '1234'

        with transaction.atomic():
            self.stdout.write('Creando organizadores...')
            org1, _ = Organizer.objects.get_or_create(
                organizationName='Liga UNSA Gaming',
                defaults={'email': 'liga@unsa.edu.pe', 'website': 'https://unsa.edu.pe', 'status': True}
            )
            org2, _ = Organizer.objects.get_or_create(
                organizationName='Esports Perú',
                defaults={'email': 'contacto@esportspe.pe', 'website': 'https://esportspe.pe', 'status': True}
            )
            org3, _ = Organizer.objects.get_or_create(
                organizationName='Torneos Digitales',
                defaults={'email': 'info@torneosdigitales.pe', 'website': 'https://torneosdigitales.pe', 'status': True}
            )

            self.stdout.write('Creando torneos...')
            today = date.today()
            tournaments_data = [
                ('League of Legends', 'Copa UNSA LoL 2026', 'Skin Raptor 1350 RP', 16, today + timedelta(days=30), org1),
                ('Valorant', 'Cup of Champions', 'Bono Steam S/50', 12, today + timedelta(days=45), org1),
                ('Counter-Strike 2', 'CS2 Arena Open', 'Mousepad Gamer', 8, today + timedelta(days=60), org2),
                ('League of Legends', 'LoL Masters Peru', 'Monitor Gamer 144Hz', 16, today + timedelta(days=90), org3),
            ]
            created_tournaments = []
            for game, title, prize, max_p, event_dt, org in tournaments_data:
                t, _ = Tournament.objects.get_or_create(
                    tournamentTitle=title,
                    defaults={
                        'gameName': game,
                        'virtualPrize': prize,
                        'maxParticipants': max_p,
                        'eventDate': event_dt,
                        'organizer': org,
                        'status': True,
                    }
                )
                created_tournaments.append(t)

            self.stdout.write('Creando jugadores y usuarios...')
            players_data = [
                ('Ronald123', 'ronald@gmail.com', 'Oro'),
                ('SniperX', 'sniperx@gmail.com', 'Platino'),
                ('ShadowKill', 'shadow@gmail.com', 'Diamante'),
                ('FrostByte', 'frost@gmail.com', 'Oro'),
                ('BlazeFire', 'blaze@gmail.com', 'Platina'),
                ('CyberWolf', 'cyber@gmail.com', 'Platino'),
                ('NeonStrike', 'neon@gmail.com', 'Oro'),
                ('GhostRider', 'ghost@gmail.com', 'Diamante'),
                ('StormBlade', 'storm@gmail.com', 'Platina'),
                ('PixelKing', 'pixel@gmail.com', 'Oro'),
            ]
            created_players = []
            for gamertag, email, rank in players_data:
                user, created = User.objects.get_or_create(
                    username=gamertag,
                    defaults={'email': email, 'is_staff': False, 'is_superuser': False}
                )
                if created:
                    user.set_password(PASSWORD)
                    user.save()
                player, _ = Player.objects.get_or_create(
                    user=user,
                    defaults={
                        'gamertag': gamertag,
                        'email': email,
                        'rank': rank,
                        'role': 'player',
                        'status': True,
                    }
                )
                created_players.append((user, player))

            self.stdout.write('Creando equipos...')
            teams_data = [
                ('Team Phoenix', created_players[0][0], [created_players[1][1], created_players[2][1], created_players[3][1]]),
                ('Dark Wolves', created_players[4][0], [created_players[5][1], created_players[6][1], created_players[7][1]]),
                ('Ice Storm', created_players[8][0], [created_players[9][1], created_players[0][1]]),
            ]
            created_teams = []
            for team_name, captain_user, members in teams_data:
                team, _ = Team.objects.get_or_create(
                    teamName=team_name,
                    defaults={
                        'captain': captain_user,
                        'status': True,
                    }
                )
                captain_player = Player.objects.filter(user=captain_user).first()
                if captain_player:
                    captain_player.team = team
                    captain_player.role = 'captain'
                    captain_player.save()
                for member in members:
                    member.team = team
                    member.save()
                    TeamMember.objects.get_or_create(team=team, user=member.user)
                TeamMember.objects.get_or_create(team=team, user=captain_user)
                created_teams.append(team)

            self.stdout.write('Creando inscripciones de equipos en torneos...')
            TeamTournament.objects.get_or_create(
                team=created_teams[0], tournament=created_tournaments[0],
                defaults={'score': 0, 'status': True}
            )
            TeamTournament.objects.get_or_create(
                team=created_teams[1], tournament=created_tournaments[0],
                defaults={'score': 0, 'status': True}
            )
            TeamTournament.objects.get_or_create(
                team=created_teams[0], tournament=created_tournaments[1],
                defaults={'score': 0, 'status': True}
            )

            self.stdout.write('Creando invitaciones de ejemplo...')
            Invitation.objects.get_or_create(
                team=created_teams[2], player=created_players[1][1],
                defaults={'status': 'pending'}
            )

            self.stdout.write(self.style.SUCCESS(
                f'\n¡Datos de prueba creados exitosamente!'
                f'\n  - 3 Organizadores'
                f'\n  - 4 Torneos'
                f'\n  - 10 Jugadores (todos con contraseña: {PASSWORD})'
                f'\n  - 3 Equipos con capitanes y miembros'
                f'\n  - 3 Inscripciones de equipos en torneos'
                f'\n  - 1 Invitación pendiente'
                f'\n'
                f'\nCuentas de jugador (todas con contraseña "{PASSWORD}"):'
            ))
            for user, player in created_players:
                self.stdout.write(f'  - {user.username} ({player.role})')
