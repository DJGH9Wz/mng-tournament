from rest_framework import viewsets

from .permissions import IsAdminOrReadOnly
from ..models.PlayerTournament import PlayerTournament
from ..serializers import PlayerTournamentSerializer


class PlayerTournamentViewSet(viewsets.ModelViewSet):
    queryset = PlayerTournament.objects.all()
    serializer_class = PlayerTournamentSerializer
    permission_classes = [IsAdminOrReadOnly]
