from django.db import models
from .base import BaseModel
from .magasins import Magasin

class Service(BaseModel):
    code_service = models.CharField(max_length=50, unique=True)
    nom = models.CharField(max_length=200)

    type_service = models.CharField(max_length=50, blank=True, null=True)
    specialite = models.CharField(max_length=100, blank=True, null=True)

    nombre_lits = models.IntegerField(default=0)

    actif = models.BooleanField(default=True)

    magasin = models.ForeignKey(
        Magasin,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="services"
    )

    def __str__(self):
        return self.nom

