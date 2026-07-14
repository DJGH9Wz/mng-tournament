from django.urls import path, include
from rest_framework.routers import DefaultRouter
from MyWebApps.MNGTournament.views import (
    OrganizerViewSet, TeamViewSet, PlayerViewSet, TournamentViewSet, PlayerTournamentViewSet
)
from MyWebApps.MNGTournament.auth_views import CustomAuthToken, RegisterView, UserProfileView

router = DefaultRouter()
router.register(r'organizers', OrganizerViewSet)
router.register(r'teams', TeamViewSet)
router.register(r'players', PlayerViewSet)
router.register(r'tournaments', TournamentViewSet)
router.register(r'player-tournaments', PlayerTournamentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', CustomAuthToken.as_view(), name='api_login'),
    path('register/', RegisterView.as_view(), name='api_register'), 
    path('profile/', UserProfileView.as_view(), name='api_profile'), 
]