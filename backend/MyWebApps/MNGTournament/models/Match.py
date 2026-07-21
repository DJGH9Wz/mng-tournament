from django.db import models
from .Tournament import Tournament
from .Team import Team
from .Player import Player

class Match(models.Model):
    STATUS_CHOICES = [
        ('PENDIENTE', 'Pendiente'),
        ('EN_CURSO', 'En Curso'),
        ('FINALIZADO', 'Finalizado'),
    ]

    tournament = models.ForeignKey(
        Tournament, 
        on_delete=models.CASCADE, 
        related_name='matches',
        db_column='tournaments_id'
    )
    
    # Soporta enfrentamientos de equipos o individuales
    team1 = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True, related_name='matches_as_team1')
    team2 = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True, related_name='matches_as_team2')
    
    score_team1 = models.IntegerField(default=0)
    score_team2 = models.IntegerField(default=0)
    
    winner_team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True, related_name='matches_won')
    
    round_number = models.IntegerField(default=1)  # Ejemplo: 1 (Octavos), 2 (Cuartos), 3 (Semifinal), 4 (Final)
    match_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDIENTE')
    
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'matches'
        ordering = ['round_number', 'match_date']

    def __str__(self):
        t1 = self.team1.teamName if self.team1 else "TBD"
        t2 = self.team2.teamName if self.team2 else "TBD"
        return f"Ronda {self.round_number}: {t1} vs {t2} - {self.tournament.tournamentTitle}"