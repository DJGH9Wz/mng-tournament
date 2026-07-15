from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TournamentViewSet, OrganizerViewSet, TeamViewSet, 
    PlayerViewSet, PlayerTournamentViewSet, TeamTournamentViewSet,
    send_invitation, list_my_invitations, respond_invitation, 
    my_profile, search_players  # Importa tu función corregida aquí
)
from MyWebApps.MNGTournament.auth_views import CustomAuthToken, RegisterView, UserProfileView

router = DefaultRouter()
router.register(r'tournaments', TournamentViewSet)
router.register(r'organizers', OrganizerViewSet)
router.register(r'teams', TeamViewSet)
router.register(r'players', PlayerViewSet)
router.register(r'player-tournaments', PlayerTournamentViewSet)
router.register(r'team-tournaments', TeamTournamentViewSet)
urlpatterns = [
    path('', include(router.urls)),
    path('login/', CustomAuthToken.as_view(), name='api_login'),
    path('register/', RegisterView.as_view(), name='api_register'), 
    path('profile/', UserProfileView.as_view(), name='api_profile'),
    path('invitations/send/', send_invitation, name='api_invitation_send'),
    path('invitations/mine/', list_my_invitations, name='api_invitation_mine'),
    path('invitations/<int:pk>/respond/', respond_invitation, name='api_invitation_respond'),
    path('api/players/search/', search_players, name='search_players'),
    path('my-profile/', my_profile, name='api_my_profile'),
    path('players/search/', search_players, name='search_players'),
    path('invitations/send/', send_invitation, name='send_invitation'),
    path('invitations/my/', list_my_invitations, name='list_my_invitations'),
    path('invitations/<int:pk>/respond/', respond_invitation, name='respond_invitation'),
    path('my-profile/', my_profile, name='my_profile'),
]