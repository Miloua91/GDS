from django.db import models

class BaseModel(models.Model):
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    utilisateur_creation = models.CharField(max_length=100, blank=True, null=True)
    utilisateur_modification = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        abstract = True
