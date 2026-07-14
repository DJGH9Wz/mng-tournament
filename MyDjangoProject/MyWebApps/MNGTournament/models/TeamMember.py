from django.db import models
from django.contrib.auth.models import User
from MyWebApps.MNGTournament.models.Team import Team

class TeamMember(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='team_memberships')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Evita que un mismo usuario se una más de una vez al mismo equipo
        unique_together = ('team', 'user') 

    def __str__(self):
        return f"{self.user.username} en {self.team.teamName}"