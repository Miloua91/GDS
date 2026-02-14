from django.db import models
from .base import BaseModel

class LotProduit(BaseModel):
    produit = models.ForeignKey("Produit", on_delete=models.CASCADE)

    numero_lot = models.CharField(max_length=100)

    date_fabrication = models.DateField(blank=True, null=True)
    date_peremption = models.DateField()
    date_reception = models.DateField()

    quantite_initiale = models.IntegerField()
    quantite_actuelle = models.IntegerField()
    quantite_reservee = models.IntegerField(default=0)

    statut = models.CharField(
        max_length=30,
        default="DISPONIBLE"
    )

    prix_unitaire_achat = models.DecimalField(
        max_digits=15, decimal_places=2, blank=True, null=True
    )

    class Meta:
        unique_together = ("produit", "numero_lot")

    def __str__(self):
        return f"{self.produit} - Lot {self.numero_lot}"
