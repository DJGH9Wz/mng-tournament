import uuid
from django.db import models
from django.contrib.auth.models import User

class Team(models.Model):
    teamName = models.CharField(max_length=100, unique=True)
    logoUrl = models.TextField(null=True, blank=True)
    
    # El capitán del equipo (apunta a User)
    captain = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        db_column='captain_id',
        related_name='captained_teams'
    )
    
    # Dejamos default como un string vacío o None para evitar serializaciones complejas
    inviteCode = models.CharField(
        max_length=6, 
        null=True,
        blank=True,
        default=""
    )
    
    status = models.BooleanField(default=True) 
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'teams'
        ordering = ['teamName']
        indexes = [
            models.Index(fields=['status'], name='idx_tea_status'),
            models.Index(fields=['inviteCode'], name='idx_tea_invite_code'),
        ]

    def __str__(self):
        return self.teamName
    
    def save(self, *args, **kwargs):
        if self.teamName:
            self.teamName = self.teamName.strip()  
        
        # Si el equipo no tiene un código de invitación asignado, lo generamos aquí
        if not self.inviteCode or self.inviteCode.strip() == "":
            self.inviteCode = uuid.uuid4().hex[:6].upper()
        else:
            self.inviteCode = self.inviteCode.strip().upper()
            
        self.full_clean()                                  
        super(Team, self).save(*args, **kwargs)