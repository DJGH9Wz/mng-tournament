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
from .serializers import (
    OrganizerSerializer,
    TeamSerializer,
    PlayerSerializer,
    TournamentSerializer,
    PlayerTournamentSerializer,
    TeamTournamentSerializer
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

class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    permission_classes = [IsAdminOrReadOnly] 

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
        
        # Validar seguridad: El usuario autenticado debe ser el capitán del equipo
        team = serializer.validated_data['team']
        if team.captain != request.user:
            return Response(
                {"detail": "No tienes permiso para inscribir a este equipo. Solo el capitán puede hacerlo."},
                status=status.HTTP_403_FORBIDDEN
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