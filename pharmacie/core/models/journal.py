from django.db import models
from .base import BaseModel


class Journal(BaseModel):
    CATEGORIES = [
        ('COMMANDE', 'Commande'),
        ('STOCK', 'Stock'),
        ('PRODUIT', 'Produit'),
        ('UTILISATEUR', 'Utilisateur'),
        ('SYSTEM', 'System'),
    ]

    ACTIONS = [
        ('CREATE', 'Creation'),
        ('UPDATE', 'Modification'),
        ('DELETE', 'Suppression'),
        ('VALIDATE', 'Validation'),
        ('ANNUL', 'Annulation'),
        ('LIVRE', 'Livraison'),
        ('RECEPTION', 'Reception'),
    ]

    categorie = models.CharField(max_length=20, choices=CATEGORIES)
    action = models.CharField(max_length=20, choices=ACTIONS)
    description = models.TextField()
    
    utilisateur = models.ForeignKey(
        'Utilisateur',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='journals'
    )
    
    entity_type = models.CharField(max_length=50, blank=True, null=True)
    entity_id = models.IntegerField(blank=True, null=True)
    entity_description = models.CharField(max_length=255, blank=True, null=True)
    
    ancien_statut = models.CharField(max_length=50, blank=True, null=True)
    nouveau_statut = models.CharField(max_length=50, blank=True, null=True)
    
    details = models.JSONField(default=dict, blank=True)

    class Meta:
        app_label = 'core'
        ordering = ['-date_creation']
        verbose_name = 'Journal'
        verbose_name_plural = 'Journals'

    def __str__(self):
        return f"{self.categorie} - {self.action} - {self.date_creation}"
