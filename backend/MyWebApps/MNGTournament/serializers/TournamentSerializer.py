from rest_framework import serializers
from ..models.Tournament import Tournament
from .OrganizerSerializer import OrganizerSerializer

class TournamentSerializer(serializers.ModelSerializer):
    # Declaramos el campo expandido que invoca al serializador de organizadores
    organizer_detail = OrganizerSerializer(source='organizer', read_only=True)

    class Meta:
        model = Tournament
        fields = [
            'id', 
            'gameName', 
            'tournamentTitle', 
            'virtualPrize', 
            'maxParticipants', 
            'eventDate', 
            'status', 
            'organizer',         
            'organizer_detail'   
        ]