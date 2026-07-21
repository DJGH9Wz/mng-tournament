from rest_framework import serializers
from ..models.Player import Player
from .PlayerTournamentSerializer import PlayerTournamentSerializer

class PlayerDetailSerializer(serializers.ModelSerializer):
    tournaments = serializers.SerializerMethodField()

    class Meta:
        model = Player
        fields = '__all__'

    def get_tournaments(self, obj):
        return PlayerTournamentSerializer(
            obj.tournament_registrations.all(), many=True
        ).data