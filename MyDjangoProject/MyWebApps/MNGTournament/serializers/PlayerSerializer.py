from rest_framework import serializers
from ..models.Player import Player
from .TeamSerializer import TeamSerializer

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ['id', 'gamertag', 'email', 'rank', 'status', 'role', 'team']