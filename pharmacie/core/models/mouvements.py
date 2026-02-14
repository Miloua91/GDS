from django.db import models
from .base import BaseModel
from .produits import Produit
from .stocks import LotProduit
from .magasins import Magasin


class MouvementStock(BaseModel):
    numero_mouvement = models.CharField(max_length=100, unique=True)

    produit = models.ForeignKey(Produit, on_delete=models.CASCADE)
    lot = models.ForeignKey(LotProduit, on_delete=models.SET_NULL, null=True)

    TYPE_CHOICES = [
        ("ENTREE_ACHAT", "Entrée Achat"),
        ("SORTIE_SERVICE", "Sortie Service"),
        ("TRANSFERT", "Transfert"),
        ("PERIME", "Périmé"),
        ("AJUSTEMENT", "Ajustement"),
    ]

    type_mouvement = models.CharField(max_length=50, choices=TYPE_CHOICES)

    quantite = models.IntegerField()

    magasin_source = models.ForeignKey(
        Magasin,
        on_delete=models.SET_NULL,
        null=True,
        related_name="sorties"
    )

    magasin_destination = models.ForeignKey(
        Magasin,
        on_delete=models.SET_NULL,
        null=True,
        related_name="entrees"
    )

    date_mouvement = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.numero_mouvement} - {self.type_mouvement}"
