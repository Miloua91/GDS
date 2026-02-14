from django.contrib.auth.models import AbstractUser
from django.db import models
from .roles import Permission
from .services import Service


class Utilisateur(AbstractUser):
    ROLE_CHOICES = [
        ("ADMIN", "Administrateur"),
        ("PHARMACIEN", "Pharmacien"),
        ("TECHNICIEN", "Technicien"),
        ("MEDECIN", "Médecin"),
        ("RESPONSABLE", "Responsable"),
        ("CONSULTANT", "Consultant"),
    ]

    fonction = models.CharField(max_length=100, choices=ROLE_CHOICES, blank=True, null=True)
    specialite = models.CharField(max_length=100, blank=True, null=True)
    telephone = models.CharField(max_length=50, blank=True, null=True)
    numero_ordre = models.CharField(max_length=50, blank=True, null=True)
    
    role = models.ForeignKey(
        'core.Role',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='utilisateurs'
    )

    service = models.ForeignKey(
        Service,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='utilisateurs'
    )

    def __str__(self):
        return self.username
    
    def get_permissions(self):
        """Get all permissions based on user's role"""
        if self.role:
            return self.role.permissions.all()
        return Permission.objects.none()
    
    def has_permission(self, resource, action):
        """Check if user has specific permission"""
        if self.is_superuser:
            return True
        if self.role:
            return self.role.has_permission(resource, action)
        return False
