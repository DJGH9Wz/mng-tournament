from rest_framework import serializers
from MyWebApps.MNGTournament.models.Team import Team
from django.contrib.auth.models import User

# Importamos directamente el modelo TeamMember
# (Asegúrate de que la ruta de importación coincida con tu estructura)
try:
    from MyWebApps.MNGTournament.models.TeamMember import TeamMember
except ImportError:
    from MyWebApps.MNGTournament.models import TeamMember

# Serializer simple para detallar los datos del usuario
class UserMinSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class TeamSerializer(serializers.ModelSerializer):
    captain_detail = UserMinSerializer(source='captain', read_only=True)
    members_detail = serializers.SerializerMethodField()

    class Meta:
        model = Team
        fields = ['id', 'teamName', 'captain', 'captain_detail', 'members_detail', 'status']

    def get_members_detail(self, obj):
        try:
            # Consultamos directamente la tabla TeamMember filtrando por el equipo actual
            memberships = TeamMember.objects.filter(team=obj).select_related('user')
            # Extraemos los objetos de usuario de cada membresía
            users = [member.user for member in memberships]
            return UserMinSerializer(users, many=True).data
        except Exception as e:
            # Si ocurre cualquier problema, imprimimos el error en consola y retornamos vacío
            # para que la aplicación frontend NO se caiga con error 500
            print("Error al obtener integrantes en el serializador:", e)
            return []