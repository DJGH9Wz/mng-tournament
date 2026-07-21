from rest_framework import serializers
from ..models.Player import Player
from ..models.Team import Team


class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ['id', 'gamertag', 'email', 'rank', 'status', 'role', 'team']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.user and Team.objects.filter(captain=instance.user).exists():
            data['role'] = 'captain'
        elif instance.role == 'captain':
            data['role'] = 'player'
        else:
            data['role'] = instance.role
        return data
