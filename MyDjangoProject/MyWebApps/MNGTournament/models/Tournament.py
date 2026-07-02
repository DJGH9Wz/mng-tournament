from django.db import models
from django.core.exceptions import ValidationError  
from django.core.validators import MinValueValidator 
from datetime import date                          
from .Organizer import Organizer

def validate_future_date(value):
    if value < date.today():
        raise ValidationError('La fecha del torneo no puede estar en el pasado.')

class Tournament(models.Model):
    organizer = models.ForeignKey(
        Organizer, 
        on_delete=models.RESTRICT, 
        db_column='organizers_id',
        related_name='tournaments'
    )
    
    gameName = models.CharField(max_length=100)
    tournamentTitle = models.CharField(max_length=150)
    virtualPrize = models.CharField(max_length=100, null=True, blank=True)
    maxParticipants = models.IntegerField(default=2, validators=[MinValueValidator(2)])
    
    # Apuntamos directamente a la función con nombre de la raíz
    eventDate = models.DateField(validators=[validate_future_date])
    
    status = models.BooleanField(default=True)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
  
    class Meta:
        db_table = 'tournaments'
        ordering = ['-eventDate', 'tournamentTitle']
        indexes = [
            models.Index(fields=['organizer'], name='idx_tou_organizersId'),
            models.Index(fields=['eventDate'], name='idx_tou_eventDate'),
            models.Index(fields=['status'], name='idx_tou_status'),
            models.Index(fields=['gameName'], name='idx_tou_gameName'),
        ]

    def __str__(self):
        return f"{self.tournamentTitle} - {self.gameName}"
    
    def save(self, *args, **kwargs):
        self.full_clean()  
        super(Tournament, self).save(*args, **kwargs)