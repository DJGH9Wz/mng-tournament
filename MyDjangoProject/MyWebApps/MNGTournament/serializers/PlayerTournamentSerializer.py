from rest_framework import serializers
from ..models.PlayerTournament import PlayerTournament
# Importamos los traductores de las tablas relacionadas
from .PlayerSerializer import PlayerSerializer
from .TournamentSerializer import TournamentSerializer

class PlayerTournamentSerializer(serializers.ModelSerializer):
    # Expandimos el jugador (que ya trae su equipo dentro)
    player_detail = PlayerSerializer(source='player', read_only=True)
    # Expandimos el torneo
    tournament_detail = TournamentSerializer(source='tournament', read_only=True)

    class Meta:
        model = PlayerTournament
        fields = [
            'id', 
            'score', 
            'finalPosition', 
            'status', 
            'player', 
            'tournament',
            'player_detail',      
            'tournament_detail'  
        ]