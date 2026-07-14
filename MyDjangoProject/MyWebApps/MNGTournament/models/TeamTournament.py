from django.db import models
from .Team import Team
from .Tournament import Tournament

class TeamTournament(models.Model):
    team = models.ForeignKey(
        Team, 
        on_delete=models.CASCADE, 
        db_column='teams_id',
        related_name='tournament_registrations'
    )
    tournament = models.ForeignKey(
        Tournament, 
        on_delete=models.CASCADE, 
        db_column='tournaments_id',
        related_name='team_registrations'
    )
    
    score = models.IntegerField(default=0)
    finalPosition = models.IntegerField(null=True, blank=True)
    status = models.BooleanField(default=True)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'teams_tournaments'
        constraints = [
            # Un equipo solo se puede inscribir una vez por torneo
            models.UniqueConstraint(fields=['team', 'tournament'], name='uq_team_tournament')
        ]
        indexes = [
            models.Index(fields=['team'], name='idx_tt_teamsId'),
            models.Index(fields=['tournament'], name='idx_tt_tournamentsId'),
            models.Index(fields=['-score'], name='idx_tt_score'),
            models.Index(fields=['finalPosition'], name='idx_tt_finalPosition'),
            models.Index(fields=['status'], name='idx_tt_status'),
        ]

    def __str__(self):
        return f"{self.team.teamName} en {self.tournament.tournamentTitle}"
    
    def save(self, *args, **kwargs):
        if self.score and self.score < 0:
            self.score = 0  
        self.full_clean()   
        super(TeamTournament, self).save(*args, **kwargs)