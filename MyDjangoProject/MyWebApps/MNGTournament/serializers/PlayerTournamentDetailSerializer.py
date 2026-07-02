from rest_framework import serializers
from ..models.PlayerTournament import PlayerTournament
from .PlayerSerializer import PlayerSerializer
from .TournamentSerializer import TournamentSerializer

class PlayerTournamentDetailSerializer(serializers.ModelSerializer):
    player = PlayerSerializer(read_only=True)
    tournament = TournamentSerializer(read_only=True)

    class Meta:
        model = PlayerTournament
        fields = '__all__'