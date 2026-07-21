from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Count
from MyWebApps.MNGTournament.models import (
    Team, TeamMember, Invitation
)


class Command(BaseCommand):
    help = 'Elimina equipos duplicados donde el capitan ya tiene otro equipo'

    def handle(self, *args, **options):
        fixes = 0

        with transaction.atomic():
            users_with_multiple_teams = (
                User.objects.filter(captained_teams__isnull=False)
                .annotate(team_count=Count('captained_teams'))
                .filter(team_count__gt=1)
            )

            if not users_with_multiple_teams.exists():
                self.stdout.write(self.style.SUCCESS('No hay capitanes con multiples equipos.'))
                return

            for user in users_with_multiple_teams:
                teams = Team.objects.filter(captain=user).order_by('id')
                team_info = [(t, t.members.count()) for t in teams]
                self.stdout.write(self.style.WARNING(
                    f'\n{user.username} es capitan de {len(team_info)} equipos:'
                ))
                for team, members in team_info:
                    self.stdout.write(f'  - {team.teamName} (ID:{team.id}) | {members} miembros')

                teams_sorted = sorted(team_info, key=lambda x: (-x[1], x[0].id))
                keep_team = teams_sorted[0][0]
                self.stdout.write(self.style.SUCCESS(
                    f'  => Manteniendo: {keep_team.teamName}'
                ))

                for team, members in teams_sorted[1:]:
                    self.stdout.write(self.style.WARNING(
                        f'  => Eliminando: {team.teamName} ({members} miembros)'
                    ))
                    Invitation.objects.filter(team=team).delete()
                    TeamMember.objects.filter(team=team).delete()
                    team.delete()
                    fixes += 1
                    self.stdout.write(self.style.WARNING(
                        f'    Equipo {team.teamName} eliminado.'
                    ))

            orphan_teams = Team.objects.filter(captain__isnull=True)
            for team in orphan_teams:
                self.stdout.write(self.style.WARNING(
                    f'  Equipo huerfano sin capitan: {team.teamName} (ID:{team.id}), eliminando...'
                ))
                Invitation.objects.filter(team=team).delete()
                TeamMember.objects.filter(team=team).delete()
                team.delete()
                fixes += 1

        self.stdout.write(self.style.SUCCESS(
            f'\n=== COMPLETADO === {fixes} equipos eliminados'
        ))
