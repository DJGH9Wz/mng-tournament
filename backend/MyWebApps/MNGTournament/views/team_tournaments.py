from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models.TeamTournament import TeamTournament
from ..models.TeamMember import TeamMember
from ..serializers import TeamTournamentSerializer


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
