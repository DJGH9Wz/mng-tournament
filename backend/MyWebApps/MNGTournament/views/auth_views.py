from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models.Team import Team
from ..models.Player import Player


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user
    return Response({
        'username': user.username,
        'email': user.email,
        'is_staff': user.is_staff,
    })


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def my_profile(request):
    player, created = Player.objects.get_or_create(
        user=request.user,
        defaults={
            'gamertag': request.user.username,
            'email': request.user.email or f"{request.user.username}@temp.com",
            'status': True,
            'role': 'player'
        }
    )

    captain_team = Team.objects.filter(captain=request.user).first()

    if captain_team:
        effective_role = 'captain'
        if player.team_id != captain_team.id:
            player.team = captain_team
            player.save(update_fields=['team'])
    else:
        effective_role = 'player'

    return Response({
        'id': player.id,
        'user_id': request.user.id,
        'gamertag': player.gamertag,
        'email': player.email,
        'rank': player.rank,
        'role': effective_role,
        'is_staff': request.user.is_staff or request.user.is_superuser,
        'team': player.team_id,
        'team_name': player.team.teamName if player.team else None,
        'status': player.status,
    })
