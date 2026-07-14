from django.db import models
from django.contrib.auth.models import User
from .Team import Team

class Player(models.Model):
    
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='player_profile'
    )
    
    gamertag = models.CharField(max_length=50, unique=True)
    email = models.EmailField(max_length=100, unique=True)
    rank = models.CharField(max_length=50, null=True, blank=True)
    
    team = models.ForeignKey(
        Team, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        db_column='teams_id',
        related_name='players'
    )
    
    status = models.BooleanField(default=True)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'players'
        ordering = ['gamertag']
        indexes = [
            models.Index(fields=['team'], name='idx_pla_teamsId'),
            models.Index(fields=['status'], name='idx_pla_status'),
        ]

    def __str__(self):
        return self.gamertag
    
    def save(self, *args, **kwargs):
        if self.gamertag:
            self.gamertag = self.gamertag.strip()
        if self.email:
            self.email = self.email.strip().lower()  
        self.full_clean()                                            
        super(Player, self).save(*args, **kwargs)