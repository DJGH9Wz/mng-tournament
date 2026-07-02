from django.db import models

class Team(models.Model):
    
    teamName = models.CharField(max_length=100, unique=True)
    logoUrl = models.URLField(max_length=255, null=True, blank=True)
    status = models.BooleanField(default=True) 
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'teams'
        ordering = ['teamName']
        indexes = [
            models.Index(fields=['status'], name='idx_tea_status'),
        ]

    def __str__(self):
        return self.teamName
    
    def save(self, *args, **kwargs):
        if self.teamName:
            self.teamName = self.teamName.strip()  
        self.full_clean()                         
        super(Team, self).save(*args, **kwargs)