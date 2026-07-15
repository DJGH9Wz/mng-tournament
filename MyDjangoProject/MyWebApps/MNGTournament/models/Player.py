from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

from .Team import Team

class Player(models.Model):
    
    ROLE_CHOICES = [
        ('admin', 'Administrador'),
        ('captain', 'Capitán'),
        ('player', 'Jugador'),
    ]

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
    role = models.CharField(max_length=15, choices=ROLE_CHOICES, default='player')
    
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

@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    # Si el usuario se acaba de crear o no tiene perfil asociado, se le crea uno
    if created or not hasattr(instance, 'player_profile'):
        role_default = 'admin' if instance.is_staff or instance.is_superuser else 'player'
        Player.objects.get_or_create(
            user=instance,
            defaults={
                'gamertag': instance.username,
                'email': instance.email or f"{instance.username}@temp.com",
                'role': role_default
            }
        )