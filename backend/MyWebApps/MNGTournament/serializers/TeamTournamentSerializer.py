from rest_framework import serializers
from MyWebApps.MNGTournament.models.TeamTournament import TeamTournament
from MyWebApps.MNGTournament.models.Team import Team
from MyWebApps.MNGTournament.models.Tournament import Tournament


class TeamMinSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['id', 'teamName']


class TournamentMinSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = ['id', 'tournamentTitle', 'gameName']


class TeamTournamentSerializer(serializers.ModelSerializer):
    team_detail = TeamMinSerializer(source='team', read_only=True)
    tournament_detail = TournamentMinSerializer(source='tournament', read_only=True)

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
            'modified',
            'team_detail',
            'tournament_detail',
        ]
        read_only_fields = ['id', 'score', 'finalPosition', 'status', 'created', 'modified']

    def validate(self, data):
        team = data['team']
        tournament = data['tournament']

        if TeamTournament.objects.filter(team=team, tournament=tournament, status=True).exists():
            raise serializers.ValidationError("Este equipo ya está inscrito en este torneo.")

        current_registrations = TeamTournament.objects.filter(tournament=tournament, status=True).count()
        if hasattr(tournament, 'maxTeams') and tournament.maxTeams:
            if current_registrations >= tournament.maxTeams:
                raise serializers.ValidationError("El torneo ya ha alcanzado el límite máximo de equipos.")

        return data
