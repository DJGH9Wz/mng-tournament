from django.contrib import admin
from MyWebApps.MNGTournament.models.Organizer import Organizer
from MyWebApps.MNGTournament.models.Team import Team
from MyWebApps.MNGTournament.models.Player import Player
from MyWebApps.MNGTournament.models.Tournament import Tournament
from MyWebApps.MNGTournament.models.PlayerTournament import PlayerTournament

# Registro de tus modelos en el panel de administración
admin.site.register(Organizer)
admin.site.register(Team)
admin.site.register(Player)
admin.site.register(Tournament)
admin.site.register(PlayerTournament)