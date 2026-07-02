from rest_framework import viewsets
from rest_framework.permissions import AllowAny  # Exigencia de la rúbrica
from .models.Organizer import Organizer
from .models.Team import Team
from .models.Player import Player
from .models.Tournament import Tournament
from .models.PlayerTournament import PlayerTournament

# Importamos las clases directamente desde el paquete local 'serializers'
from .serializers import (
    OrganizerSerializer,
    TeamSerializer,
    PlayerSerializer,
    TournamentSerializer,
    PlayerTournamentSerializer
)

class OrganizerViewSet(viewsets.ModelViewSet):
    queryset = Organizer.objects.all()
    serializer_class = OrganizerSerializer
    permission_classes = [AllowAny]

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [AllowAny]

class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    permission_classes = [AllowAny]

class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all()
    permission_classes = [AllowAny]
    
    # 🌟 Elegimos dinámicamente qué serializador usar para cumplir con el JSON Anidado (Item 3)
    def get_serializer_class(self):
        if self.action == 'retrieve': # Cuando se consulta un torneo específico por su ID
            return TournamentDetailSerializer
        return TournamentSerializer # Para los POST, PUT y GET generales

class PlayerTournamentViewSet(viewsets.ModelViewSet):
    queryset = PlayerTournament.objects.all()
    serializer_class = PlayerTournamentSerializer
    permission_classes = [AllowAny]

