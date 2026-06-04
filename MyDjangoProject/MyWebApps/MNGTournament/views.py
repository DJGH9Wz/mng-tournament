from rest_framework import viewsets
from .models import Organizer, Team, Player, Tournament, PlayerTournament
from .serializers import OrganizerSerializer, TeamSerializer, PlayerSerializer, TournamentSerializer, PlayerTournamentSerializer

class OrganizerViewSet(viewsets.ModelViewSet):
    queryset = Organizer.objects.all()
    serializer_class = OrganizerSerializer

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer

class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer

class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer

class PlayerTournamentViewSet(viewsets.ModelViewSet):
    queryset = PlayerTournament.objects.all()
    serializer_class = PlayerTournamentSerializer
