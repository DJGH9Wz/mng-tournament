from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .permissions import IsAdminOrReadOnly
from ..models.Player import Player
from ..models.Team import Team
from ..models.TeamMember import TeamMember
from ..serializers import PlayerSerializer


def _get_effective_team(player):
    if not player.user:
        return None
    captain_team = Team.objects.filter(captain=player.user, status=True).first()
    if captain_team:
        return captain_team
    membership = TeamMember.objects.filter(user=player.user, team__status=True).first()
    if membership:
        return membership.team
    return player.team


class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    permission_classes = [IsAdminOrReadOnly]

    def update(self, request, *args, **kwargs):
        result = self._validate_captain_role(request, *args, **kwargs)
        if result is not None:
            return result
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        result = self._validate_captain_role(request, *args, **kwargs)
        if result is not None:
            return result
        return super().partial_update(request, *args, **kwargs)

    def _validate_captain_role(self, request, *args, **kwargs):
        new_role = request.data.get('role')
        if new_role == 'captain':
            player_id = kwargs.get('pk')
            try:
                player = Player.objects.get(pk=player_id)
            except Player.DoesNotExist:
                return Response({'error': 'Jugador no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
            if player.user:
                already = Team.objects.filter(captain=player.user, status=True).exists()
                if already:
                    return Response(
                        {'error': 'Este jugador ya es capitán de un equipo. Solo puede ser capitán de un equipo a la vez.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
        return None

    @action(detail=False, methods=['get'], url_path='search', permission_classes=[IsAuthenticated])
    def search_players_action(self, request):
        q = request.query_params.get('q', '').strip()
        if not q:
            q = request.query_params.get('search', '').strip()

        if not q:
            return Response([], status=status.HTTP_200_OK)
            
        players = Player.objects.select_related('user', 'team').filter(
            gamertag__icontains=q, status=True
        )[:20]
        
        results = []
        for p in players:
            effective_team = _get_effective_team(p)
            results.append({
                'id': p.id,
                'gamertag': p.gamertag,
                'email': p.email,
                'rank': p.rank,
                'team': effective_team.id if effective_team else None,
                'team_name': effective_team.teamName if effective_team else None,
            })
        return Response(results)


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def search_players(request):
    q = request.query_params.get('q', '').strip()
    if not q:
        q = request.query_params.get('search', '').strip()

    if not q:
        return Response([], status=status.HTTP_200_OK)
        
    players = Player.objects.select_related('user', 'team').filter(
        gamertag__icontains=q, status=True
    )[:20]
    
    results = []
    for p in players:
        effective_team = _get_effective_team(p)
        results.append({
            'id': p.id,
            'gamertag': p.gamertag,
            'email': p.email,
            'rank': p.rank,
            'team': effective_team.id if effective_team else None,
            'team_name': effective_team.teamName if effective_team else None,
        })
    return Response(results)
