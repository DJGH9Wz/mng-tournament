from rest_framework import serializers
from .models import Organizer, Team, Player, Tournament, PlayerTournament

class OrganizerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organizer
        fields = '__all__'

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = '__all__'

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = '__all__'

class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = '__all__'

class PlayerTournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlayerTournament
        fields = '__all__'
