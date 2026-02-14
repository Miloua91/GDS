from django.db import models
from .base import BaseModel
from .services import Service

class CommandeService(BaseModel):
    numero_commande = models.CharField(max_length=100, unique=True)

    service = models.ForeignKey(Service, on_delete=models.CASCADE)

    statut = models.CharField(
        max_length=30,
        default="BROUILLON"
    )

    priorite = models.CharField(
        max_length=20,
        default="NORMALE"
    )

    date_demande = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.numero_commande
