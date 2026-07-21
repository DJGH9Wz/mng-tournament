from rest_framework import serializers
from MyWebApps.MNGTournament.models.Team import Team
from MyWebApps.MNGTournament.models.Player import Player
from django.contrib.auth.models import User

try:
    from MyWebApps.MNGTournament.models.TeamMember import TeamMember
except ImportError:
    from MyWebApps.MNGTournament.models import TeamMember


class UserMinSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class TeamMemberSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    email = serializers.CharField()
    gamertag = serializers.CharField(default=None)


class TeamSerializer(serializers.ModelSerializer):
    captain_detail = UserMinSerializer(source='captain', read_only=True)
    members_detail = serializers.SerializerMethodField()

    class Meta:
        model = Team
        fields = ['id', 'teamName', 'logoUrl', 'captain', 'captain_detail', 'members_detail', 'inviteCode', 'status']

    def get_members_detail(self, obj):
        try:
            memberships = TeamMember.objects.filter(team=obj).select_related('user')
            result = []
            user_ids = [m.user_id for m in memberships]
            players = Player.objects.filter(user_id__in=user_ids).select_related('user')
            player_map = {p.user_id: p.gamertag for p in players}

            for membership in memberships:
                user = membership.user
                result.append({
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'gamertag': player_map.get(user.id, user.username),
                })
            return result
        except Exception as e:
            print("Error al obtener integrantes:", e)
            return []