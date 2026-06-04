from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    OrganizerViewSet, TeamViewSet, PlayerViewSet,
    TournamentViewSet, PlayerTournamentViewSet
)

router = DefaultRouter()
router.register(r'organizers', OrganizerViewSet)
router.register(r'teams', TeamViewSet)
router.register(r'players', PlayerViewSet)
router.register(r'tournaments', TournamentViewSet)
router.register(r'player-tournaments', PlayerTournamentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
