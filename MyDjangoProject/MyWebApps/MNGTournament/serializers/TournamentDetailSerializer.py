from rest_framework import serializers
from ..models.Tournament import Tournament
from .OrganizerSerializer import OrganizerSerializer

class TournamentDetailSerializer(serializers.ModelSerializer):
    # Expandimos el objeto completo del organizador para las lecturas (GET)
    organizer = OrganizerSerializer(read_only=True)

    class Meta:
        model = Tournament
        fields = '__all__' # Trae todos los campos del torneo + el objeto organizador expandido