from django.db import models
from .base import BaseModel

class Fournisseur(BaseModel):
    code_fournisseur = models.CharField(max_length=50, unique=True)
    raison_sociale = models.CharField(max_length=300)
    sigle = models.CharField(max_length=50, blank=True, null=True)

    TYPE_CHOICES = [
        ("FABRICANT", "Fabricant"),
        ("GROSSISTE", "Grossiste"),
        ("IMPORTATEUR", "Importateur"),
        ("ETABLISSEMENT_PUBLIC", "Etablissement Public"),
    ]
    type_fournisseur = models.CharField(max_length=50, choices=TYPE_CHOICES)

    categorie = models.CharField(max_length=50, blank=True, null=True)

    adresse = models.TextField(blank=True, null=True)
    wilaya = models.CharField(max_length=100, blank=True, null=True)
    commune = models.CharField(max_length=100, blank=True, null=True)

    telephone = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)

    nom_contact = models.CharField(max_length=200, blank=True, null=True)
    telephone_contact = models.CharField(max_length=50, blank=True, null=True)

    statut = models.CharField(max_length=20, default="ACTIF")

    def __str__(self):
        return f"{self.code_fournisseur} - {self.raison_sociale}"
