from django.db import models
from .base import BaseModel
from .commandes import CommandeService
from .produits import Produit

class LigneCommandeService(BaseModel):
    commande = models.ForeignKey(
        CommandeService,
        on_delete=models.CASCADE,
        related_name="lignes"
    )

    produit = models.ForeignKey(Produit, on_delete=models.CASCADE)

    quantite_demandee = models.IntegerField()
    quantite_livree = models.IntegerField(default=0)

    statut = models.CharField(max_length=30, default="EN_ATTENTE")

    def __str__(self):
        return f"{self.produit} - {self.quantite_demandee}"
