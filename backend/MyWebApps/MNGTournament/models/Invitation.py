from django.db import models
from .Team import Team
from .Player import Player


class Invitation(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('accepted', 'Aceptada'),
        ('rejected', 'Rechazada'),
    ]

    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='invitations')
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='invitations')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'invitations'
        unique_together = ('team', 'player')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.team.teamName} → {self.player.gamertag} ({self.status})"
