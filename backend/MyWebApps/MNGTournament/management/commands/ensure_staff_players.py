from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from MyWebApps.MNGTournament.models import Player


class Command(BaseCommand):
    help = 'Crea registros Player para todos los usuarios staff que no tengan uno'

    def handle(self, *args, **options):
        created = 0
        for user in User.objects.filter(is_staff=True):
            player, was_created = Player.objects.get_or_create(
                user=user,
                defaults={
                    'gamertag': user.username,
                    'email': f'{user.username}@admin.com',
                    'status': True,
                    'role': 'player',
                }
            )
            if was_created:
                created += 1
                self.stdout.write(self.style.SUCCESS(f'Player creado para: {user.username} (id:{user.id})'))
            else:
                self.stdout.write(f'Ya existe Player para: {user.username} (id:{user.id})')

        self.stdout.write(self.style.SUCCESS(f'\nTotal: {created} registros creados'))
