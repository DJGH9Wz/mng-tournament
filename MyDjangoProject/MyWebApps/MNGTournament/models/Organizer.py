from django.db import models

class Organizer(models.Model):
    organizationName = models.CharField(max_length=150, unique=True)
    email = models.EmailField(max_length=100, unique=True)
    
    # Cambio a URLField para validación automática de enlaces web
    website = models.URLField(max_length=255, null=True, blank=True, unique=True)
    
    status = models.BooleanField(default=True)
    
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'organizers'
        ordering = ['organizationName']
        indexes = [
            models.Index(fields=['status'], name='idx_org_status'),
        ]

    def save(self, *args, **kwargs):
        super(Organizer, self).save(*args, **kwargs)

    def __str__(self):
        return self.organizationName