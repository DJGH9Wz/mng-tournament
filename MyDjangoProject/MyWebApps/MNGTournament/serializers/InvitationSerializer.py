from rest_framework import serializers
from ..models.Invitation import Invitation
from ..models.Team import Team
from ..models.Player import Player


class InvitationSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(source='team.teamName', read_only=True)
    player_gamertag = serializers.CharField(source='player.gamertag', read_only=True)

    class Meta:
        model = Invitation
        fields = ['id', 'team', 'player', 'team_name', 'player_gamertag', 'status', 'created_at']
        read_only_fields = ['status', 'created_at']
