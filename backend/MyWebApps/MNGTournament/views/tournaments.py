from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .permissions import IsAdminOrReadOnly
from ..models.Tournament import Tournament
from ..models.PlayerTournament import PlayerTournament
from ..models.Player import Player


class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all().order_by('-eventDate')
    serializer_class = 'TournamentSerializer'
    permission_classes = [IsAdminOrReadOnly]

    def get_serializer_class(self):
        from ..serializers import TournamentSerializer
        return TournamentSerializer

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def register_me(self, request, pk=None):
        """
        Permite al usuario logueado inscribirse al torneo actual con un solo clic.
        """
        tournament = self.get_object()
        user = request.user

        
        current_participants = PlayerTournament.objects.filter(tournament=tournament).count()
        if current_participants >= tournament.maxParticipants:
            return Response(
                {'error': 'El torneo ha alcanzado el límite máximo de participantes.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        
        player, created = Player.objects.get_or_create(
            user=user,
            defaults={
                'gamertag': user.username,
                'email': user.email,
                'status': True
            }
        )

        
        if PlayerTournament.objects.filter(player=player, tournament=tournament).exists():
            return Response(
                {'error': 'Ya te encuentras inscrito en este torneo.'},
                status=status.HTTP_400_BAD_REQUEST
            )

       
        PlayerTournament.objects.create(
            player=player,
            tournament=tournament,
            score=0,
            status=True
        )

        return Response(
            {'message': 'Te has inscrito exitosamente en el torneo.'},
            status=status.HTTP_201_CREATED
        )
