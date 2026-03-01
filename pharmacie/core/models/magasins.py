from django.db import models
from .base import BaseModel


class Magasin(BaseModel):
    code_magasin = models.CharField(max_length=50, unique=True)
    nom = models.CharField(max_length=200)

    TYPE_CHOICES = [
        ("PRINCIPAL", "Principal"),
        ("HORS_CIRCLE", "Hors Circuit (Urgence Grave)"),
        ("URGENCE", "Urgence"),
        ("PSYCHOTROPES", "Psychotropes"),
        ("CHAINE_FROID", "Chaine froid"),
        ("CONSOMMABLES", "Consommables"),
    ]

    type_magasin = models.CharField(max_length=50, choices=TYPE_CHOICES)

    batiment = models.CharField(max_length=100, blank=True, null=True)
    etage = models.CharField(max_length=50, blank=True, null=True)

    niveau_securite = models.CharField(max_length=30, default="STANDARD")

    actif = models.BooleanField(default=True)

    def __str__(self):
        return self.nom
