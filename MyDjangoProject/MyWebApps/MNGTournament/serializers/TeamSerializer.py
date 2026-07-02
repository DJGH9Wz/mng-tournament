from rest_framework import serializers
from ..models.Team import Team

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = '__all__'