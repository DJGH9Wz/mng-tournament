from rest_framework import viewsets, status, permissions  
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser, SAFE_METHODS 
from .models.Organizer import Organizer
from .models.Team import Team
from .models.Player import Player
from .models.Tournament import Tournament
from .models.PlayerTournament import PlayerTournament
from .models.TeamTournament import TeamTournament
from .models.TeamMember import TeamMember
from .models.Invitation import Invitation
from .serializers import (
    OrganizerSerializer,
    TeamSerializer,
    PlayerSerializer,
    TournamentSerializer,
    PlayerTournamentSerializer,
    TeamTournamentSerializer,
    InvitationSerializer
)

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

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permiso personalizado:
    - Cualquier usuario (logueado o no) puede leer (GET).
    - Solo administradores (is_staff=True) pueden escribir (POST, PUT, DELETE).
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_staff
    

class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all().order_by('-eventDate')
    serializer_class = TournamentSerializer
    permission_classes = [IsAdminOrReadOnly]

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

class OrganizerViewSet(viewsets.ModelViewSet):
    queryset = Organizer.objects.all()
    serializer_class = OrganizerSerializer
    permission_classes = [IsAdminOrReadOnly] 

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [IsAdminOrReadOnly]

    def _resolve_members(self, raw_member_ids):
        user_ids = []
        for mid in raw_member_ids:
            try:
                player = Player.objects.select_related('user').get(pk=mid)
                if player.user_id:
                    user_ids.append(player.user_id)
            except Player.DoesNotExist:
                pass
        return user_ids

    def create(self, request, *args, **kwargs):
        data = dict(request.data)
        member_ids = data.pop('members', [])
        user_ids = self._resolve_members(member_ids)

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        team = serializer.save()

        for uid in user_ids:
            TeamMember.objects.get_or_create(team=team, user_id=uid)

        return Response(self.get_serializer(team).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        data = dict(request.data)
        member_ids = data.pop('members', None)

        if member_ids is not None and _team_is_locked(instance):
            return Response(
                {'error': 'El equipo está inscrito en un torneo activo. No se pueden modificar integrantes.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        team = serializer.save()

        if member_ids is not None:
            user_ids = self._resolve_members(member_ids)
            TeamMember.objects.filter(team=team).exclude(user_id__in=user_ids).delete()
            for uid in user_ids:
                TeamMember.objects.get_or_create(team=team, user_id=uid)

        return Response(self.get_serializer(team).data)

class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    permission_classes = [IsAdminOrReadOnly]

    # Agrega esta acción dentro de la clase:
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
            results.append({
                'id': p.id,
                'gamertag': p.gamertag,
                'email': p.email,
                'rank': p.rank,
                'team': p.team_id,
                'team_name': p.team.teamName if p.team else None,
            })
        return Response(results)

class PlayerTournamentViewSet(viewsets.ModelViewSet):
    queryset = PlayerTournament.objects.all()
    serializer_class = PlayerTournamentSerializer
    permission_classes = [IsAdminOrReadOnly] 

class TeamTournamentViewSet(viewsets.ModelViewSet):
    queryset = TeamTournament.objects.filter(status=True)
    serializer_class = TeamTournamentSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        team = serializer.validated_data['team']
        tournament = serializer.validated_data['tournament']

        if team.captain != request.user:
            return Response(
                {"detail": "No tienes permiso para inscribir a este equipo. Solo el capitán puede hacerlo."},
                status=status.HTTP_403_FORBIDDEN
            )

        member_count = TeamMember.objects.filter(team=team).count()
        if member_count < 2:
            return Response(
                {"detail": f"El equipo debe tener al menos 2 integrantes para inscribirse. Actualmente tiene {member_count}."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_destroy(self, instance):
        # En lugar de eliminar físicamente el registro del torneo, hacemos borrado lógico
        instance.status = False
        instance.save()

class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username,
            'is_admin': user.is_staff 
        })


def _team_is_locked(team):
    return TeamTournament.objects.filter(team=team, status=True).exists()


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

    # Convertimos el usuario logueado en su perfil de Player para comparar capitán con capitán
    try:
        request_player = Player.objects.get(user=request.user)
    except Player.DoesNotExist:
        return Response({'error': 'No tienes un perfil de jugador activo.'}, status=status.HTTP_403_FORBIDDEN)

    # Comparamos objetos del mismo tipo (Player con Player)
    if team.captain != request_player:
        return Response({'error': f'Solo el capitán del equipo ({team.captain}) puede enviar invitaciones.'}, status=status.HTTP_403_FORBIDDEN)

    if _team_is_locked(team):
        return Response({'error': 'El equipo está inscrito en un torneo activo. No se pueden modificar integrantes.'}, status=status.HTTP_400_BAD_REQUEST)

    if player.user:
        already_in_team = TeamMember.objects.filter(
            user=player.user, 
            team__status=True
        ).exists()
        if already_in_team:
            return Response({'error': 'El jugador ya pertenece a otro equipo activo.'}, status=status.HTTP_400_BAD_REQUEST)

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
        invitation.status = 'accepted'
        invitation.save()
        if player.user_id:
            TeamMember.objects.get_or_create(team=invitation.team, user_id=player.user_id)
        return Response({'message': 'Invitación aceptada. Ahora eres miembro del equipo.'})

    elif action == 'reject':
        invitation.status = 'rejected'
        invitation.save()
        return Response({'message': 'Invitación rechazada.'})

    return Response({'error': 'Acción inválida. Usa "accept" o "reject".'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def my_profile(request):
    # Intentamos obtener el perfil; si no existe (cuenta de admin antigua), lo creamos de forma segura
    player, created = Player.objects.get_or_create(
        user=request.user,
        defaults={
            'gamertag': request.user.username,
            'email': request.user.email or f"{request.user.username}@temp.com",
            'status': True,
            'role': 'admin' if request.user.is_staff or request.user.is_superuser else 'player'
        }
    )
    
    return Response({
        'id': player.id,
        'gamertag': player.gamertag,
        'email': player.email,
        'rank': player.rank,
        'role': player.role,
        'team': player.team_id,
        'team_name': player.team.teamName if player.team else None,
        'status': player.status,
    })

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def search_players(request):
    # Soporta tanto ?q= como ?search= para evitar desajustes con el frontend
    q = request.query_params.get('q', '').strip()
    if not q:
        q = request.query_params.get('search', '').strip()

    if not q:
        return Response([], status=status.HTTP_200_OK)
        
    # Busca a los jugadores por gamertag que estén activos
    players = Player.objects.select_related('user', 'team').filter(
        gamertag__icontains=q, status=True
    )[:20]
    
    results = []
    for p in players:
        results.append({
            'id': p.id,
            'gamertag': p.gamertag,
            'email': p.email,
            'rank': p.rank,
            'team': p.team_id,
            'team_name': p.team.teamName if p.team else None,
        })
    return Response(results)