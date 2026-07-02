from django.db import models
from .Player import Player
from .Tournament import Tournament

class PlayerTournament(models.Model):
    player = models.ForeignKey(
        Player, 
        on_delete=models.CASCADE, 
        db_column='players_id',
        related_name='tournament_registrations'
    )
    tournament = models.ForeignKey(
        Tournament, 
        on_delete=models.CASCADE, 
        db_column='tournaments_id',
        related_name='player_registrations'
    )
    
    score = models.IntegerField(default=0)
    finalPosition = models.IntegerField(null=True, blank=True)
    status = models.BooleanField(default=True)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'players_tournaments'
        constraints = [
            models.UniqueConstraint(fields=['player', 'tournament'], name='uq_player_tournament')
        ]
        indexes = [
            models.Index(fields=['player'], name='idx_pt_playersId'),
            models.Index(fields=['tournament'], name='idx_pt_tournamentsId'),
            models.Index(fields=['-score'], name='idx_pt_score'),
            models.Index(fields=['finalPosition'], name='idx_pt_finalPosition'),
            models.Index(fields=['status'], name='idx_pt_status'),
        ]

    def __str__(self):
        return f"{self.player.gamertag} en {self.tournament.tournamentTitle}"
    
    def save(self, *args, **kwargs):
        if self.score and self.score < 0:
            self.score = 0  
        self.full_clean()   
        super(PlayerTournament, self).save(*args, **kwargs)