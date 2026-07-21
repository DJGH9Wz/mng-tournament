from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models.Team import Team
from ..models.Player import Player
from ..models.TeamMember import TeamMember
from ..models.Invitation import Invitation
from ..serializers import InvitationSerializer


@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def send_invitation(request):
    team_id = request.data.get('team')
    player_id = request.data.get('player')

    if not team_id or not player_id:
        return Response({'error': 'Faltan parámetros (team o player).'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        team = Team.objects.get(pk=team_id)
    except Team.DoesNotExist:
        return Response({'error': 'Equipo no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

    try:
        player = Player.objects.get(pk=player_id)
    except Player.DoesNotExist:
        return Response({'error': 'Jugador no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

    # El capitán del equipo en tu modelo apunta directamente a User.
    # Permitimos el acceso si es el capitán real O si el usuario logueado es administrador (is_staff).
    if team.captain != request.user and not request.user.is_staff:
        return Response({
            'error': f'Solo el capitán de este equipo ({team.captain.username}) puede enviar invitaciones.'
        }, status=status.HTTP_403_FORBIDDEN)

    # Validamos si el jugador a invitar ya pertenece a un equipo activo
    if player.user:
        captain_of = Team.objects.filter(captain=player.user, status=True).first()
        member_of = TeamMember.objects.filter(
            user=player.user, 
            team__status=True
        ).exclude(team=team).first()
        if captain_of or member_of:
            nombre_equipo = captain_of.teamName if captain_of else member_of.team.teamName
            return Response(
                {'error': f'El jugador ya pertenece al equipo "{nombre_equipo}".'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    invitation, created = Invitation.objects.get_or_create(team=team, player=player)
    if not created:
        if invitation.status == 'accepted':
            return Response({'error': 'Esta invitación ya fue aceptada.'}, status=status.HTTP_400_BAD_REQUEST)
        if invitation.status == 'pending':
            return Response({'error': 'Ya existe una invitación pendiente para este jugador.'}, status=status.HTTP_400_BAD_REQUEST)
        invitation.status = 'pending'
        invitation.save()

    return Response(InvitationSerializer(invitation).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def list_my_invitations(request):
    player = Player.objects.filter(user=request.user).first()
    if not player:
        return Response([], status=status.HTTP_200_OK)

    invitations = Invitation.objects.filter(player=player, status='pending').select_related('team')
    return Response(InvitationSerializer(invitations, many=True).data)


@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def respond_invitation(request, pk):
    try:
        invitation = Invitation.objects.select_related('team', 'player').get(pk=pk)
    except Invitation.DoesNotExist:
        return Response({'error': 'Invitación no encontrada.'}, status=status.HTTP_404_NOT_FOUND)

    player = Player.objects.filter(user=request.user).first()
    if not player or invitation.player_id != player.id:
        return Response({'error': 'No tienes permiso para responder esta invitación.'}, status=status.HTTP_403_FORBIDDEN)

    if invitation.status != 'pending':
        return Response({'error': 'Esta invitación ya fue respondida.'}, status=status.HTTP_400_BAD_REQUEST)

    action = request.data.get('action')
    if action == 'accept':
        # Verificar que el jugador no tenga ya un equipo
        if player.user:
            already_in_team = TeamMember.objects.filter(
                user=player.user, team__status=True
            ).exists()
            if already_in_team:
                return Response(
                    {'error': 'Ya perteneces a un equipo. Sal de tu equipo actual primero para aceptar esta invitación.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        invitation.status = 'accepted'
        invitation.save()
        if player.user_id:
            TeamMember.objects.get_or_create(team=invitation.team, user_id=player.user_id)

        # Rechazar automáticamente todas las demás invitaciones pendientes
        Invitation.objects.filter(
            player=player, status='pending'
        ).exclude(pk=invitation.pk).update(status='rejected')

        return Response({'message': 'Invitación aceptada. Ahora eres miembro del equipo.'})

    elif action == 'reject':
        invitation.status = 'rejected'
        invitation.save()
        return Response({'message': 'Invitación rechazada.'})

    return Response({'error': 'Acción inválida. Usa "accept" o "reject".'}, status=status.HTTP_400_BAD_REQUEST)
