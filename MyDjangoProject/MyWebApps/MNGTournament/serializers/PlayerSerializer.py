from rest_framework import serializers
from ..models.Player import Player
# 1. Importamos el serializador que queremos meter aquí dentro
from .TeamSerializer import TeamSerializer

class PlayerSerializer(serializers.ModelSerializer):
    # 2. CREAMOS EL CAMPO EXPANDIDO:
    # 'source' apunta al atributo del modelo Player (self.team)
    # Usamos el TeamSerializer para que lo traduzca por completo, no solo el ID
    team_detail = TeamSerializer(source='team', read_only=True)

    class Meta:
        model = Player
        # 3. Listamos los campos agregando nuestra versión expandida 'team_detail'
        fields = [
            'id', 
            'gamertag', 
            'email', 
            'rank', 
            'status', 
            'team',          
            'team_detail'    
        ]