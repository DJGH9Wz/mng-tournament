"""
URL configuration for MyDjangoProject project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
"""
URL configuration for MyDjangoProject project.
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import ObtainAuthToken  # Importación corregida
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from MyWebApps.MNGTournament import views as tournament_views

from MyWebApps.MNGTournament.views import (
    OrganizerViewSet, TeamViewSet, PlayerViewSet,
    TournamentViewSet, PlayerTournamentViewSet, TeamTournamentViewSet
)

# Definición de CustomAuthToken corregida sin problemas de importación
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

router = DefaultRouter()
router.register(r'organizers', OrganizerViewSet, basename='organizer')
router.register(r'teams', TeamViewSet, basename='team')
router.register(r'players', PlayerViewSet, basename='player')
router.register(r'tournaments', TournamentViewSet, basename='tournament')
router.register(r'player-tournaments', PlayerTournamentViewSet, basename='playertournament')
router.register(r'team-tournaments', TeamTournamentViewSet, basename='team-tournament')

urlpatterns = [
    path('', include(router.urls)),
    path('admin/', admin.site.urls),
    path('api/', include('MyWebApps.MNGTournament.urls')),
    path('api-token-auth/', CustomAuthToken.as_view(), name='api_token_auth'),
    path('api/current-user/', tournament_views.current_user),
    
    # Documentación de la API
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]