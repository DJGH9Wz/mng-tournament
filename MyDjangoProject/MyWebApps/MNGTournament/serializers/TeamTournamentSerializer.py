from rest_framework import serializers
from MyWebApps.MNGTournament.models.TeamTournament import TeamTournament

class TeamTournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamTournament
        fields = [
            'id', 
            'team', 
            'tournament', 
            'score', 
            'finalPosition', 
            'status', 
            'created', 
            'modified'
        ]
        read_only_fields = ['id', 'score', 'finalPosition', 'status', 'created', 'modified']

    def validate(self, data):
        team = data['team']
        tournament = data['tournament']

        # 1. Validar que el equipo no esté ya inscrito en este torneo
        if TeamTournament.objects.filter(team=team, tournament=tournament, status=True).exists():
            raise serializers.ValidationError("Este equipo ya está inscrito en este torneo.")

        # 2. Validar que el torneo no esté lleno
        # (Asumiendo que tu modelo Tournament tiene un campo maxTeams o similar)
        current_registrations = TeamTournament.objects.filter(tournament=tournament, status=True).count()
        if hasattr(tournament, 'maxTeams') and tournament.maxTeams:
            if current_registrations >= tournament.maxTeams:
                raise serializers.ValidationError("El torneo ya ha alcanzado el límite máximo de equipos.")

        return data