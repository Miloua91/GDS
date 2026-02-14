from django.db import models
from .base import BaseModel


class Produit(BaseModel):

    TYPE_PRODUIT_CHOICES = [
        ("MEDICAMENT", "Médicament"),
        ("DISPOSITIF_MEDICAL", "Dispositif médical"),
        ("CONSOMMABLE", "Consommable"),
        ("REACTIF", "Réactif"),
        ("GAZ_MEDICAL", "Gaz médical"),
    ]

    CATEGORIE_SURVEILLANCE_CHOICES = [
        ("NORMAL", "Normal"),
        ("PSYCHOTROPE", "Psychotrope"),
        ("STUPEFIANT", "Stupéfiant"),
        ("PRODUIT_SANG", "Produit sanguin"),
        ("ONCOLOGIE", "Oncologie"),
    ]

    STATUT_CHOICES = [
        ("ACTIF", "Actif"),
        ("INACTIF", "Inactif"),
        ("RETIRE", "Retiré"),
        ("RUPTURE_NATIONALE", "Rupture nationale"),
    ]

    code_national = models.CharField(max_length=50, unique=True)
    code_interne = models.CharField(max_length=20, unique=True, blank=True, null=True)

    denomination = models.CharField(max_length=500)
    denomination_commerciale = models.CharField(max_length=500, blank=True, null=True)

    forme_pharmaceutique = models.CharField(max_length=100)
    dosage = models.CharField(max_length=100)

    dci = models.CharField(max_length=200, blank=True, null=True)
    classe_therapeutique = models.CharField(max_length=200, blank=True, null=True)

    conditionnement = models.CharField(max_length=200)
    unite_mesure = models.CharField(max_length=20)
    quantite_par_unite = models.IntegerField(default=1)

    stock_securite = models.IntegerField(default=0)
    stock_alerte = models.IntegerField(default=0)

    duree_peremption_mois = models.IntegerField(blank=True, null=True)

    temperature_conservation = models.CharField(max_length=50, blank=True, null=True)
    necessite_chaine_froid = models.BooleanField(default=False)

    type_produit = models.CharField(
        max_length=50, choices=TYPE_PRODUIT_CHOICES, default="MEDICAMENT"
    )

    categorie_surveillance = models.CharField(
        max_length=50,
        choices=CATEGORIE_SURVEILLANCE_CHOICES,
        default="NORMAL",
    )

    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default="ACTIF")

    fabricant = models.CharField(max_length=200, blank=True, null=True)
    numero_amm = models.CharField(max_length=100, blank=True, null=True)

    actif = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.denomination} ({self.dosage})"
