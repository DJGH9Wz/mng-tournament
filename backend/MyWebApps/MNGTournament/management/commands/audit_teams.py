from django.core.management.base import BaseCommand
from django.db import transaction
from MyWebApps.MNGTournament.models import (
    Player, Team, TeamMember, Invitation
)


class Command(BaseCommand):
    help = 'Audita y corrige todas las inconsistencias entre jugadores, equipos y capitanes'

    def handle(self, *args, **options):
        fixes = 0

        with transaction.atomic():
            self.stdout.write(self.style.WARNING('=== AUDITORIA COMPLETA ===\n'))

            # 1. Revisar equipos y sus capitanes
            self.stdout.write(self.style.WARNING('--- Equipos y Capitanes ---'))
            teams = Team.objects.select_related('captain').all()
            for team in teams:
                captain_player = Player.objects.filter(user=team.captain).first()
                self.stdout.write(
                    f'  Equipo: {team.teamName} (ID:{team.id}) | '
                    f'Capitan: {team.captain.username} (user_id:{team.captain_id}) | '
                    f'Captain Player.role: {captain_player.role if captain_player else "N/A"} | '
                    f'Captain Player.team: {captain_player.team_id if captain_player else "N/A"}'
                )
                if captain_player and captain_player.team_id != team.id:
                    self.stdout.write(self.style.WARNING(
                        f'    [FIX] Captain Player.team era {captain_player.team_id}, '
                        f'corrigiendo a {team.id}'
                    ))
                    captain_player.team = team
                    captain_player.save(update_fields=['team'])
                    fixes += 1
                if captain_player and captain_player.role != 'captain':
                    self.stdout.write(self.style.WARNING(
                        f'    [FIX] Captain Player.role era {captain_player.role}, '
                        f'corrigiendo a captain'
                    ))
                    captain_player.role = 'captain'
                    captain_player.save(update_fields=['role'])
                    fixes += 1

            # 2. Revisar todos los jugadores
            self.stdout.write(self.style.WARNING('\n--- Todos los Jugadores ---'))
            players = Player.objects.select_related('user', 'team').all()
            for p in players:
                is_captain_of = Team.objects.filter(captain=p.user).first()
                team_memberships = TeamMember.objects.filter(user=p.user).select_related('team')
                member_of_teams = [tm.team for tm in team_memberships]

                status_str = (
                    f'  {p.gamertag} (ID:{p.id}) | '
                    f'role: {p.role} | '
                    f'Player.team_id: {p.team_id} | '
                    f'Capitan de: {is_captain_of.teamName if is_captain_of else "Ninguno"} | '
                    f'Miembro de: {[t.teamName for t in member_of_teams] or "Ninguno"}'
                )
                self.stdout.write(status_str)

                # Fix 1: Si es capitan de un equipo, Player.team debe apuntar a ese equipo
                if is_captain_of and p.team_id != is_captain_of.id:
                    self.stdout.write(self.style.WARNING(
                        f'    [FIX] Player.team era {p.team_id}, '
                        f'corrigiendo a {is_captain_of.id} ({is_captain_of.teamName})'
                    ))
                    p.team = is_captain_of
                    p.save(update_fields=['team'])
                    fixes += 1

                # Fix 2: Si es capitan, role debe ser 'captain'
                if is_captain_of and p.role != 'captain':
                    self.stdout.write(self.style.WARNING(
                        f'    [FIX] Player.role era {p.role}, corrigiendo a captain'
                    ))
                    p.role = 'captain'
                    p.save(update_fields=['role'])
                    fixes += 1

                # Fix 3: Si NO es capitan de ningun equipo y tiene role='captain', corregir
                if not is_captain_of and p.role == 'captain':
                    self.stdout.write(self.style.WARNING(
                        f'    [FIX] Player.role era captain pero no es capitan de ningun '
                        f'equipo, corrigiendo a player'
                    ))
                    p.role = 'player'
                    p.save(update_fields=['role'])
                    fixes += 1

                # Fix 4: Si es miembro de un equipo via TeamMember pero Player.team es None o diferente
                if member_of_teams:
                    correct_team = is_captain_of if is_captain_of else member_of_teams[0]
                    if p.team_id != correct_team.id:
                        self.stdout.write(self.style.WARNING(
                            f'    [FIX] Player.team era {p.team_id} pero esta en '
                            f'TeamMember de {correct_team.teamName}, corrigiendo'
                        ))
                        p.team = correct_team
                        p.save(update_fields=['team'])
                        fixes += 1

                # Fix 5: Si esta en multiples TeamMember, limpiar (solo puede estar en 1)
                if len(member_of_teams) > 1:
                    self.stdout.write(self.style.ERROR(
                        f'    [FIX] Esta en {len(member_of_teams)} equipos via '
                        f'TeamMember! Manteniendo solo {member_of_teams[0].teamName}'
                    ))
                    for tm in member_of_teams[1:]:
                        TeamMember.objects.filter(user=p.user, team=tm).delete()
                    fixes += 1

            # 3. Revisar TeamMember huérfanos (user no existe o team no existe)
            self.stdout.write(self.style.WARNING('\n--- TeamMember huerfanos ---'))
            orphan_members = TeamMember.objects.filter(
                team__isnull=True
            ) | TeamMember.objects.filter(user__isnull=True)
            if orphan_members.exists():
                count = orphan_members.count()
                orphan_members.delete()
                self.stdout.write(self.style.WARNING(
                    f'    [FIX] Eliminados {count} TeamMember huerfanos'
                ))
                fixes += count
            else:
                self.stdout.write('  Ninguno encontrado.')

            # 4. Verificar que cada equipo tenga exactamente 1 capitan
            self.stdout.write(self.style.WARNING(
                '\n--- Verificacion final: 1 capitan por equipo ---'
            ))
            for team in teams:
                captain = Team.objects.filter(id=team.id).select_related('captain').first()
                if captain:
                    cap_count = 1  # FK solo permite 1
                    self.stdout.write(
                        f'  {team.teamName}: {cap_count} capitan '
                        f'({captain.captain.username})'
                    )

            # 5. Resumen de invitaciones pendientes
            self.stdout.write(self.style.WARNING('\n--- Invitaciones pendientes ---'))
            pending = Invitation.objects.filter(status='pending').select_related('team', 'player')
            for inv in pending:
                self.stdout.write(
                    f'  {inv.team.teamName} -> {inv.player.gamertag} '
                    f'(creada: {inv.created_at})'
                )

        self.stdout.write(self.style.SUCCESS(
            f'\n=== AUDITORIA COMPLETADA === '
            f'{fixes} correcciones realizadas'
        ))
